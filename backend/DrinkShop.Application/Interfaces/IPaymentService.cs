using DrinkShop.Domain.Entities;

namespace DrinkShop.Application.Interfaces
{
    public interface IPaymentService
    {
        // ✅ Cập nhật PTTT cho đơn hàng
        Task<DonHang?> CreatePaymentAsync(int userId, int orderId, string pttt);
        
        // ✅ Xác nhận thanh toán thành công (Admin hoặc Callback gọi -> Không cần userId)
        Task<DonHang?> ConfirmPaymentAsync(int orderId);
        
        // ✅ Hủy thanh toán & Hoàn kho
        // ⚠️ ĐÃ SỬA: Thêm userId để check chính chủ
        Task<DonHang?> CancelPaymentAsync(int orderId, int userId); 
        
        // ✅ Lịch sử giao dịch
        Task<IEnumerable<DonHang>> GetPaymentHistoryAsync(int userId);
    }
}