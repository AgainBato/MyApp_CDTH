using DrinkShop.Domain.Entities;

namespace DrinkShop.Application.Interfaces
{
    public interface IGioHangService
    {
        Task<GioHang?> GetByUserIdAsync(int userId);
        Task<GioHang> AddToCartAsync(int userId, int sanPhamId, int soLuong);
        Task<bool> RemoveFromCartAsync(int userId, int sanPhamId);
        Task ClearCartAsync(int userId);
        Task<GioHang?> UpdateQuantityAsync(int userId, int sanPhamId, int soLuongMoi);
    }
}
