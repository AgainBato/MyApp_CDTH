namespace DrinkShop.Domain.Entities
{
    public class DonHangSanPham
    {
        public int IDDonHangSanPham { get; set; }

        public int IDDonHang { get; set; }
        public DonHang? DonHang { get; set; }

        public int IDSanPham { get; set; }
        public SanPham? SanPham { get; set; }

        public int SoLuong { get; set; }
        public decimal GiaDonVi { get; set; }
        
    }
}
