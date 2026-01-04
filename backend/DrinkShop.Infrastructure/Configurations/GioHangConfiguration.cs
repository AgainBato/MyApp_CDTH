using DrinkShop.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DrinkShop.Infrastructure.Configurations
{
    public class GioHangConfiguration : IEntityTypeConfiguration<GioHang>
    {
        public void Configure(EntityTypeBuilder<GioHang> builder)
        {
            builder.ToTable("GIOHANG");

            builder.HasKey(x => x.IDGioHang);

            builder.Property(x => x.IDGioHang)
                .HasColumnName("IDGioHang");

            builder.Property(x => x.IDTaiKhoan)
                .HasColumnName("IDTaiKhoan")
                .IsRequired();

            builder.HasOne(x => x.TaiKhoan)
                .WithOne(t => t.GioHang)
                .HasForeignKey<GioHang>(x => x.IDTaiKhoan)
                .OnDelete(DeleteBehavior.Cascade);

            // GioHang — 1:N — GioHangSanPham
            builder.HasMany(x => x.GioHangSanPhams)
                .WithOne(sp => sp.GioHang)
                .HasForeignKey(sp => sp.IDGioHang)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
