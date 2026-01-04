namespace DrinkShop.WebApi.DTO.ApiResponse
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; } = true;
        public string Message { get; set; } = "Thành công";
        public T? Data { get; set; }

        public ApiResponse() { }

        public ApiResponse(T data, string message = "Thành công")
        {
            Success = true;
            Message = message;
            Data = data;
        }

        public ApiResponse(string message, bool success = false)
        {
            Success = success;
            Message = message;
        }
    }
}
