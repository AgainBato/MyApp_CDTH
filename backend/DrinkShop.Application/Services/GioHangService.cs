using DrinkShop.Application.Interfaces;
using DrinkShop.Infrastructure;
using DrinkShop.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DrinkShop.Application.Services
{
    public class GioHangService : IGioHangService
    {
        private readonly ApplicationDbContext _context;

        public GioHangService(ApplicationDbContext context)
        {
            _context = context;
        }
        // cập nhật số lượng sản phẩm trong giỏ hàng
        public async Task<GioHang?> UpdateQuantityAsync(int userId, int sanPhamId, int soLuongMoi)
        {
            var cart = await _context.GioHangs
                .Include(g => g.GioHangSanPhams)
                .FirstOrDefaultAsync(g => g.IDTaiKhoan == userId);

            if (cart == null) return null;

            var item = cart.GioHangSanPhams.FirstOrDefault(x => x.IDSanPham == sanPhamId);
            if (item == null) return null;

            // Cập nhật số lượng mới
            item.SoLuong = soLuongMoi;
            await _context.SaveChangesAsync();

            return cart;
        }

        // ✅ Lấy giỏ hàng theo user
        public async Task<GioHang?> GetByUserIdAsync(int userId)
        {
            return await _context.GioHangs
                .Include(g => g.GioHangSanPhams)
                .ThenInclude(x => x.SanPham)
                .FirstOrDefaultAsync(g => g.IDTaiKhoan == userId);
        }

        // ✅ Thêm sản phẩm vào giỏ hàng
        public async Task<GioHang> AddToCartAsync(int userId, int sanPhamId, int soLuong)
        {
            // 👇 BƯỚC 1: KIỂM TRA SẢN PHẨM CÓ TỒN TẠI KHÔNG? (QUAN TRỌNG NHẤT)
            // Nếu không kiểm tra dòng này, khi Frontend gửi ID sai lên -> Server sập ngay (Lỗi 500)
            var productExists = await _context.SanPhams.AnyAsync(p => p.IDSanPham == sanPhamId);
            if (!productExists)
            {
                throw new Exception($"Sản phẩm có ID {sanPhamId} không tồn tại hoặc đã bị xóa!");
            }

            // BƯỚC 2: Tìm giỏ hàng của user
            var cart = await _context.GioHangs
                .Include(g => g.GioHangSanPhams)
                .FirstOrDefaultAsync(g => g.IDTaiKhoan == userId);

            // BƯỚC 3: Nếu chưa có thì tạo mới
            if (cart == null)
            {
                cart = new GioHang 
                { 
                    IDTaiKhoan = userId,
                    // Khởi tạo luôn list rỗng để tránh lỗi Null Reference sau này
                    GioHangSanPhams = new List<GioHangSanPham>() 
                };
                _context.GioHangs.Add(cart);
                // Lưu ngay để lấy được IDGioHang về
                await _context.SaveChangesAsync(); 
            }

            // BƯỚC 4: Kiểm tra xem sản phẩm đã có trong giỏ chưa
            var existingItem = cart.GioHangSanPhams
                .FirstOrDefault(x => x.IDSanPham == sanPhamId);

            if (existingItem != null)
            {
                // Cộng dồn số lượng
                existingItem.SoLuong += soLuong;
                // Đánh dấu update (cho chắc chắn, dù EF Core tự tracking)
                _context.Entry(existingItem).State = EntityState.Modified; 
            }
            else
            {
                // Thêm sản phẩm mới vào chi tiết giỏ
                var newItem = new GioHangSanPham
                {
                    IDGioHang = cart.IDGioHang, // Lấy ID từ giỏ hàng đã có
                    IDSanPham = sanPhamId,
                    SoLuong = soLuong
                };
                
                // Add vào DBSet trực tiếp hoặc add vào collection của cart đều được
                _context.GioHangSanPhams.Add(newItem); 
            }

            // BƯỚC 5: Lưu thay đổi cuối cùng
            await _context.SaveChangesAsync();
            return cart;
        }

        // ✅ Xóa 1 sản phẩm khỏi giỏ
        public async Task<bool> RemoveFromCartAsync(int userId, int sanPhamId)
        {
            var cart = await _context.GioHangs
                .Include(g => g.GioHangSanPhams)
                .FirstOrDefaultAsync(g => g.IDTaiKhoan == userId);

            if (cart == null) return false;

            var item = cart.GioHangSanPhams.FirstOrDefault(x => x.IDSanPham == sanPhamId);
            if (item == null) return false;

            _context.GioHangSanPhams.Remove(item);
            await _context.SaveChangesAsync();
            return true;
        }

        // ✅ Xóa toàn bộ giỏ hàng
        public async Task ClearCartAsync(int userId)
        {
            var cart = await _context.GioHangs
                .Include(g => g.GioHangSanPhams)
                .FirstOrDefaultAsync(g => g.IDTaiKhoan == userId);

            if (cart != null)
            {
                _context.GioHangSanPhams.RemoveRange(cart.GioHangSanPhams);
                await _context.SaveChangesAsync();
            }
        }
    }
}
