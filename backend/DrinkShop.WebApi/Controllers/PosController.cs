using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DrinkShop.Application.DTO;
using DrinkShop.Application.Interfaces;
using DrinkShop.Application.constance;
using System.Threading.Tasks;
using System;

namespace DrinkShop.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    // Chỉ Quản lý và Nhân viên được phép tạo đơn
    [Authorize(Roles = "Quan ly,NhanVien")]
    public class PosController : ControllerBase
    {
        private readonly IPosService _posService;

        public PosController(IPosService posService)
        {
            _posService = posService;
        }

        [HttpPost("create-order")]
        public async Task<IActionResult> CreateOrder([FromBody] PosCreateOrderDto request)
        {
            try
            {
                // 👇 CẤU HÌNH QUAN TRỌNG:
                // Đây là ID của tài khoản "Khách Vãng Lai" hoặc "Guest" dùng chung cho POS.
                // Bạn hãy thay số 10 bằng ID thật bạn tìm thấy trong SQL (SELECT * FROM TAIKHOAN)
                // Ví dụ: Nếu ID tài khoản khách lẻ là 5 thì sửa thành: int guestId = 5;
                int guestId = 5; 

                var receipt = await _posService.CreateAndPayPosOrderAsync(request, guestId);

                return Ok(new 
                { 
                    message = "Tạo đơn thành công!", 
                    data = receipt 
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}