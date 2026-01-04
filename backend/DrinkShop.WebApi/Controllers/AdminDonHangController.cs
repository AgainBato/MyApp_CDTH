using DrinkShop.Application.Helpers;
using DrinkShop.Application.Interfaces;
using DrinkShop.WebApi.Utilities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using DrinkShop.Application.constance;

namespace DrinkShop.WebApi.Controllers
{
    [Route("api/admin/orders")]
    [ApiController]
    [Authorize(Policy = Permissions.Order.ViewAll)]
    public class AdminDonHangController : ControllerBase
    {
        private readonly IDonHangService _donHangService;

        public AdminDonHangController(IDonHangService donHangService)
        {
            _donHangService = donHangService;
        }

        // ==========================================================
        // 1. ADMIN – Lấy danh sách đơn hàng (phân trang + lọc)
        // GET: api/admin/orders
        // ==========================================================
        [HttpGet]
        public async Task<IActionResult> GetAllOrders(
            [FromQuery] PaginationParams paginationParams,
            [FromQuery] string? trangThai)
        {
            var pagedOrders = await _donHangService
                .GetAllOrdersAdminAsync(paginationParams, trangThai);

            Response.Headers.Append("X-Pagination", JsonSerializer.Serialize(new
            {
                pagedOrders.CurrentPage,
                pagedOrders.TotalPages,
                pagedOrders.PageSize,
                pagedOrders.TotalCount
            }));

            return ResponseHelper.Success(
                pagedOrders,
                "Lấy danh sách đơn hàng thành công"
            );
        }

        // ==========================================================
        // 2. ADMIN – Xem chi tiết đơn hàng
        // GET: api/admin/orders/{id}
        // ==========================================================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrderById(int id)
        {
            var order = await _donHangService.GetOrderByIdForAdminAsync(id);

            if (order == null)
                return ResponseHelper.Error("Không tìm thấy đơn hàng", 404);

            return ResponseHelper.Success(
                order,
                "Lấy chi tiết đơn hàng thành công"
            );
        }

        // ==========================================================
        // 3. ADMIN – Cập nhật trạng thái đơn hàng
        // PUT: api/admin/orders/{id}/status
        // ==========================================================
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(
            int id,
            [FromBody] UpdateOrderStatusRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.NewStatus))
                return ResponseHelper.Error(
                    "Trạng thái mới (NewStatus) là bắt buộc",
                    400
                );

            var success = await _donHangService
                .UpdateOrderStatusAsync(id, request.NewStatus);

            if (!success)
                return ResponseHelper.Error("Không tìm thấy đơn hàng", 404);

            return ResponseHelper.Success<object>(
                null,
                "Cập nhật trạng thái đơn hàng thành công"
            );
        }
    }

    // ==========================
    // DTO request
    // ==========================
    public class UpdateOrderStatusRequest
    {
        public string NewStatus { get; set; } = string.Empty;
    }
}
