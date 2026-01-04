using DrinkShop.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;


namespace DrinkShop.Application.Interfaces
{
    public interface INguyenLieuService
    {
        // 1. Lấy tất cả
        Task<IEnumerable<NguyenLieu>> GetAllAsync();

        // 2. Lấy chi tiết
        Task<IEnumerable<LichSuKho>> GetHistoryAsync(int? nguyenLieuId);
        Task<NguyenLieu?> GetByIdAsync(int id);

        // 3. Nhập kho
        Task ImportIngredientAsync(int id, double soLuong, string ghiChu, string username);
        Task DeleteAsync(int id);
        // 4. Hủy hàng / Xuất kho
        Task DiscardIngredientAsync(int id, double soLuong, string lyDo, string username);
    }
}