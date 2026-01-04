using System.Collections.Generic;
using System;

namespace DrinkShop.Application.DTO
{
    public class OrderItemDto
    {
        public int IDSanPham { get; set; }
        public string TenSanPham { get; set; } = null!;
        public int SoLuong { get; set; }
        public decimal GiaDonVi { get; set; }
        public decimal TotalPrice => SoLuong * GiaDonVi;
    }
}
