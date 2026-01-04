namespace DrinkShop.Domain.Entities
{
    public class VaiTro
    {
        public int IDVaiTro { get; set; }
        public string? TenVaiTro { get; set; }
        public string? Permission { get; set; }

        public ICollection<TaiKhoan> TaiKhoans { get; set; } = new List<TaiKhoan>();
    }
}
