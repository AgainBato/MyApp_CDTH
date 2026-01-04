using DrinkShop.WebApi.DTO.ApiResponse;
using Microsoft.AspNetCore.Mvc;

namespace DrinkShop.WebApi.Utilities
{
    public static class ResponseHelper
    {
        public static IActionResult Success<T>(T data, string message = "Thành công")
        {
            return new OkObjectResult(new ApiResponse<T>(data, message));
        }

        public static IActionResult Error(string message, int statusCode = 400)
        {
            // Dùng constructor (string message, bool success)
            var response = new ApiResponse<object>(message, false); 
            return new ObjectResult(response)
            {
                StatusCode = statusCode
            };
        }

        public static IActionResult Deleted(string message = "Xóa thành công")
        {
            // === SỬA LỖI Ở ĐÂY ===
            // Dùng constructor (string message, bool success) thay vì (T data, string message)
            // Vì đây là phản hồi thành công (true) và không có data
            return new OkObjectResult(new ApiResponse<object>(message, true));
        }
    }
}