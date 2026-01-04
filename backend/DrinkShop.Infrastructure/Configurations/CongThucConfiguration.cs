using DrinkShop.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DrinkShop.Infrastructure.Configurations
{
    public class CongThucConfiguration : IEntityTypeConfiguration<CongThuc>
    {
        public void Configure(EntityTypeBuilder<CongThuc> builder)
        {
            builder.ToTable("CongThuc");

            builder.HasKey(x => x.IDCongThuc);

            builder.Property(x => x.IDCongThuc)
                   .HasColumnName("IDCongThuc");

            // --- Sản phẩm ---
            builder.Property(x => x.IDSanPham)
                   .HasColumnName("IDSanPham")
                   .IsRequired();

            builder.HasOne(x => x.SanPham)
                   .WithMany(p => p.CongThucs)
                   .HasForeignKey(x => x.IDSanPham)
                   .OnDelete(DeleteBehavior.Cascade);

            // --- Nguyên liệu ---
            builder.Property(x => x.IDNguyenLieu)
                   .HasColumnName("IDNguyenLieu")
                   .IsRequired();

            builder.HasOne(x => x.NguyenLieu)
                   .WithMany(n => n.CongThucs)
                   .HasForeignKey(x => x.IDNguyenLieu)
                   .OnDelete(DeleteBehavior.Restrict);

            // --- Số lượng cần ---
            builder.Property(x => x.SoLuongCan)
                   .HasColumnName("SoLuongCan")
                   .HasColumnType("float");
        }
    }
}
