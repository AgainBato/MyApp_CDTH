using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using DrinkShop.Application.Interfaces;
using DrinkShop.WebApi.Utilities;

namespace DrinkShop.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class GioHangController : ControllerBase
    {
        private readonly IGioHangService _gioHangService;

        public GioHangController(IGioHangService gioHangService)
        {
            _gioHangService = gioHangService;
        }
        // ✅ Thêm sản phẩm vào giỏ
        [HttpPost("add")]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartRequest request)
        {
            // Lấy UserID (Đoạn này giữ nguyên của bạn)
            var userId = int.Parse(User.FindFirst("IDTaiKhoan")?.Value ?? "0");

            // 👇 SỬA DÒNG NÀY: Thêm "request." vào trước tên biến
            var cart = await _gioHangService.AddToCartAsync(userId, request.IDSanPham, request.SoLuong);
            
            return ResponseHelper.Success(cart, "Thêm sản phẩm vào giỏ hàng thành công");
        }
        
        // ✅ Lấy giỏ hàng của user hiện tại
        [HttpGet]
        public async Task<IActionResult> GetCart()
        {
            try 
            {
                // 1. Lấy UserID an toàn hơn (phòng trường hợp Token lưu "id" thường hoặc "IDTaiKhoan")
                var idClaim = User.FindFirst("IDTaiKhoan") ?? User.FindFirst("id") ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
                
                if (idClaim == null) 
                {
                    // Nếu không tìm thấy ID -> Token sai -> Báo lỗi 401
                    return Unauthorized(new { success = false, message = "Không xác định được User. Vui lòng đăng nhập lại." });
                }

                var userId = int.Parse(idClaim.Value);
                var cart = await _gioHangService.GetByUserIdAsync(userId);

                // 2. SỬA QUAN TRỌNG: Nếu giỏ null -> Trả về mảng rỗng [] (Success) thay vì lỗi 404
                if (cart == null || cart.GioHangSanPhams == null || !cart.GioHangSanPhams.Any())
                {
                    return ResponseHelper.Success(new List<object>(), "Giỏ hàng trống");
                }

                // 3. Mapping dữ liệu để khớp 100% với Frontend React Native
                // Frontend đang cần: idSanPham, tenSanPham, gia, imageUrl, soLuong
                    var result = cart.GioHangSanPhams.Select(item => new 
                    {
                        idSanPham = item.IDSanPham,
                        tenSanPham = item.SanPham?.TenSanPham ?? "Sản phẩm không tồn tại",
                        gia = item.SanPham?.Gia ?? 0,
                        imageUrl = item.SanPham?.ImageUrl ?? "",
                        soLuong = item.SoLuong
                    }).ToList();

                return ResponseHelper.Success(result, "Lấy giỏ hàng thành công");
            }
            catch (Exception ex)
            {
                // In lỗi ra màn hình đen Console của Server để dễ sửa
                Console.WriteLine("❌ Lỗi GetCart: " + ex.ToString());
                return StatusCode(500, "Lỗi Server: " + ex.Message);
            }
        }


        // ✅ Xóa sản phẩm khỏi giỏ
        [HttpDelete("remove")]
        public async Task<IActionResult> RemoveFromCart(int IDSanPham)
        {
            var userId = int.Parse(User.FindFirst("IDTaiKhoan")?.Value ?? "0");
            var result = await _gioHangService.RemoveFromCartAsync(userId, IDSanPham);

            if (!result)
                return ResponseHelper.Error("Không tìm thấy sản phẩm trong giỏ hàng", 404);

            return ResponseHelper.Success<object?>(null, "Xóa sản phẩm khỏi giỏ hàng thành công");
        }
        // ✅ Cập nhật số lượng sản phẩm trong giỏ
        [HttpPut("update")]
        public async Task<IActionResult> UpdateQuantity(int IDSanPham, int soLuongMoi)
        {
            var userId = int.Parse(User.FindFirst("IDTaiKhoan")?.Value ?? "0");
            var cart = await _gioHangService.UpdateQuantityAsync(userId, IDSanPham, soLuongMoi);

            if (cart == null)
                return ResponseHelper.Error("Không tìm thấy sản phẩm trong giỏ hàng", 404);

            return ResponseHelper.Success(cart, "Cập nhật số lượng sản phẩm thành công");
        }

        // ✅ Xóa toàn bộ giỏ hàng  
        [HttpDelete("clear")]
        public async Task<IActionResult> ClearCart()
        {
            var userId = int.Parse(User.FindFirst("IDTaiKhoan")?.Value ?? "0");
            await _gioHangService.ClearCartAsync(userId);
            return ResponseHelper.Success<object?>(null, "Đã xóa toàn bộ giỏ hàng");

        }
    }
}
public class AddToCartRequest
{
    public int IDSanPham { get; set; }
    public int SoLuong { get; set; }
}
