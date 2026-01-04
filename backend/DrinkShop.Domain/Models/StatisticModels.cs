namespace DrinkShop.Domain.Models
{
    // Class này dành cho Infrastructure đổ dữ liệu SQL vào
    public class RevenueResult
    {
        public string TimeLabel { get; set; }= string.Empty; // Ví dụ: "12/12/2025", "Tháng 12", "Năm 2025"
        public decimal Revenue { get; set; }
        public int OrderCount { get; set; }
    }
    
    // Tương tự cho 2 cái kia
    public class ProductStatResult
    {
        public string ProductName { get; set; }= string.Empty;
        public int SoLuong { get; set; }
        public decimal TotalAmount { get; set; }
    }

    public class RatingStatResult
    {
        public int Star { get; set; }
        public int Count { get; set; }
    }
}