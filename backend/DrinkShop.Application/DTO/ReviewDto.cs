// DTO cho từng mục đánh giá (đã làm phẳng dữ liệu)
using System.Collections.Generic;
using System;
namespace DrinkShop.Application.DTO
{
    public class ReviewDto
    {
        public int SoSao { get; set; }
        public string BinhLuan { get; set; } = string.Empty;
        public string TenNguoiDung { get; set; } = string.Empty;
        public DateTime ThoiGianTao { get; set; }
}
}
