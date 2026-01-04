using DrinkShop.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DrinkShop.Infrastructure.Configurations
{
    public class GioHangSanPhamConfiguration : IEntityTypeConfiguration<GioHangSanPham>
    {
        public void Configure(EntityTypeBuilder<GioHangSanPham> builder)
        {
            builder.ToTable("GIOHANG_SANPHAM");

            builder.HasKey(x => x.IDGioHangSanPham);

            builder.Property(x => x.IDGioHangSanPham)
                .HasColumnName("IDGioHangSanPham");

            // FK GioHang
            builder.Property(x => x.IDGioHang)
                .HasColumnName("IDGioHang")
                .IsRequired();

            builder.HasOne(x => x.GioHang)
                .WithMany(g => g.GioHangSanPhams)
                .HasForeignKey(x => x.IDGioHang)
                .OnDelete(DeleteBehavior.Cascade);

            // FK SanPham
            builder.Property(x => x.IDSanPham)
                .HasColumnName("IDSanPham")
                .IsRequired();

            builder.HasOne(x => x.SanPham)
                .WithMany(s => s.GioHangSanPhams)
                .HasForeignKey(x => x.IDSanPham)
                .OnDelete(DeleteBehavior.Restrict);

            // Extra column
            builder.Property(x => x.SoLuong)
                .HasColumnName("SoLuong")
                .IsRequired();
        }
    }
}
