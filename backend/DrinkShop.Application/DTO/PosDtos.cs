using System.Collections.Generic;
using System;

namespace DrinkShop.Application.DTO
{
    public class PosCreateOrderDto
    {
        public List<PosOrderItemDto> Items { get; set; } = new List<PosOrderItemDto>();
        public string PaymentMethod { get; set; } = "CASH";
        public decimal AmountReceived { get; set; }
        public string? Note { get; set; } // Ghi chú
    }

    public class PosOrderItemDto
    {
        // Sửa lại cho khớp với code Service của bạn
        public int IDSanPham { get; set; } 
        public int SoLuong { get; set; } // Giữ là Quantity hoặc đổi thành SoLuong tùy bạn, nhưng Service phải gọi đúng
    }

    public class PosOrderReceiptDto
    {
        public int OrderId { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal AmountReceived { get; set; }
        public decimal ChangeAmount { get; set; }
        public string PaymentStatus { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}