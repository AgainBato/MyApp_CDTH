namespace DrinkShop.Application.Helpers
{
    /// <summary>
    /// Lớp này dùng để nhận các tham số phân trang
    /// từ Query String của URL (ví dụ: ?pageNumber=1&pageSize=10)
    /// </summary>
    public class PaginationParams
    {
        // Kích thước trang tối đa để tránh client yêu cầu quá nhiều
        private const int MaxPageSize = 50;

        public int PageNumber { get; set; } = 1;

        private int _pageSize = 5;

        /// <summary>
        /// Số lượng mục trên mỗi trang
        /// </summary>
        public int PageSize
        {
            get => _pageSize;
            set => _pageSize = (value > MaxPageSize) ? MaxPageSize : value;
        }
    }
}