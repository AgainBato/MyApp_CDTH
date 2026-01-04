namespace DrinkShop.Domain.Entities
{
    public class GioHangSanPham
    {
        public int IDGioHangSanPham { get; set; }

        public int IDGioHang { get; set; }
        public GioHang? GioHang { get; set; }

        public int IDSanPham { get; set; }
        public SanPham? SanPham { get; set; }

        public int SoLuong { get; set; }
    }
}
