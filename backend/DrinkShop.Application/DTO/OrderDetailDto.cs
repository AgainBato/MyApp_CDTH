namespace DrinkShop.Application.DTO
{
    public class OrderDetailDto
    {
        public int OrderId { get; set; }

        public string TinhTrang { get; set; }
        public string PaymentStatus { get; set; }
            public string PaymentMethod { get; set; }
        public decimal TotalAmount { get; set; }
        public DateTime CreatedAt { get; set; }

        public List<OrderItemDto> Items { get; set; } = new();
}
}