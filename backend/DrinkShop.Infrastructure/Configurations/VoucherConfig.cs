using DrinkShop.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DrinkShop.Infrastructure.Configurations
{
    public class VoucherConfig : IEntityTypeConfiguration<Voucher>
    {
        public void Configure(EntityTypeBuilder<Voucher> builder)
        {
            builder.ToTable("VOUCHER");

            // Khóa chính
            builder.HasKey(x => x.IDVoucher);

            builder.Property(x => x.IDVoucher)
                .HasColumnName("IDVoucher");

            // Mô tả
            builder.Property(x => x.MoTa)
                .HasColumnName("MoTa")
                .HasMaxLength(255);

            // Giảm giá (int? – có thể phần trăm hoặc số tiền)
            builder.Property(x => x.GiamGia)
                .HasColumnName("GiamGia");

            // Giảm tối đa
            builder.Property(x => x.ToiDa)
                .HasColumnName("ToiDa")
                .HasColumnType("decimal(10,2)");

            // Điều kiện tối thiểu
            builder.Property(x => x.DieuKienMin)
                .HasColumnName("DieuKienMin")
                .HasColumnType("decimal(10,2)")
                .HasDefaultValue(0);

            // Số lượng
            builder.Property(x => x.SoLuong)
                .HasColumnName("SoLuong");

            // Số lượng còn lại
            builder.Property(x => x.SoLuongConLai)
                .HasColumnName("SoLuongConLai");

            // Thời gian
            builder.Property(x => x.BatDau)
                .HasColumnName("BatDau");

            builder.Property(x => x.KetThuc)
                .HasColumnName("KetThuc");
        }
    }
}
