using DrinkShop.Application.Interfaces;
using DrinkShop.Infrastructure;
using DrinkShop.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DrinkShop.Application.Services
{
    public class VoucherService : IVoucherService
    {
        private readonly ApplicationDbContext _context;

        public VoucherService(ApplicationDbContext context)
        {
            _context = context;
        }

        // ✅ Lấy tất cả voucher
        public async Task<IEnumerable<Voucher>> GetAllAsync()
        {
            // Sắp xếp voucher mới nhất lên đầu hoặc voucher đang chạy lên đầu
            return await _context.Vouchers
                .OrderByDescending(v => v.IDVoucher)
                .ToListAsync();
        }

        // ✅ Lấy voucher theo ID
        public async Task<Voucher?> GetByIdAsync(int id)
        {
            return await _context.Vouchers.FindAsync(id);
        }

        // ✅ Lấy voucher theo mô tả
        public async Task<Voucher?> GetByDescriptionAsync(string mota)
        {
            return await _context.Vouchers
                .FirstOrDefaultAsync(v => v.MoTa != null && v.MoTa.Contains(mota));
        }

        // ✅ Tạo voucher mới
        public async Task<Voucher> CreateAsync(Voucher voucher)
        {
            // --- LOGIC MỚI: Tự động set số lượng còn lại ---
            // Khi mới tạo, Số lượng còn lại phải bằng Tổng số lượng phát hành
            voucher.SoLuongConLai = voucher.SoLuong; 

            _context.Vouchers.Add(voucher);
            await _context.SaveChangesAsync();
            return voucher;
        }

        // ✅ Cập nhật voucher
        public async Task<Voucher?> UpdateAsync(int id, Voucher voucher)
        {
            var existing = await _context.Vouchers.FindAsync(id);
            if (existing == null) return null;

            // Cập nhật các trường thông tin cũ
            existing.MoTa = voucher.MoTa;
            existing.GiamGia = voucher.GiamGia;
            existing.ToiDa = voucher.ToiDa;
            existing.BatDau = voucher.BatDau;
            existing.KetThuc = voucher.KetThuc;

            // --- LOGIC MỚI: Cập nhật các cột mới thêm ---
            existing.DieuKienMin = voucher.DieuKienMin; // Điều kiện đơn tối thiểu
            existing.SoLuong = voucher.SoLuong;         // Tổng số lượng
            
            // Lưu ý: Thường thì admin có thể sửa tay số lượng còn lại 
            // (Ví dụ: muốn kết thúc sớm thì sửa về 0, hoặc cấp thêm thì tăng lên)
            existing.SoLuongConLai = voucher.SoLuongConLai; 

            await _context.SaveChangesAsync();
            return existing;
        }

        // ✅ Xóa voucher
        public async Task<bool> DeleteAsync(int id)
        {
            var v = await _context.Vouchers.FindAsync(id);
            if (v == null) return false;

            _context.Vouchers.Remove(v);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}