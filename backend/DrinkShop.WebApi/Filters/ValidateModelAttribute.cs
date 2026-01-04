using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
// Thêm dòng này để gọi được ApiResponse từ Application
using DrinkShop.WebApi.DTO.ApiResponse; 
// Hoặc using DrinkShop.Application.DTO; tùy vào nơi bạn để file ApiResponse.cs

// ĐỔI NAMESPACE: Từ Application.Filters -> WebApi.Filters
namespace DrinkShop.WebApi.Filters 
{
    public class ValidateModelAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext context)
        {
            if (!context.ModelState.IsValid)
            {
                var errors = context.ModelState
                    .Where(x => x.Value != null && x.Value.Errors.Count > 0)
                    .Select(x => new
                    {
                        Field = x.Key,
                        Error = x.Value!.Errors.First().ErrorMessage
                    }).ToList();

                // ApiResponse nằm ở Application, nhưng WebApi gọi được vì WebApi reference Application
                var response = new ApiResponse<object>
                {
                    Success = false,
                    Message = "Dữ liệu không hợp lệ",
                    Data = errors
                };

                context.Result = new BadRequestObjectResult(response);
            }
        }
    }
}