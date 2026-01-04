using Microsoft.AspNetCore.Mvc;
using DrinkShop.Domain.Entities;
using DrinkShop.Infrastructure;
using Microsoft.EntityFrameworkCore;
using DrinkShop.WebApi.DTO.Auth;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DrinkShop.WebApi.Utilities;
using DrinkShop.WebApi.DTO.ApiResponse;
using Microsoft.AspNetCore.Authorization;
using DrinkShop.Application.constance;
using FirebaseAdmin.Auth;
using DrinkShop.WebApi.DTO;
using System.Security.Cryptography;
using DrinkShop.Application.Interfaces;
using System.Text.RegularExpressions;


namespace DrinkShop.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config;

        // 👇 2. KHAI BÁO BIẾN Ở ĐÂY (Để sửa lỗi gạch đỏ thứ 1 và 3)
        private readonly IFileStorageService _fileStorageService;

        // 👇 3. SỬA LẠI CONSTRUCTOR ĐỂ NHẬN SERVICE
        public AuthController(
            ApplicationDbContext context, 
            IConfiguration config,
            IFileStorageService fileStorageService) // <--- Thêm tham số này
        {
            _context = context;
            _config = config;
            _fileStorageService = fileStorageService; // <--- Gán giá trị vào biến
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto request)
        {
            // 1. Kiểm tra họ tên không được có khoảng trắng ở đầu
            if (request.HoTen.StartsWith(" "))
                return ResponseHelper.Error("Họ tên không được bắt đầu bằng khoảng trắng!", 400);

            // 2. Kiểm tra mật khẩu không được quá ngắn (ví dụ tối thiểu 6 ký tự)
            if (string.IsNullOrWhiteSpace(request.MatKhau) || request.MatKhau.Length < 6)
                return ResponseHelper.Error("Mật khẩu phải có ít nhất 6 ký tự!", 400);

            // 3. Kiểm tra họ tên không được có số và ký tự đặc biệt
            // Sử dụng Regex: ^[\p{L}\s]+$ (Chỉ chấp nhận chữ cái các ngôn ngữ và khoảng trắng)
            if (!Regex.IsMatch(request.HoTen, @"^[\p{L}\s]+$"))
                return ResponseHelper.Error("Họ tên chỉ được chứa chữ cái và khoảng trắng, không bao gồm số hay ký tự đặc biệt!", 400);

            // Kiểm tra email tồn tại
            var existingEmail = await _context.TaiKhoans.AnyAsync(u => u.Email == request.Email);
            if (existingEmail)
                return ResponseHelper.Error("Email này đã được sử dụng!", 400);

            var newUser = new TaiKhoan
            {
                HoTen = request.HoTen.Trim(), // Nên Trim() để loại bỏ khoảng trắng thừa ở cuối
                Email = request.Email,
                MatKhau = BCrypt.Net.BCrypt.HashPassword(request.MatKhau),
                IDVaiTro = 3
            };

            try
            {
                _context.TaiKhoans.Add(newUser);
                await _context.SaveChangesAsync();
                return ResponseHelper.Success("Đăng ký thành công!");
            }
            catch (Exception ex)
            {
                var msg = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                return StatusCode(500, new { message = msg });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrEmpty(request.TaiKhoan) || string.IsNullOrEmpty(request.MatKhau))
                return ResponseHelper.Error("Vui lòng nhập tài khoản và mật khẩu!", 400);

            var user = await _context.TaiKhoans
                .Include(u => u.VaiTro)
                .SingleOrDefaultAsync(u => u.Email == request.TaiKhoan || u.HoTen == request.TaiKhoan);

            if (user == null)
                return Unauthorized(new { message = "Sai tài khoản hoặc mật khẩu." });

            if (string.IsNullOrEmpty(user.MatKhau))
                return Unauthorized(new { message = "Tài khoản này đăng nhập bằng Google." });

            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.MatKhau, user.MatKhau);
            if (!isPasswordValid)
                return Unauthorized(new { message = "Sai tài khoản hoặc mật khẩu." });

            return await ProcessLoginSuccess(user, request.RefreshToken);
        }

        [HttpPost("login-google")]
        public async Task<IActionResult> LoginGoogle([FromBody] GoogleLoginRequest request)
        {
            try
            {
                FirebaseToken decodedToken = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(request.Token);
                string email = decodedToken.Claims["email"].ToString();
                string name = decodedToken.Claims.ContainsKey("name") ? decodedToken.Claims["name"].ToString() : "Google User";

                var user = await _context.TaiKhoans
                                         .Include(u => u.VaiTro)
                                         .FirstOrDefaultAsync(u => u.Email == email);

                if (user == null)
                {
                    user = new TaiKhoan
                    {
                        Email = email,
                        HoTen = name,
                        IDVaiTro = 3,
                        MatKhau = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString())
                    };

                    _context.TaiKhoans.Add(user);
                    await _context.SaveChangesAsync();

                    user = await _context.TaiKhoans.Include(u => u.VaiTro).FirstOrDefaultAsync(u => u.IDTaiKhoan == user.IDTaiKhoan);
                }

                return await ProcessLoginSuccess(user, null);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi xác thực Google", error = ex.Message });
            }
        }

        private async Task<IActionResult> ProcessLoginSuccess(TaiKhoan user, string? existingRefreshToken)
        {
            if (!string.IsNullOrEmpty(existingRefreshToken))
            {
                if (user.RefreshToken == existingRefreshToken && user.RefreshTokenExpire > DateTime.Now)
                {
                    var newAccToken = GenerateJwtToken(user);
                    return Ok(new { message = "Refresh token ok", accessToken = newAccToken, refreshToken = user.RefreshToken });
                }
            }

            var accessToken = GenerateJwtToken(user);
            var refreshToken = Guid.NewGuid().ToString();

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpire = DateTime.Now.AddDays(7);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Đăng nhập thành công.",
                accessToken,
                refreshToken,
                user = new { user.IDTaiKhoan, user.HoTen, user.Email }
            });
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordRequest request)
        {
            var user = await _context.TaiKhoans
                .FirstOrDefaultAsync(x => x.Email == request.Email);

            // ⚠️ Không lộ tồn tại user
            if (user == null)
            {
                return Ok(new
                {
                    message = "Nếu tài khoản tồn tại, mã xác thực đã được gửi"
                });
            }

            // 🔐 Sinh token 6 số
            var token = RandomNumberGenerator
                .GetInt32(100000, 999999)
                .ToString();

            user.ResetToken = token;
            user.ResetTokenExpire = DateTime.UtcNow.AddMinutes(10);

            await _context.SaveChangesAsync();

            // 🔴 PROD: gửi mail
            // await _emailService.SendResetPasswordToken(user.Email, token);

        #if DEBUG
            // 🟢 DEV: trả token cho FE
            return Ok(new
            {
                message = "Mã xác thực mới đã được tạo (DEV)",
                token = token
            });
        #else
            // 🔴 PROD: KHÔNG trả token
            return Ok(new
            {
                message = "Nếu tài khoản tồn tại, mã xác thực đã được gửi"
            });
        #endif
        }



        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            // 1️⃣ Validate input sớm (tránh request rác)
            if (string.IsNullOrWhiteSpace(request.Token) ||
                string.IsNullOrWhiteSpace(request.NewPassword))
            {
                return BadRequest(new { message = "Thiếu token hoặc mật khẩu mới" });
            }

            if (request.NewPassword.Length < 6)
            {
                return BadRequest(new { message = "Mật khẩu phải ít nhất 6 ký tự" });
            }

            // 2️⃣ Tìm user theo token (CHƯA check expire vội)
            var user = await _context.TaiKhoans
                .FirstOrDefaultAsync(x => x.ResetToken == request.Token);

            // 3️⃣ Token không tồn tại
            if (user == null)
            {
                return BadRequest(new { message = "Mã xác nhận không hợp lệ" });
            }

            // 4️⃣ Token hết hạn
            if (!user.ResetTokenExpire.HasValue ||
                user.ResetTokenExpire.Value < DateTime.UtcNow)
            {
                return BadRequest(new { message = "Mã xác nhận đã hết hạn" });
            }

            // 5️⃣ Update mật khẩu
            user.MatKhau = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

            // 6️⃣ VÔ HIỆU token ngay lập tức (rất quan trọng)
            user.ResetToken = null;
            user.ResetTokenExpire = null;

            await _context.SaveChangesAsync();

            // 7️⃣ Trả kết quả OK
            return Ok(new
            {
                message = "Đặt lại mật khẩu thành công"
            });
        }



        [Authorize]
        [HttpPut("update-profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto request)
        {
            // Nếu dữ liệu vi phạm các Annotation ở trên, code sẽ không chạy vào đây 
            // (nếu Controller có tag [ApiController])

            var userId = int.Parse(User.FindFirst("IDTaiKhoan")?.Value ?? "0");
            var user = await _context.TaiKhoans.FindAsync(userId);

            if (user == null) 
                return ResponseHelper.Error("Không tìm thấy tài khoản.", 404);

            // Cập nhật thông tin
            if (request.HoTen != null) user.HoTen = request.HoTen;
            if (request.SDT != null) user.SDT = request.SDT;
            if (request.DiaChi != null) user.DiaChi = request.DiaChi;

            await _context.SaveChangesAsync();

            return ResponseHelper.Success(new
            {
                user.IDTaiKhoan,
                user.HoTen,
                user.Email,
                user.SDT,
                user.DiaChi
            }, "Cập nhật thông tin thành công!");
        }
        [Authorize]
        [HttpPost("upload-avatar")]
        public async Task<IActionResult> UploadAvatar(IFormFile file)
        {
            if (file == null || file.Length == 0) 
                return BadRequest(new { message = "Vui lòng chọn ảnh." });

            // Lấy UserId từ Token
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdString, out int userId)) 
                return Unauthorized();

            try
            {
                // 1. Lấy thông tin User hiện tại
                var user = await _context.TaiKhoans.FindAsync(userId);
                if (user == null) return NotFound(new { message = "Người dùng không tồn tại." });

                // 2. Xóa avatar cũ trên ổ cứng (nếu có)
                if (!string.IsNullOrEmpty(user.Avatar))
                {
                    await _fileStorageService.DeleteFileAsync(user.Avatar);
                }

                // 3. Lưu file mới vào thư mục 'avatars' trong wwwroot
                // Service sẽ tự tạo Guid và trả về URL đầy đủ
                string fullUrl = await _fileStorageService.SaveFileAsync(file, "avatars");

                // 4. Cập nhật vào Database
                user.Avatar = fullUrl;
                await _context.SaveChangesAsync();

                return Ok(new { 
                    success = true, 
                    message = "Cập nhật ảnh đại diện thành công", 
                    avatarUrl = fullUrl 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
            }
        }
        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> Me()
        {
            // 1. Lấy UserID từ Token (Dạng chuỗi)
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // Nếu không tìm thấy claim hoặc token lỗi
            if (string.IsNullOrEmpty(userIdString))
            {
                return Unauthorized(new { message = "Không tìm thấy thông tin người dùng trong Token" });
            }

            // 2. Ép kiểu sang int BÊN NGOÀI câu lệnh LINQ (Quan trọng!)
            if (!int.TryParse(userIdString, out int userId))
            {
                return BadRequest(new { message = "ID người dùng không hợp lệ" });
            }

            // 3. Truy vấn Database (Lúc này chỉ so sánh int với int, SQL sẽ hiểu ngay)
            var user = await _context.TaiKhoans
                .Where(x => x.IDTaiKhoan == userId)
                .Select(x => new {
                    x.HoTen,
                    x.SDT,
                    x.DiaChi,
                })
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound(new { message = "Không tìm thấy người dùng" });
            }

            return Ok(user);
        }

        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto request)
        {
            // 1. Lấy thông tin người dùng từ Token
            var userId = int.Parse(User.FindFirst("IDTaiKhoan")?.Value ?? "0");
            var user = await _context.TaiKhoans.FindAsync(userId);

            if (user == null) return ResponseHelper.Error("Lỗi tài khoản.", 404);

            // 2. Kiểm tra tài khoản liên kết (OAuth)
            if (string.IsNullOrEmpty(user.MatKhau))
                return ResponseHelper.Error("Tài khoản Google không thể đổi mật khẩu tại đây.", 400);

            // 3. RÀNG BUỘC: Mật khẩu không được quá ngắn (Ví dụ: tối thiểu 6 ký tự)
            if (string.IsNullOrWhiteSpace(request.MatKhauMoi) || request.MatKhauMoi.Length < 6)
            {
                return ResponseHelper.Error("Mật khẩu mới phải có ít nhất 6 ký tự!", 400);
            }

            // 4. BỔ SUNG: Kiểm tra mật khẩu mới không được trùng mật khẩu cũ
            if (request.MatKhauCu == request.MatKhauMoi)
            {
                return ResponseHelper.Error("Mật khẩu mới không được giống mật khẩu cũ!", 400);
            }

            // 5. Xác minh mật khẩu cũ bằng BCrypt
            bool isOldPasswordCorrect = BCrypt.Net.BCrypt.Verify(request.MatKhauCu, user.MatKhau);
            if (!isOldPasswordCorrect)
            {
                return ResponseHelper.Error("Mật khẩu cũ không chính xác.", 400);
            }

            // 6. Mã hóa và cập nhật mật khẩu mới
            user.MatKhau = BCrypt.Net.BCrypt.HashPassword(request.MatKhauMoi);

            await _context.SaveChangesAsync();
            return ResponseHelper.Success("Đổi mật khẩu thành công!");
        }
        private string GenerateJwtToken(TaiKhoan user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("this_is_a_very_strong_and_secure_secret_key_64_chars_long!"));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            string userRole = user.IDVaiTro switch
            {
                1 => "Quan ly",
                2 => "NhanVien",
                3 => "KhachHang",
                _ => "KhachHang"
            };

            var claims = new List<Claim>
            {
                // 👇 THÊM DÒNG NÀY ĐỂ FIX LỖI /ME 👇
                new Claim(ClaimTypes.NameIdentifier, user.IDTaiKhoan.ToString()),
                // 👆 ---------------------------- 👆

                new Claim(JwtRegisteredClaimNames.Sub, user.Email ?? ""),
                new Claim("IDTaiKhoan", user.IDTaiKhoan.ToString()),
                new Claim(ClaimTypes.Role, userRole),
                new Claim(ClaimTypes.Name, user.HoTen ?? "Unknown")
            };

            if (user.VaiTro != null && !string.IsNullOrEmpty(user.VaiTro.Permission))
            {
                if (user.VaiTro.Permission.Contains(Permissions.FullAccess))
                {
                    var allPermissions = Permissions.GetAllPermissions();
                    foreach (var p in allPermissions) claims.Add(new Claim("Permission", p));
                }
                else
                {
                    var permissionList = user.VaiTro.Permission.Split(',');
                    foreach (var p in permissionList)
                    {
                        if (!string.IsNullOrWhiteSpace(p)) claims.Add(new Claim("Permission", p.Trim()));
                    }
                }
            }

            var token = new JwtSecurityToken(
                issuer: "DrinkShop",
                audience: "DrinkShopClient",
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public class GoogleLoginRequest
        {
            public string Token { get; set; } = "";
        }
    }
}