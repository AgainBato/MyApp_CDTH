using System.Collections.Generic;
using System;
namespace DrinkShop.Application.DTO
{
    public class OrderDto
    {
        public int OrderId { get; set; }
        public string TinhTrang { get; set; } = null!;
        public string PaymentStatus { get; set; } = null!;
        public string PaymentMethod { get; set; } = null!;

        public decimal TongTien { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal TotalAmount { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public List<OrderItemDto> Items { get; set; } = new();
    }
}
