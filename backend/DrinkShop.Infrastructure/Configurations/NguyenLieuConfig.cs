using DrinkShop.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DrinkShop.Infrastructure.Configurations
{
    public class NguyenLieuConfig : IEntityTypeConfiguration<NguyenLieu>
    {
        public void Configure(EntityTypeBuilder<NguyenLieu> builder)
        {
            builder.ToTable("NguyenLieu");

            builder.HasKey(x => x.IDNguyenLieu);

            builder.Property(x => x.TenNguyenLieu)
                .HasMaxLength(200);

            builder.Property(x => x.DonViTinh)
                .HasMaxLength(100);

            builder.Property(x => x.IsDeleted)
                .HasDefaultValue(false);

            builder.Property(x => x.SoLuongTon)
                .HasColumnType("decimal(18,2)");

            // Quan hệ 1-n với LichSuKho
            builder.HasMany(x => x.LichSuKhos)
                .WithOne(x => x.NguyenLieu)
                .HasForeignKey(x => x.IDNguyenLieu);
        }
    }
}
