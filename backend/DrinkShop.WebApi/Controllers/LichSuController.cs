using Microsoft.AspNetCore.Mvc;
using DrinkShop.Application.Interfaces;
using DrinkShop.WebApi.Utilities; 
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims; 

namespace DrinkShop.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    // 👇 SỬA: Cho phép Quản lý và Nhân viên được nhập/xuất kho
    [Authorize(Roles = "Quan ly,NhanVien")] 
    public class LichSuKhoController : ControllerBase
    {
        private readonly INguyenLieuService _nguyenLieuService;

        public LichSuKhoController(INguyenLieuService nguyenLieuService)
        {
            _nguyenLieuService = nguyenLieuService;
        }

        // 1. LẤY LỊCH SỬ
        [HttpGet]
        public async Task<IActionResult> GetHistory([FromQuery] int? IDNguyenLieu)
        {
            try
            {
                var history = await _nguyenLieuService.GetHistoryAsync(IDNguyenLieu);
                
                var result = history.Select(h => new 
                {
                    h.IDNguyenLieu,
                    TenNguyenLieu = h.NguyenLieu?.TenNguyenLieu ?? "Đã xóa",
                    h.SoLuongThayDoi,     
                    h.SoLuongSauKhiDoi,   
                    h.LyDo,               
                    h.NguoiThucHien,      
                    NgayTao = h.NgayTao.ToString("dd/MM/yyyy HH:mm:ss")
                });

                return ResponseHelper.Success(result, "Lấy lịch sử kho thành công");
            }
            catch (Exception ex)
            {
                return ResponseHelper.Error(ex.Message, 500);
            }
        }

        // 2. NHẬP KHO (Import)
        [HttpPost("import")]
        public async Task<IActionResult> ImportIngredient([FromBody] NhapKhoRequest req)
        {
            // Kiểm tra dữ liệu đầu vào
            if (req.SoLuongNhap <= 0) 
                return ResponseHelper.Error("Số lượng nhập phải lớn hơn 0", 400);

            try
            {
                // Lấy tên người dùng từ Token (nếu không có thì lấy "Unknown")
                string username = User.Identity?.Name ?? "Unknown";
                
                // Gọi Service
                await _nguyenLieuService.ImportIngredientAsync(req.IDNguyenLieu, req.SoLuongNhap, req.GhiChu, username);

                return ResponseHelper.Success<object>(null, "Nhập kho thành công");
            }
            catch (Exception ex)
            {
                // Trả về lỗi 400 kèm message để Frontend hiển thị
                return ResponseHelper.Error(ex.Message, 400);
            }
        }

        // 3. HỦY HÀNG / XUẤT KHO (Discard)
        [HttpPost("discard")]
        public async Task<IActionResult> DiscardIngredient([FromBody] DiscardRequest req)
        {
            if (req.SoLuongHuy <= 0) 
                return ResponseHelper.Error("Số lượng hủy phải lớn hơn 0", 400);

            try
            {
                string username = User.Identity?.Name ?? "Unknown";
                await _nguyenLieuService.DiscardIngredientAsync(req.IDNguyenLieu, req.SoLuongHuy, req.LyDo, username);

                return ResponseHelper.Success<object>(null, "Đã hủy nguyên liệu thành công");
            }
            catch (Exception ex)
            {
                return ResponseHelper.Error(ex.Message, 400);
            }
        }

        // 4. XÓA NGUYÊN LIỆU (Ẩn)
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _nguyenLieuService.DeleteAsync(id);
                return ResponseHelper.Success<object>(null, "Đã xóa nguyên liệu");
            }
            catch (Exception ex)
            {
                return ResponseHelper.Error(ex.Message, 400);
            }
        }
    }
    
    // --- DTO CLASSES ---
    public class NhapKhoRequest
    {
        public int IDNguyenLieu { get; set; }
        public double SoLuongNhap { get; set; } 
        public string GhiChu { get; set; } = "Nhập hàng từ NCC"; 
    }

    public class DiscardRequest
    {
        public int IDNguyenLieu { get; set; }
        public double SoLuongHuy { get; set; } 
        public string LyDo { get; set; } = "Hết hạn sử dụng"; 
    }
}