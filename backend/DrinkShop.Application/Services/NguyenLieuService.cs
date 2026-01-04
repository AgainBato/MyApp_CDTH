using DrinkShop.Application.Interfaces;
using DrinkShop.Infrastructure;
using DrinkShop.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DrinkShop.Application.Services
{
    public class NguyenLieuService : INguyenLieuService
    {
        private readonly ApplicationDbContext _context;

        public NguyenLieuService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<NguyenLieu>> GetAllAsync()
        {
            // ✅ Sửa Nguyenlieu -> NguyenLieu
            return await _context.NguyenLieu.Where(n => !n.IsDeleted).ToListAsync();
        }

        public async Task<NguyenLieu?> GetByIdAsync(int id)
        {
            // ✅ Sửa Nguyenlieu -> NguyenLieu
            return await _context.NguyenLieu.FindAsync(id);
        }

        public async Task ImportIngredientAsync(int id, double soLuong, string ghiChu, string username)
        {
            if (soLuong <= 0) throw new Exception("Số lượng nhập phải lớn hơn 0");

            // ✅ Sửa Nguyenlieu -> NguyenLieu
            var item = await _context.NguyenLieu.FindAsync(id);
            if (item == null) throw new Exception("Không tìm thấy nguyên liệu");

            decimal luongNhap = (decimal)soLuong;
            decimal tonKhoCu = item.SoLuongTon ?? 0;
            
            // Cập nhật kho
            item.SoLuongTon = tonKhoCu + luongNhap;

            // Ghi lịch sử
            var log = new LichSuKho
            {
                IDNguyenLieu = id,
                SoLuongThayDoi = luongNhap,
                // ✅ Giờ dòng này sẽ hết lỗi vì bên Entity đã có
                SoLuongSauKhiDoi = item.SoLuongTon ?? 0, 
                LyDo = string.IsNullOrEmpty(ghiChu) ? "Nhập hàng mới" : ghiChu,
                NguoiThucHien = username,
                NgayTao = DateTime.Now
            };
            _context.LichSuKho.Add(log); // Chú ý tên DbSet LichSuKhos

            await _context.SaveChangesAsync();
        }

        public async Task DiscardIngredientAsync(int id, double soLuong, string lyDo, string username)
        {
            if (soLuong <= 0) throw new Exception("Số lượng hủy phải lớn hơn 0");

            // ✅ Sửa Nguyenlieu -> NguyenLieu
            var item = await _context.NguyenLieu.FindAsync(id);
            if (item == null) throw new Exception("Không tìm thấy nguyên liệu");

            decimal slHuy = (decimal)soLuong;
            decimal tonKhoHienTai = item.SoLuongTon ?? 0;

            if (tonKhoHienTai < slHuy) throw new Exception("Không đủ hàng để hủy");

            item.SoLuongTon = tonKhoHienTai - slHuy;

            var log = new LichSuKho
            {
                IDNguyenLieu = id,
                SoLuongThayDoi = -slHuy,
                // ✅ Giờ dòng này sẽ hết lỗi
                SoLuongSauKhiDoi = item.SoLuongTon ?? 0,
                LyDo = lyDo,
                NguoiThucHien = username,
                NgayTao = DateTime.Now
            };
            _context.LichSuKho.Add(log);

            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            // ✅ Sửa Nguyenlieu -> NguyenLieu
            var item = await _context.NguyenLieu.FindAsync(id);
            if (item == null) throw new Exception("Không tìm thấy nguyên liệu");
            
            item.IsDeleted = true;
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<LichSuKho>> GetHistoryAsync(int? nguyenLieuId)
        {
            var query = _context.LichSuKho
                .Include(h => h.NguyenLieu) // ✅ Giờ dòng này sẽ hết lỗi vì Entity đã có NguyenLieu
                .AsQueryable();

            if (nguyenLieuId.HasValue)
            {
                query = query.Where(h => h.IDNguyenLieu == nguyenLieuId.Value);
            }

            return await query.OrderByDescending(h => h.NgayTao).ToListAsync();
        }
    }
}