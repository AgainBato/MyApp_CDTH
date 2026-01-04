using DrinkShop.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DrinkShop.Infrastructure.Configurations
{
    public class TaiKhoanConfig : IEntityTypeConfiguration<TaiKhoan>
    {
        public void Configure(EntityTypeBuilder<TaiKhoan> builder)
        {
            builder.ToTable("TAIKHOAN");

            // Khóa chính
            builder.HasKey(x => x.IDTaiKhoan);
            builder.Property(x => x.IDTaiKhoan)
                .HasColumnName("IDTaiKhoan");

            // Self-Reference (QuanLy)
            builder.Property(x => x.IDQuanLy)
                .HasColumnName("IDQuanLy");

            builder.HasOne(x => x.QuanLy)
                .WithMany()
                .HasForeignKey(x => x.IDQuanLy)
                .OnDelete(DeleteBehavior.Restrict); // Tránh lỗi vòng lặp FK

            // Thông tin cá nhân
            builder.Property(x => x.HoTen)
                .HasColumnName("HoTen")
                .HasMaxLength(100);

            builder.Property(x => x.SDT)
                .HasColumnName("SDT")
                .HasMaxLength(10);

            builder.Property(x => x.Email)
                .HasColumnName("Email")
                .HasMaxLength(100);

            builder.Property(x => x.MatKhau)
                .HasColumnName("MatKhau")
                .HasMaxLength(100);

            builder.Property(x => x.DiaChi)
                .HasColumnName("DiaChi")
                .HasMaxLength(255);

            // Quan hệ VaiTro
            builder.Property(x => x.IDVaiTro)
                .HasColumnName("IDVaiTro");

            builder.HasOne(x => x.VaiTro)
                .WithMany(x => x.TaiKhoans)
                .HasForeignKey(x => x.IDVaiTro);

            // Token fields
            builder.Property(x => x.ResetToken)
                .HasColumnName("ResetToken")
                .HasMaxLength(100);

            builder.Property(x => x.ResetTokenExpire)
                .HasColumnName("ResetTokenExpire");

            builder.Property(x => x.RefreshToken)
                .HasColumnName("RefreshToken")
                .HasMaxLength(200);

            builder.Property(x => x.RefreshTokenExpire)
                .HasColumnName("RefreshTokenExpire");
            builder.Property(x => x.Avatar)
                .HasColumnName("Avatar");

            // Collections được EF tự xử lý:
            // GioHangs, DonHangs, DanhGias, HangTonKhos
        }
    }
}
