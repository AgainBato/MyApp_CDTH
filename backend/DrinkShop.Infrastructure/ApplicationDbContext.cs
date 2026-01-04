using Microsoft.EntityFrameworkCore;
using DrinkShop.Domain.Entities;

namespace DrinkShop.Infrastructure
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // =========================
        // DbSet
        // =========================
        public DbSet<SanPham> SanPhams { get; set; }
        public DbSet<PhanLoai> PhanLoais { get; set; }
        public DbSet<VaiTro> VaiTros { get; set; }
        public DbSet<TaiKhoan> TaiKhoans { get; set; }
        public DbSet<GioHang> GioHangs { get; set; }
        public DbSet<GioHangSanPham> GioHangSanPhams { get; set; }
        public DbSet<DanhGia> DanhGias { get; set; }
        public DbSet<Voucher> Vouchers { get; set; }
        public DbSet<DonHang> DonHangs { get; set; }
        public DbSet<DonHangSanPham> DonHangSanPhams { get; set; }
        public DbSet<NguyenLieu> NguyenLieu { get; set; }
        public DbSet<CongThuc> CongThuc { get; set; }
        public DbSet<LichSuKho> LichSuKho { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Tự động load tất cả file cấu hình từ Infrastructure/Configurations
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

            base.OnModelCreating(modelBuilder);
        }
    }
}
