using DrinkShop.WebApi.Utilities; // Chứa ResponseHelper
using DrinkShop.Domain.Entities;   // Chứa NguyenLieu
using DrinkShop.Infrastructure;    // Chứa ApplicationDbContext
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DrinkShop.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NguyenLieuController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public NguyenLieuController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ==========================================
        // 1. LẤY DANH SÁCH (Có tìm kiếm)
        // ==========================================
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? search)
        {
            // SỬA: Dùng _context.NguyenLieu (số ít theo DbContext)
            var query = _context.NguyenLieu.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(n => n.TenNguyenLieu.Contains(search));
            }

            var list = await query.OrderByDescending(n => n.IDNguyenLieu).ToListAsync();
            
            return ResponseHelper.Success(list, "Lấy dữ liệu thành công");
        }

        // ==========================================
        // 2. THÊM NGUYÊN LIỆU MỚI
        // ==========================================
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] NguyenLieu model)
        {
            if (string.IsNullOrEmpty(model.TenNguyenLieu))
                return ResponseHelper.Error("Tên nguyên liệu không được để trống", 400);

            // SỬA: Bỏ dòng gán NgayCapNhat và NguongCanhBao vì Entity không có

            _context.NguyenLieu.Add(model);
            await _context.SaveChangesAsync();

            return ResponseHelper.Success(model, "Thêm nguyên liệu thành công");
        }

        // ==========================================
        // 3. CẬP NHẬT (Sửa tên, Nhập kho...)
        // ==========================================
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] NguyenLieu model)
        {
            var item = await _context.NguyenLieu.FindAsync(id);
            if (item == null) return ResponseHelper.Error("Không tìm thấy nguyên liệu", 404);

            item.TenNguyenLieu = model.TenNguyenLieu;
            item.DonViTinh = model.DonViTinh;
            item.SoLuongTon = model.SoLuongTon; // Cập nhật số lượng tồn
            
            // SỬA: Bỏ dòng gán NgayCapNhat

            await _context.SaveChangesAsync();
            return ResponseHelper.Success(item, "Cập nhật thành công");
        }

        // ==========================================
        // 4. XÓA NGUYÊN LIỆU
        // ==========================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var item = await _context.NguyenLieu.FindAsync(id);
            if (item == null) return ResponseHelper.Error("Không tìm thấy nguyên liệu", 404);

            // Kiểm tra xem nguyên liệu có đang dùng trong công thức nào không
            // SỬA: Dùng _context.CongThuc (số ít theo DbContext)
            var isUsed = await _context.CongThuc.AnyAsync(c => c.IDNguyenLieu == id);
            
            if (isUsed)
                return ResponseHelper.Error("Nguyên liệu này đang được dùng trong công thức món, không thể xóa!", 400);

            _context.NguyenLieu.Remove(item);
            await _context.SaveChangesAsync();
            
            return ResponseHelper.Deleted("Xóa thành công");
        }
    }
}