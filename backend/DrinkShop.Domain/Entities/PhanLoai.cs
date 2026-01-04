namespace DrinkShop.Domain.Entities
{
    public class PhanLoai
    {
        public int IDPhanLoai { get; set; }
        public string? Ten { get; set; }
        public string? MoTa { get; set; }

        public ICollection<SanPham> SanPhams { get; set; } = new List<SanPham>();
    }
}
