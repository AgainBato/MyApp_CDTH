using DrinkShop.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DrinkShop.Infrastructure.Configurations
{
    public class PhanLoaiConfig : IEntityTypeConfiguration<PhanLoai>
    {
        public void Configure(EntityTypeBuilder<PhanLoai> builder)
        {
            builder.ToTable("PHANLOAI");

            builder.HasKey(x => x.IDPhanLoai);

            builder.Property(x => x.Ten)
                .HasMaxLength(100);

            builder.Property(x => x.MoTa)
                .HasMaxLength(255);

            // Quan hệ 1-n với SanPham
            builder.HasMany(x => x.SanPhams)
                .WithOne(x => x.PhanLoai)
                .HasForeignKey(x => x.IDPhanLoai);
        }
    }
}
