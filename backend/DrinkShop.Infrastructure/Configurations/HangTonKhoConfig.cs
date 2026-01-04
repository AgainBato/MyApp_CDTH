using DrinkShop.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DrinkShop.Infrastructure.Configurations
{
    public class HangTonKhoConfig : IEntityTypeConfiguration<HangTonKho>
    {
        public void Configure(EntityTypeBuilder<HangTonKho> builder)
        {
            builder.ToTable("HANGTONKHO");

            builder.HasKey(x => x.IDHangTonKho);
            builder.Property(x => x.IDHangTonKho)
                .HasColumnName("IDHangTonKho");

            builder.Property(x => x.Ten)
                .HasColumnName("Ten")
                .HasMaxLength(100);

            builder.Property(x => x.DonViTinh)
                .HasColumnName("DonViTinh")
                .HasMaxLength(100);

            builder.Property(x => x.SoLuong)
                .HasColumnName("SoLuong")
                .HasColumnType("decimal(8,2)");

            builder.Property(x => x.NgayNhap)
                .HasColumnName("NgayNhap");

            builder.Property(x => x.IDQuanLy)
                .HasColumnName("IDQuanLy");

            builder.HasOne(x => x.QuanLy)
                .WithMany()
                .HasForeignKey(x => x.IDQuanLy);

            builder.Property(x => x.IDSanPham)
                .HasColumnName("IDSanPham");

            builder.HasOne(x => x.SanPham)
                .WithMany()
                .HasForeignKey(x => x.IDSanPham);
        }
    }
}
