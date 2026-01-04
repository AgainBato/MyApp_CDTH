using DrinkShop.Application.Helpers;
using DrinkShop.Application.DTO;
using DrinkShop.Domain.Entities;

namespace DrinkShop.Application.Interfaces
{
    public interface IDonHangService
    {
        // ========= CUSTOMER =========

        Task<DonHang> CreateOrderFromCartAsync(int userId, List<int> selectedCartItemIds, string pttt, int? voucherId);

        Task<PagedList<OrderSummaryDto>> GetMyOrdersAsync(
            int userId, PaginationParams paginationParams);

        Task<OrderDetailDto?> GetMyOrderByIdAsync(
            int userId, int orderId);

        Task<bool> CancelOrderAsync(
            int orderId, int userId);

        // ========= ADMIN =========

        Task<PagedList<AdminOrderDto>> GetAllOrdersAdminAsync(
            PaginationParams paginationParams, string? trangThai);

        Task<AdminOrderDto?> GetOrderByIdForAdminAsync(
            int orderId);

        Task<bool> UpdateOrderStatusAsync(
            int orderId, string status);
    }
}
