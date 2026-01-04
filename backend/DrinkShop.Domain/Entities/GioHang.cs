namespace DrinkShop.Domain.Entities
{
    public class GioHang
    {
        public int IDGioHang { get; set; }

        public int IDTaiKhoan { get; set; }
        public TaiKhoan? TaiKhoan { get; set; }

        public ICollection<GioHangSanPham> GioHangSanPhams { get; set; } 
            = new List<GioHangSanPham>();
    }
}
