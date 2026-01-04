namespace DrinkShop.Application.DTO
{
public class OrderSummaryDto
{
    public int OrderId { get; set; }
    public string TinhTrang { get; set; } = "Pending";
    public string PaymentStatus { get; set; } = "Unpaid";
    public decimal TotalAmount { get; set; } // Nếu ở Select dùng ?? 0m thì ở đây để decimal
    public DateTime CreatedAt { get; set; }  // Nếu ở Select dùng ?? DateTime.Now thì ở đây để DateTime
}
}
