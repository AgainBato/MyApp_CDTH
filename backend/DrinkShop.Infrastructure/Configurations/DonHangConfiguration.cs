using DrinkShop.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DrinkShop.Infrastructure.Configurations
{
    public class DonHangConfiguration : IEntityTypeConfiguration<DonHang>
    {
        public void Configure(EntityTypeBuilder<DonHang> builder)
        {
            builder.ToTable("DONHANG");

            builder.HasKey(x => x.IDDonHang);

            builder.Property(x => x.IDDonHang)
                   .HasColumnName("IDDonHang");

            builder.Property(x => x.IDTaiKhoan)
                   .HasColumnName("IDTaiKhoan")
                   .IsRequired();

            builder.Property(x => x.TinhTrang)
                   .HasColumnName("TinhTrang")
                   .HasMaxLength(50)
                   .HasDefaultValue("Pending");

            builder.Property(x => x.PTTT)
                   .HasColumnName("PTTT")
                   .HasMaxLength(50);

            builder.Property(x => x.NgayTao)
                   .HasColumnName("NgayTao")
                   .HasDefaultValueSql("GETDATE()");

            builder.Property(x => x.TongTien)
                   .HasColumnName("TongTien")
                   .HasColumnType("decimal(18,2)");

            builder.Property(x => x.IDVoucher)
                   .HasColumnName("IDVoucher");
            builder.Property(x => x.GhiChu)
                   .HasColumnName("GhiChu")
                   .HasMaxLength(500);
            builder.Property(x => x.TrangThaiThanhToan)
                   .HasColumnName("TrangThaiThanhToan")
                   .HasMaxLength(50)
                   .HasDefaultValue("Unpaid");
            builder.Property(x => x.NgayCapNhat)
                   .HasColumnName("NgayCapNhat");

            // --- Quan hệ với TaiKhoan ---
            builder.HasOne(x => x.TaiKhoan)
                   .WithMany(t => t.DonHangs)
                   .HasForeignKey(x => x.IDTaiKhoan)
                   .OnDelete(DeleteBehavior.Restrict);

            // --- Quan hệ với Voucher (nullable) ---
            builder.HasOne(x => x.Voucher)
                   .WithMany(v => v.DonHang)
                   .HasForeignKey(x => x.IDVoucher)
                   .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
