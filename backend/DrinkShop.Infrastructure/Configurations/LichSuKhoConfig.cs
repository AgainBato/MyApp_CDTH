using DrinkShop.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DrinkShop.Infrastructure.Configurations
{
    public class LichSuKhoConfig : IEntityTypeConfiguration<LichSuKho>
    {
        public void Configure(EntityTypeBuilder<LichSuKho> builder)
        {
            builder.ToTable("LichSuKhos");

            builder.HasKey(x => x.IDLichSuKho);

            builder.Property(x => x.LyDo)
                .HasMaxLength(255);

            builder.Property(x => x.NguoiThucHien)
                .HasMaxLength(100);

            builder.Property(x => x.SoLuongThayDoi)
                .HasColumnType("decimal(18,2)");

            builder.Property(x => x.SoLuongSauKhiDoi)
                .HasColumnType("decimal(18,2)");

            builder.Property(x => x.NgayTao)
                .HasDefaultValueSql("GETDATE()");

            builder.HasOne(x => x.NguyenLieu)
                .WithMany()
                .HasForeignKey(x => x.IDNguyenLieu);
        }
    }
}
