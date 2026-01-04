namespace DrinkShop.Domain.Entities
{
    public class DanhGia
    {
        public int IDDanhGia { get; set; }
        public int SoSao { get; set; }
        public string? BinhLuan { get; set; }
        public DateTime ThoiGianTao { get; set; } = DateTime.Now;

        public int IDSanPham { get; set; }
        public SanPham? SanPham { get; set; }

        public int IDTaiKhoan { get; set; }
        public TaiKhoan? TaiKhoan { get; set; }
    }
}
