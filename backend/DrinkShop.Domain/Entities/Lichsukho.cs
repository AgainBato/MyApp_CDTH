namespace DrinkShop.Domain.Entities
{
    public class LichSuKho
    {
        public int IDLichSuKho { get; set; }

        public int IDNguyenLieu { get; set; }
        public NguyenLieu? NguyenLieu { get; set; }

        public decimal SoLuongThayDoi { get; set; }
        public decimal SoLuongSauKhiDoi { get; set; }

        public string? LyDo { get; set; }
        public string? NguoiThucHien { get; set; }

        public DateTime NgayTao { get; set; } = DateTime.Now;
    }
}
