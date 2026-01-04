using System.Net;
using System.Text.Json;
using DrinkShop.WebApi.DTO.ApiResponse;

namespace DrinkShop.WebApi.Utilities
{
    public class ValidationMiddleware
    {
        private readonly RequestDelegate _next;

        public ValidationMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Kiểm tra ModelState trong request
            if (!context.Request.HasFormContentType &&
                context.Request.ContentLength > 0 &&
                context.Items.ContainsKey("ModelStateErrors"))
            {
                var errors = context.Items["ModelStateErrors"];
                var response = new ApiResponse<object>
                {
                    Success = false,
                    Message = "Dữ liệu không hợp lệ",
                    Data = errors
                };

                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                context.Response.ContentType = "application/json";

                await context.Response.WriteAsync(JsonSerializer.Serialize(response));
                return;
            }

            await _next(context);
        }
    }
}
    