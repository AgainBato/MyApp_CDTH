using DrinkShop.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DrinkShop.Infrastructure.Configurations
{
    public class DanhGiaConfiguration : IEntityTypeConfiguration<DanhGia>
    {
        public void Configure(EntityTypeBuilder<DanhGia> builder)
        {
            builder.ToTable("DANHGIA");

            builder.HasKey(x => x.IDDanhGia);
            builder.Property(x => x.IDDanhGia)
                   .HasColumnName("IDDanhGia");

            builder.Property(x => x.SoSao)
                   .HasColumnName("SoSao")
                   .IsRequired();

            builder.Property(x => x.BinhLuan)
                   .HasColumnName("BinhLuan")
                   .HasMaxLength(255);

            builder.Property(x => x.ThoiGianTao)
                   .HasColumnName("ThoiGianTao")
                   .HasDefaultValueSql("GETDATE()");

            // FK: SanPham
            builder.Property(x => x.IDSanPham)
                   .HasColumnName("IDSanPham")
                   .IsRequired();

            builder.HasOne(x => x.SanPham)
                   .WithMany(p => p.DanhGias)
                   .HasForeignKey(x => x.IDSanPham)
                   .OnDelete(DeleteBehavior.Cascade);

            // FK: TaiKhoan
            builder.Property(x => x.IDTaiKhoan)
                   .HasColumnName("IDTaiKhoan")
                   .IsRequired();

            builder.HasOne(x => x.TaiKhoan)
                   .WithMany(t => t.DanhGias)
                   .HasForeignKey(x => x.IDTaiKhoan)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
