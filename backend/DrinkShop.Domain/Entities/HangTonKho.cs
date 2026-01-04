namespace DrinkShop.Domain.Entities
{
    public class HangTonKho
    {
        public int IDHangTonKho { get; set; }
        public string? Ten { get; set; }
        public string? DonViTinh { get; set; }
        public decimal? SoLuong { get; set; }
        public DateTime? NgayNhap { get; set; }

        public int? IDQuanLy { get; set; }
        public TaiKhoan? QuanLy { get; set; }

        public int IDSanPham { get; set; }
        public SanPham? SanPham { get; set; }
    }
}
