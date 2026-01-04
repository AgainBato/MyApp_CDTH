using DrinkShop.Application.Interfaces;
using DrinkShop.Infrastructure;
using DrinkShop.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using DrinkShop.Application.constance;

namespace DrinkShop.Application.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly ApplicationDbContext _context;

        public PaymentService(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. CẬP NHẬT PHƯƠNG THỨC THANH TOÁN
        public async Task<DonHang?> CreatePaymentAsync(int userId, int orderId, string pttt)
        {
            var order = await _context.DonHangs
                .FirstOrDefaultAsync(o => o.IDDonHang == orderId && o.IDTaiKhoan == userId);

            if (order == null) return null;

            // Chỉ cho sửa khi đơn đang pending
            if (order.TinhTrang != "Pending" && order.TinhTrang != "Chờ thanh toán")
            {
                throw new Exception("Đơn hàng đã được xử lý, không thể thay đổi thanh toán.");
            }

            if (order.TongTien < 0) throw new ArgumentException("Tổng tiền không hợp lệ!");

            order.PTTT = pttt;
            order.TinhTrang = "Chờ xác nhận"; 

            await _context.SaveChangesAsync();
            return order;
        }

        // 2. XÁC NHẬN THANH TOÁN
        public async Task<DonHang?> ConfirmPaymentAsync(int orderId)
        {
            var order = await _context.DonHangs.FindAsync(orderId);
            if (order == null) return null;

            order.TinhTrang = "Đã thanh toán";
            await _context.SaveChangesAsync();
            return order;
        }

        // =================================================================
        // ✅ 3. HỦY THANH TOÁN & HOÀN KHO (ĐÃ SỬA KHỚP INTERFACE)
        // =================================================================
        // ⚠️ Lưu ý: Phải có tham số 'int userId' ở đây thì mới hết lỗi CS0535
        public async Task<DonHang?> CancelPaymentAsync(int orderId, int userId)
        {
            // Include sâu để lấy dữ liệu hoàn kho
            var order = await _context.DonHangs
                 .Include(d => d.ChiTietDonHangs)
                    .ThenInclude(ct => ct.SanPham)
                        .ThenInclude(sp => sp.CongThucs) // Nhớ là CongThucs (số nhiều)
                            .ThenInclude(c => c.NguyenLieu)
                .FirstOrDefaultAsync(d => d.IDDonHang == orderId);

            if (order == null) return null;

            // 🔒 CHECK QUYỀN: So sánh ID người dùng
            if (order.IDTaiKhoan != userId)
            {
                throw new Exception("Bạn không có quyền hủy đơn hàng này!");
            }

            // Check trạng thái đơn
            if (order.TinhTrang == "Đã giao" || order.TinhTrang == "Completed")
            {
                throw new Exception("Đơn hàng đã hoàn tất, không thể hủy.");
            }

            // A. CẬP NHẬT TRẠNG THÁI
            var timeSinceCreated = DateTime.Now - order.NgayTao;
            if (timeSinceCreated > TimeSpan.FromMinutes(15) && order.TinhTrang == "Chờ thanh toán")
            {
                order.TinhTrang = "Đã hủy (Quá hạn thanh toán)";
            }
            else
            {
                order.TinhTrang = "Đã hủy";
            }

            // B. HOÀN TRẢ NGUYÊN LIỆU
            foreach (var chiTiet in order.ChiTietDonHangs)
            {
                if (chiTiet.SanPham?.CongThucs != null)
                {
                    foreach (var congThuc in chiTiet.SanPham.CongThucs)
                    {
                        if (congThuc.NguyenLieu != null)
                        {
                            double luongHoanLai = congThuc.SoLuongCan * chiTiet.SoLuong;
                            // Ép kiểu decimal để cộng vào kho
                            congThuc.NguyenLieu.SoLuongTon = (congThuc.NguyenLieu.SoLuongTon ?? 0) + (decimal)luongHoanLai;
                        }
                    }
                }
            }

            // C. HOÀN VOUCHER
            if (order.IDVoucher.HasValue)
            {
                var voucher = await _context.Vouchers.FindAsync(order.IDVoucher.Value);
                if (voucher != null)
                {
                    voucher.SoLuongConLai += 1;
                }
            }

            await _context.SaveChangesAsync();
            return order;
        }

        // 4. LỊCH SỬ GIAO DỊCH
        public async Task<IEnumerable<DonHang>> GetPaymentHistoryAsync(int userId)
        {
            return await _context.DonHangs
                .Where(o => o.IDTaiKhoan == userId)
                .OrderByDescending(o => o.NgayTao)
                .ToListAsync();
        }
    }
}