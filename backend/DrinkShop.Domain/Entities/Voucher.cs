namespace DrinkShop.Domain.Entities
{
    public class Voucher
    {
        public int IDVoucher { get; set; }
        public string? MoTa { get; set; }

        public int? GiamGia { get; set; }
        public decimal? ToiDa { get; set; }

        public decimal DieuKienMin { get; set; } = 0;

        public int SoLuong { get; set; }
        public int SoLuongConLai { get; set; }

        public DateTime? BatDau { get; set; }
        public DateTime? KetThuc { get; set; }

        public ICollection<DonHang> DonHang { get; set; } = new List<DonHang>();
    }
}
