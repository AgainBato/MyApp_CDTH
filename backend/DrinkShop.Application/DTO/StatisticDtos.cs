using System;

namespace DrinkShop.Application.DTO
{
    // DTO thống kê doanh thu
    public class RevenueStatDto
    {
        public string? Period { get; set; } // Ví dụ: "12/12/2025", "Tháng 12", "Năm 2025"
        public decimal TotalRevenue { get; set; }
        public int TotalOrders { get; set; }
    }

    // DTO thống kê sản phẩm bán chạy
    public class ProductStatDto
    {
        public string? ProductName { get; set; }
        public int SoLuong { get; set; }
        public decimal TotalRevenueFromProduct { get; set; }
    }

    // DTO thống kê phân loại đánh giá
    public class RatingStatDto
    {
        public int StarRating { get; set; } // 1, 2, 3, 4, 5 sao
        public int Count { get; set; }
    }
}