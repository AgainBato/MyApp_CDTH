using DrinkShop.Domain.Entities;
using DrinkShop.Application.DTO;

namespace DrinkShop.Application.Interfaces
{
    public interface IDanhGiaService
    {
        // Thêm đánh giá (Có check logic mua hàng)
        Task<DanhGia> AddReviewAsync(int userId, int productId, int soSao, string binhLuan);
        
        // Lấy danh sách đánh giá của 1 sản phẩm
        Task<ProductReviewSummaryDto> GetProductReviewSummaryAsync(int productId);
    }
}