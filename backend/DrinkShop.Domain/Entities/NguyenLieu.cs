namespace DrinkShop.Domain.Entities
{
    public class NguyenLieu
    {
        public int IDNguyenLieu { get; set; }
        public string? TenNguyenLieu { get; set; }
        public decimal? SoLuongTon { get; set; }
        public string? DonViTinh { get; set; }
        public bool IsDeleted { get; set; } = false;

        // Quan hệ với LichSuKho
        public ICollection<CongThuc> CongThucs { get; set; } = new List<CongThuc>();

        public ICollection<LichSuKho> LichSuKhos { get; set; } = new List<LichSuKho>();
    }
}
