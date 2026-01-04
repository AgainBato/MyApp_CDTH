namespace DrinkShop.Application.constance.Response 
{
    public class SanPhamResponse
    {
        public int IDSanPham { get; set; }

        // ✅ Phải có thuộc tính này thì mới hết lỗi CS0117
        public string TenSanPham { get; set; } = string.Empty; 

        public decimal Gia { get; set; }
        public string? MoTa { get; set; }
        public string? ImageUrl { get; set; }
        public int? IDPhanLoai { get; set; }

        // ✅ 2 thuộc tính cho phần Đánh giá
        public double DiemDanhGia { get; set; }
        public int SoLuongDanhGia { get; set; }
    }
}