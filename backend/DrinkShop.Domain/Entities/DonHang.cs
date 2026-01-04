namespace DrinkShop.Domain.Entities
{
    public class DonHang
    {
        public int IDDonHang { get; set; }
        public int IDTaiKhoan { get; set; }
        public string TinhTrang { get; set; } = "Pending";
        public string PTTT { get; set; } = string.Empty;
        public DateTime? NgayTao { get; set; } = DateTime.Now;
        public decimal? TongTien { get; set; }
        public int? IDVoucher { get; set; }

        // Navigation properties
        public TaiKhoan? TaiKhoan { get; set; }
        public Voucher? Voucher { get; set; }
        public string GhiChu { get; set; } = string.Empty;
        public string TrangThaiThanhToan { get; set; } = "Unpaid";
        public  DateTime? NgayCapNhat { get; set; }

        public ICollection<DonHangSanPham> ChiTietDonHangs { get; set; } = new List<DonHangSanPham>();

    }
}
