using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DrinkShop.Application.Interfaces;
using DrinkShop.Application.DTO;
using System;
using System.Threading.Tasks;

namespace DrinkShop.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    // 👇 SỬA: Cho phép Quản lý và Nhân viên xem (hoặc chỉ Quản lý tùy bạn)
    [Authorize(Roles = "Quan ly,NhanVien")] 
    public class ThongKeController : ControllerBase
    {
        private readonly IThongKeService _service;

        public ThongKeController(IThongKeService service)
        {
            _service = service;
        }

        // 1. DOANH THU
        [HttpGet("revenue")]
        public async Task<IActionResult> GetRevenue(
            [FromQuery] string type = "day", 
            [FromQuery] DateTime? fromDate = null, 
            [FromQuery] DateTime? toDate = null)
        {
            try
            {
                var result = await _service.GetRevenueStatisticsAsync(type, fromDate, toDate);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // 2. TOP BÁN CHẠY
        [HttpGet("top-products")]
        public async Task<IActionResult> GetTopProducts([FromQuery] int n = 5)
        {
            try
            {
                var result = await _service.GetTopSellingProductsAsync(n);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // 3. ĐÁNH GIÁ (Thay cho kho)
        [HttpGet("ratings")]
        public async Task<IActionResult> GetRatingStats()
        {
            try
            {
                var result = await _service.GetRatingDistributionAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}