using DrinkShop.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DrinkShop.Infrastructure.Configurations
{
    public class SanPhamConfig : IEntityTypeConfiguration<SanPham>
    {
        public void Configure(EntityTypeBuilder<SanPham> builder)
        {
            builder.ToTable("SANPHAM");

            // Khóa chính
            builder.HasKey(x => x.IDSanPham);

            builder.Property(x => x.IDSanPham)
                .HasColumnName("IDSanPham");

            // Các thuộc tính
            builder.Property(x => x.TenSanPham)
                .HasColumnName("TenSanPham")
                .HasMaxLength(100);

            builder.Property(x => x.Gia)
                .HasColumnName("Gia")
                .HasColumnType("decimal(10,2)");

            builder.Property(x => x.MoTa)
                .HasColumnName("MoTa")
                .HasMaxLength(255);

            builder.Property(x => x.TinhTrang)
                .HasColumnName("TinhTrang")
                .HasMaxLength(100);

            builder.Property(x => x.ImageUrl)
                .HasColumnName("ImageUrl")
                .HasMaxLength(250);

            // Foreign key → PhanLoai
            builder.Property(x => x.IDPhanLoai)
                .HasColumnName("IDPhanLoai");

            builder.HasOne(x => x.PhanLoai)
                .WithMany(x => x.SanPhams)
                .HasForeignKey(x => x.IDPhanLoai);

            // Quan hệ với CôngThức
            builder.HasMany(x => x.CongThucs)
                .WithOne(x => x.SanPham)
                .HasForeignKey(x => x.IDSanPham);
        }
    }
}
