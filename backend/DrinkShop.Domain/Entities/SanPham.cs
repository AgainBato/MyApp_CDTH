namespace DrinkShop.Domain.Entities
{
    public class SanPham
    {
        public int IDSanPham { get; set; }
        public string? TenSanPham { get; set; }
        public decimal Gia { get; set; }
        public string? MoTa { get; set; }
        public string? TinhTrang { get; set; }
        public string? ImageUrl { get; set; }

        public int IDPhanLoai { get; set; }
        public PhanLoai? PhanLoai { get; set; }

        public ICollection<CongThuc> CongThucs { get; set; } = new List<CongThuc>();
        public ICollection<DanhGia> DanhGias { get; set; } = new List<DanhGia>();
        public ICollection<GioHangSanPham> GioHangSanPhams { get; set; } = new List<GioHangSanPham>();
        public ICollection<DonHangSanPham> DonHangSanPhams { get; set; } = new List<DonHangSanPham>();
    }
}
