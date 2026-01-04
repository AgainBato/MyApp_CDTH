namespace DrinkShop.Application.DTO
{
    public class OrderStatusDto
    {
        public int OrderId { get; set; }
        public string TinhTrang { get; set; } = null!;
        public string PaymentStatus { get; set; } = null!;
        public DateTime UpdatedAt { get; set; }
    }
}
