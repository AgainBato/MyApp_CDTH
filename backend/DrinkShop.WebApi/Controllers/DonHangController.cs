using Microsoft.AspNetCore.Mvc;

using DrinkShop.Application.Interfaces;

using DrinkShop.WebApi.Utilities; // Chứa ResponseHelper

using Microsoft.AspNetCore.Authorization;

using DrinkShop.Application.constance; // ✅ Sửa namespace cho chuẩn (Viết hoa chữ C)

using System;  

using System.Security.Claims; // Để dùng ClaimTypes

using DrinkShop.WebApi.DTO;
using DrinkShop.Application.DTO;
using DrinkShop.Application.Helpers;



namespace DrinkShop.WebApi.Controllers

{

    [ApiController]

    [Route("api/[controller]")]

    [Authorize] // Yêu cầu đăng nhập cho toàn bộ Controller

    public class DonHangController : ControllerBase

    {

        private readonly IDonHangService _donHangService;



        public DonHangController(IDonHangService donHangService)

        {

            _donHangService = donHangService;

        }



        // --- HÀM LẤY USER ID AN TOÀN ---

        private int GetCurrentUserId()

        {

            var claim = User.FindFirst("IDTaiKhoan");

            if (claim == null)

                claim = User.FindFirst(ClaimTypes.NameIdentifier);



            if (claim != null && int.TryParse(claim.Value, out int userId))

            {

                return userId;

            }

            return 0;

        }



        // ============================================================

        // 1. Customer tạo đơn hàng từ giỏ

        // ============================================================
        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
        {
            try
            {
                int userId = GetCurrentUserId();
                if (userId == 0) return Unauthorized("Token không hợp lệ.");

                // 1. Kiểm tra danh sách ID gửi lên có trống không
                if (request.CartItemIds == null || !request.CartItemIds.Any())
                {
                    return ResponseHelper.Error("Vui lòng chọn ít nhất một sản phẩm để đặt hàng.", 400);
                }

                // 2. Validate phương thức thanh toán
                if (!PaymentMethod.List.Contains(request.Pttt))
                {
                    return ResponseHelper.Error($"Phương thức thanh toán không hợp lệ.", 400);
                }

                // 3. Gọi Service (FIX LỖI CS7036: Truyền đúng biến từ request vào)
                var order = await _donHangService.CreateOrderFromCartAsync(
                    userId, 
                    request.CartItemIds, // Biến thực tế chứa danh sách ID
                    request.Pttt, 
                    request.VoucherId
                );

                return ResponseHelper.Success(order, "Tạo đơn hàng thành công");
            }
            catch (Exception ex)
            {
                return ResponseHelper.Error(ex.Message, 400);
            }
        }



        // ============================================================

        // 2. Customer xem danh sách đơn hàng của chính mình

        // ============================================================

        [HttpGet("my-orders")]
        public async Task<IActionResult> GetMyOrders([FromQuery] PaginationParams paginationParams)
        {
            int userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized();

            var orders = await _donHangService.GetMyOrdersAsync(userId, paginationParams);

            return ResponseHelper.Success(orders, "Lấy danh sách đơn hàng thành công");
        }



        // ============================================================

       [HttpGet("my-orders/{orderId}")]
        public async Task<IActionResult> GetMyOrderById(int orderId)
        {
            int userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized();

            var order = await _donHangService.GetMyOrderByIdAsync(userId, orderId);

            if (order == null)
                return ResponseHelper.Error(
                    "Không tìm thấy đơn hàng hoặc bạn không có quyền truy cập", 
                    404
                );

            return ResponseHelper.Success(order, "Lấy chi tiết đơn hàng thành công");
        }

       

        // ============================================================

        // 4. Customer hủy đơn hàng

        // ============================================================

       [HttpPut("my-orders/{orderId}/cancel")]
        public async Task<IActionResult> CancelOrder(int orderId)
        {
            int userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized();

            try
            {
                var result = await _donHangService.CancelOrderAsync(orderId, userId);

                return ResponseHelper.Success(result, "Đã hủy đơn hàng thành công");
            }
            catch (Exception ex)
            {
                return ResponseHelper.Error(ex.Message, 400);
            }
        }

    }

}