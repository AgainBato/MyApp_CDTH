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
using DrinkShop.Application.DTO;
using DrinkShop.WebApi.DTO;
using System.Security.Cryptography;
using DrinkShop.Application.Interfaces;

namespace DrinkShop.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private readonly IGroqService _groqService; // Dùng Interface thay vì Class
        private readonly ApplicationDbContext _context;

        public ChatController(IGroqService groqService, ApplicationDbContext context)
        {
            _groqService = groqService;
            _context = context;
        }

        [Authorize] // Đảm bảo người dùng đã đăng nhập để lấy ID cá nhân
        [HttpPost]
        public async Task<IActionResult> Ask([FromBody] ChatRequest request)
        {
            // 1. Lấy UserId từ Claims của Token
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int.TryParse(userIdClaim, out int userId);

            // 2. Lấy Danh mục sản phẩm để AI biết quán có những loại gì
            var categories = await _context.PhanLoais.Select(c => c.Ten).ToListAsync();
            string categoryContext = "Quán có các loại đồ uống: " + string.Join(", ", categories);
            // 3. Lấy Top món đánh giá tốt (>= 4 sao)
            var topRated = await _context.SanPhams
                .Where(p => p.DanhGias.Any())
                .Select(p => new {
                    p.TenSanPham,
                    p.Gia,
                    AvgStars = p.DanhGias.Average(d => d.SoSao)
                })
                .Where(x => x.AvgStars >= 4)
                .OrderByDescending(x => x.AvgStars)
                .Take(5)
                .ToListAsync();

            // 4. Lấy Lịch sử đơn hàng gần đây của khách
            var recentOrders = await _context.DonHangs
                .Where(d => d.IDTaiKhoan == userId)
                .OrderByDescending(d => d.NgayTao)
                .Take(5)
                .Select(d => new { d.IDDonHang, d.TinhTrang, d.TongTien, d.NgayTao })
                .ToListAsync();

            // 5. Xây dựng chuỗi Context (Ngữ cảnh) chi tiết cho AI
            var sb = new StringBuilder();
            sb.AppendLine("--- THÔNG TIN CỬA HÀNG ---");
            sb.AppendLine($"- Danh mục: {string.Join(", ", categories)}");
            sb.AppendLine("- Món ngon khách khen: " + string.Join(", ", topRated.Select(t => $"{t.TenSanPham} ({Math.Round(t.AvgStars, 1)}⭐ - {t.Gia}đ)")));
            
            sb.AppendLine("\n--- DỮ LIỆU KHÁCH HÀNG ---");
            if (recentOrders.Any()) {
                sb.AppendLine("Các đơn hàng gần đây của khách: " + 
                    string.Join("; ", recentOrders.Select(o => $"Đơn #{o.IDDonHang} ({o.TinhTrang}) ngày {o.NgayTao:dd/MM} tổng {o.TongTien}đ")));
            } else {
                sb.AppendLine("Khách hàng này chưa có đơn hàng nào.");
            }

            // Gọi GroqService với ngữ cảnh mới
            var answer = await _groqService.GetAiResponseAsync(request.Messages, sb.ToString());

            return Ok(new { answer });
        }
    }
}