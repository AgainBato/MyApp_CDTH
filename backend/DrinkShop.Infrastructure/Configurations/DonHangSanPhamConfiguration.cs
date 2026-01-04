using DrinkShop.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DrinkShop.Infrastructure.Configurations
{
    public class DonHangSanPhamConfiguration : IEntityTypeConfiguration<DonHangSanPham>
    {
        public void Configure(EntityTypeBuilder<DonHangSanPham> builder)
        {
            builder.ToTable("DONHANG_SANPHAM");

            builder.HasKey(x => x.IDDonHangSanPham);

            builder.Property(x => x.IDDonHangSanPham)
                   .HasColumnName("IDDonHangSanPham");

            // --- FK: DonHang ---
            builder.Property(x => x.IDDonHang)
                   .HasColumnName("IDDonHang")
                   .IsRequired();

            builder.HasOne(x => x.DonHang)
                   .WithMany(d => d.ChiTietDonHangs)
                   .HasForeignKey(x => x.IDDonHang)
                   .OnDelete(DeleteBehavior.Cascade);

            // --- FK: SanPham ---
            builder.Property(x => x.IDSanPham)
                   .HasColumnName("IDSanPham")
                   .IsRequired();

            builder.HasOne(x => x.SanPham)
                   .WithMany(p => p.DonHangSanPhams)
                   .HasForeignKey(x => x.IDSanPham)
                   .OnDelete(DeleteBehavior.Restrict);

            // --- Extra fields ---
            builder.Property(x => x.SoLuong)
                   .HasColumnName("SoLuong")
                   .IsRequired();

            builder.Property(x => x.GiaDonVi)
                   .HasColumnName("GiaDonVi")
                   .HasColumnType("decimal(18,2)")
                   .IsRequired();
        }
    }
}
