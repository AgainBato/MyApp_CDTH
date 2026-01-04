namespace DrinkShop.Domain.Entities
{
    public class CongThuc
    {
        public int IDCongThuc { get; set; }

        public int IDSanPham { get; set; }
        public SanPham? SanPham { get; set; }

        public int IDNguyenLieu { get; set; }
        public NguyenLieu? NguyenLieu { get; set; }

        public double SoLuongCan { get; set; }
    }
}
