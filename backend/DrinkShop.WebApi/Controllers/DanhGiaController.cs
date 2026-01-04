using Microsoft.AspNetCore.Mvc;
using DrinkShop.Application.Interfaces;
using System.Security.Claims;

[Route("api/[controller]")]
[ApiController]
public class DanhGiaController : ControllerBase
{
    private readonly IDanhGiaService _danhGiaService;

    public DanhGiaController(IDanhGiaService danhGiaService)
    {
        _danhGiaService = danhGiaService;
    }

    // API lấy đánh giá cho trang Chi tiết sản phẩm
    [HttpGet("product/{productId}")]
    public async Task<IActionResult> GetReviews(int productId)
    {
        var result = await _danhGiaService.GetProductReviewSummaryAsync(productId);
        return Ok(new { success = true, data = result });
    }

    // API thực hiện đánh giá (Cần đăng nhập)
    [HttpPost]
    public async Task<IActionResult> PostReview([FromBody] CreateReviewRequest request)
    {
        // Lấy UserId từ Token của người đang đăng nhập
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized("Vui lòng đăng nhập.");

        try 
        {
            var review = await _danhGiaService.AddReviewAsync(
                int.Parse(userIdClaim), 
                request.IdSanPham, 
                request.SoSao, 
                request.BinhLuan
            );
            return Ok(new { success = true, data = review });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }
}

// Model nhận request từ App
public class CreateReviewRequest {
    public int IdSanPham { get; set; }
    public int SoSao { get; set; }
    public string BinhLuan { get; set; } = string.Empty;
}