namespace DrinkShop.Domain.Entities
{
    public class TaiKhoan
    {
        public int IDTaiKhoan { get; set; }

        // Self-reference: 1 user có thể thuộc 1 quản lý
        public int? IDQuanLy { get; set; }
        public TaiKhoan? QuanLy { get; set; }

        public string? HoTen { get; set; }
        public string? SDT { get; set; }
        public string? Email { get; set; }
        public string? MatKhau { get; set; }

        public int? IDVaiTro { get; set; }
        public VaiTro? VaiTro { get; set; }

        public string? DiaChi { get; set; }

        // Token fields
        public string? ResetToken { get; set; }
        public DateTime? ResetTokenExpire { get; set; }
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpire { get; set; }
        public string? Avatar { get; set; }
        public GioHang? GioHang { get; set; }


        // Navigation collections
        public ICollection<DonHang> DonHangs { get; set; } = new List<DonHang>();
        public ICollection<DanhGia> DanhGias { get; set; } = new List<DanhGia>();

        public ICollection<HangTonKho> HangTonKhos { get; set; } = new List<HangTonKho>();
    }
}
