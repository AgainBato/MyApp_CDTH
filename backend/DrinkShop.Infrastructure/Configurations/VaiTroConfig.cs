using DrinkShop.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DrinkShop.Infrastructure.Configurations
{
    public class VaiTroConfig : IEntityTypeConfiguration<VaiTro>
    {
        public void Configure(EntityTypeBuilder<VaiTro> builder)
        {
            builder.ToTable("VAITRO");

            // Khóa chính
            builder.HasKey(x => x.IDVaiTro);

            builder.Property(x => x.IDVaiTro)
                .HasColumnName("IDVaiTro");

            // Các thuộc tính
            builder.Property(x => x.TenVaiTro)
                .HasColumnName("TenVaiTro")
                .HasMaxLength(100);

            builder.Property(x => x.Permission)
                .HasColumnName("Permission")
                .HasMaxLength(250);

            // Quan hệ 1-n với TaiKhoan
            builder.HasMany(x => x.TaiKhoans)
                .WithOne(x => x.VaiTro)
                .HasForeignKey(x => x.IDVaiTro);
        }
    }
}
