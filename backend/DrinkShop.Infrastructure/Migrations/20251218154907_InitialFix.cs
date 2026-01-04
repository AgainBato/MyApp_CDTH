using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DrinkShop.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialFix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "NguyenLieu",
                columns: table => new
                {
                    IDNguyenLieu = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenNguyenLieu = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    SoLuongTon = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    DonViTinh = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NguyenLieu", x => x.IDNguyenLieu);
                });

            migrationBuilder.CreateTable(
                name: "PHANLOAI",
                columns: table => new
                {
                    IDPhanLoai = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Ten = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    MoTa = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PHANLOAI", x => x.IDPhanLoai);
                });

            migrationBuilder.CreateTable(
                name: "VAITRO",
                columns: table => new
                {
                    IDVaiTro = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenVaiTro = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Permission = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VAITRO", x => x.IDVaiTro);
                });

            migrationBuilder.CreateTable(
                name: "VOUCHER",
                columns: table => new
                {
                    IDVoucher = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MoTa = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    GiamGia = table.Column<int>(type: "int", nullable: true),
                    ToiDa = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    DieuKienMin = table.Column<decimal>(type: "decimal(10,2)", nullable: false, defaultValue: 0m),
                    SoLuong = table.Column<int>(type: "int", nullable: false),
                    SoLuongConLai = table.Column<int>(type: "int", nullable: false),
                    BatDau = table.Column<DateTime>(type: "datetime2", nullable: true),
                    KetThuc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VOUCHER", x => x.IDVoucher);
                });

            migrationBuilder.CreateTable(
                name: "LichSuKhos",
                columns: table => new
                {
                    IDLichSuKho = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IDNguyenLieu = table.Column<int>(type: "int", nullable: false),
                    SoLuongThayDoi = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    SoLuongSauKhiDoi = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    LyDo = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    NguoiThucHien = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    NgayTao = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LichSuKhos", x => x.IDLichSuKho);
                    table.ForeignKey(
                        name: "FK_LichSuKhos_NguyenLieu_IDNguyenLieu",
                        column: x => x.IDNguyenLieu,
                        principalTable: "NguyenLieu",
                        principalColumn: "IDNguyenLieu",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SANPHAM",
                columns: table => new
                {
                    IDSanPham = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenSanPham = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Gia = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    MoTa = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    TinhTrang = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ImageUrl = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    IDPhanLoai = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SANPHAM", x => x.IDSanPham);
                    table.ForeignKey(
                        name: "FK_SANPHAM_PHANLOAI_IDPhanLoai",
                        column: x => x.IDPhanLoai,
                        principalTable: "PHANLOAI",
                        principalColumn: "IDPhanLoai",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TAIKHOAN",
                columns: table => new
                {
                    IDTaiKhoan = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IDQuanLy = table.Column<int>(type: "int", nullable: true),
                    HoTen = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    SDT = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    MatKhau = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IDVaiTro = table.Column<int>(type: "int", nullable: true),
                    DiaChi = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    ResetToken = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ResetTokenExpire = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RefreshToken = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    RefreshTokenExpire = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Avatar = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TAIKHOAN", x => x.IDTaiKhoan);
                    table.ForeignKey(
                        name: "FK_TAIKHOAN_TAIKHOAN_IDQuanLy",
                        column: x => x.IDQuanLy,
                        principalTable: "TAIKHOAN",
                        principalColumn: "IDTaiKhoan",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TAIKHOAN_VAITRO_IDVaiTro",
                        column: x => x.IDVaiTro,
                        principalTable: "VAITRO",
                        principalColumn: "IDVaiTro");
                });

            migrationBuilder.CreateTable(
                name: "CongThuc",
                columns: table => new
                {
                    IDCongThuc = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IDSanPham = table.Column<int>(type: "int", nullable: false),
                    IDNguyenLieu = table.Column<int>(type: "int", nullable: false),
                    SoLuongCan = table.Column<double>(type: "float", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CongThuc", x => x.IDCongThuc);
                    table.ForeignKey(
                        name: "FK_CongThuc_NguyenLieu_IDNguyenLieu",
                        column: x => x.IDNguyenLieu,
                        principalTable: "NguyenLieu",
                        principalColumn: "IDNguyenLieu",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CongThuc_SANPHAM_IDSanPham",
                        column: x => x.IDSanPham,
                        principalTable: "SANPHAM",
                        principalColumn: "IDSanPham",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DANHGIA",
                columns: table => new
                {
                    IDDanhGia = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SoSao = table.Column<int>(type: "int", nullable: false),
                    BinhLuan = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    ThoiGianTao = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    IDSanPham = table.Column<int>(type: "int", nullable: false),
                    IDTaiKhoan = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DANHGIA", x => x.IDDanhGia);
                    table.ForeignKey(
                        name: "FK_DANHGIA_SANPHAM_IDSanPham",
                        column: x => x.IDSanPham,
                        principalTable: "SANPHAM",
                        principalColumn: "IDSanPham",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DANHGIA_TAIKHOAN_IDTaiKhoan",
                        column: x => x.IDTaiKhoan,
                        principalTable: "TAIKHOAN",
                        principalColumn: "IDTaiKhoan",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DONHANG",
                columns: table => new
                {
                    IDDonHang = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IDTaiKhoan = table.Column<int>(type: "int", nullable: false),
                    TinhTrang = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Pending"),
                    PTTT = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    NgayTao = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "GETDATE()"),
                    TongTien = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    IDVoucher = table.Column<int>(type: "int", nullable: true),
                    GhiChu = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    TrangThaiThanhToan = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Unpaid"),
                    NgayCapNhat = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DONHANG", x => x.IDDonHang);
                    table.ForeignKey(
                        name: "FK_DONHANG_TAIKHOAN_IDTaiKhoan",
                        column: x => x.IDTaiKhoan,
                        principalTable: "TAIKHOAN",
                        principalColumn: "IDTaiKhoan",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DONHANG_VOUCHER_IDVoucher",
                        column: x => x.IDVoucher,
                        principalTable: "VOUCHER",
                        principalColumn: "IDVoucher",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "GIOHANG",
                columns: table => new
                {
                    IDGioHang = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IDTaiKhoan = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GIOHANG", x => x.IDGioHang);
                    table.ForeignKey(
                        name: "FK_GIOHANG_TAIKHOAN_IDTaiKhoan",
                        column: x => x.IDTaiKhoan,
                        principalTable: "TAIKHOAN",
                        principalColumn: "IDTaiKhoan",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HANGTONKHO",
                columns: table => new
                {
                    IDHangTonKho = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Ten = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    DonViTinh = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    SoLuong = table.Column<decimal>(type: "decimal(8,2)", nullable: true),
                    NgayNhap = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IDQuanLy = table.Column<int>(type: "int", nullable: true),
                    IDSanPham = table.Column<int>(type: "int", nullable: false),
                    TaiKhoanIDTaiKhoan = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HANGTONKHO", x => x.IDHangTonKho);
                    table.ForeignKey(
                        name: "FK_HANGTONKHO_SANPHAM_IDSanPham",
                        column: x => x.IDSanPham,
                        principalTable: "SANPHAM",
                        principalColumn: "IDSanPham",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_HANGTONKHO_TAIKHOAN_IDQuanLy",
                        column: x => x.IDQuanLy,
                        principalTable: "TAIKHOAN",
                        principalColumn: "IDTaiKhoan");
                    table.ForeignKey(
                        name: "FK_HANGTONKHO_TAIKHOAN_TaiKhoanIDTaiKhoan",
                        column: x => x.TaiKhoanIDTaiKhoan,
                        principalTable: "TAIKHOAN",
                        principalColumn: "IDTaiKhoan");
                });

            migrationBuilder.CreateTable(
                name: "DONHANG_SANPHAM",
                columns: table => new
                {
                    IDDonHangSanPham = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IDDonHang = table.Column<int>(type: "int", nullable: false),
                    IDSanPham = table.Column<int>(type: "int", nullable: false),
                    SoLuong = table.Column<int>(type: "int", nullable: false),
                    GiaDonVi = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DONHANG_SANPHAM", x => x.IDDonHangSanPham);
                    table.ForeignKey(
                        name: "FK_DONHANG_SANPHAM_DONHANG_IDDonHang",
                        column: x => x.IDDonHang,
                        principalTable: "DONHANG",
                        principalColumn: "IDDonHang",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DONHANG_SANPHAM_SANPHAM_IDSanPham",
                        column: x => x.IDSanPham,
                        principalTable: "SANPHAM",
                        principalColumn: "IDSanPham",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "GIOHANG_SANPHAM",
                columns: table => new
                {
                    IDGioHangSanPham = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IDGioHang = table.Column<int>(type: "int", nullable: false),
                    IDSanPham = table.Column<int>(type: "int", nullable: false),
                    SoLuong = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GIOHANG_SANPHAM", x => x.IDGioHangSanPham);
                    table.ForeignKey(
                        name: "FK_GIOHANG_SANPHAM_GIOHANG_IDGioHang",
                        column: x => x.IDGioHang,
                        principalTable: "GIOHANG",
                        principalColumn: "IDGioHang",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GIOHANG_SANPHAM_SANPHAM_IDSanPham",
                        column: x => x.IDSanPham,
                        principalTable: "SANPHAM",
                        principalColumn: "IDSanPham",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CongThuc_IDNguyenLieu",
                table: "CongThuc",
                column: "IDNguyenLieu");

            migrationBuilder.CreateIndex(
                name: "IX_CongThuc_IDSanPham",
                table: "CongThuc",
                column: "IDSanPham");

            migrationBuilder.CreateIndex(
                name: "IX_DANHGIA_IDSanPham",
                table: "DANHGIA",
                column: "IDSanPham");

            migrationBuilder.CreateIndex(
                name: "IX_DANHGIA_IDTaiKhoan",
                table: "DANHGIA",
                column: "IDTaiKhoan");

            migrationBuilder.CreateIndex(
                name: "IX_DONHANG_IDTaiKhoan",
                table: "DONHANG",
                column: "IDTaiKhoan");

            migrationBuilder.CreateIndex(
                name: "IX_DONHANG_IDVoucher",
                table: "DONHANG",
                column: "IDVoucher");

            migrationBuilder.CreateIndex(
                name: "IX_DONHANG_SANPHAM_IDDonHang",
                table: "DONHANG_SANPHAM",
                column: "IDDonHang");

            migrationBuilder.CreateIndex(
                name: "IX_DONHANG_SANPHAM_IDSanPham",
                table: "DONHANG_SANPHAM",
                column: "IDSanPham");

            migrationBuilder.CreateIndex(
                name: "IX_GIOHANG_IDTaiKhoan",
                table: "GIOHANG",
                column: "IDTaiKhoan",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_GIOHANG_SANPHAM_IDGioHang",
                table: "GIOHANG_SANPHAM",
                column: "IDGioHang");

            migrationBuilder.CreateIndex(
                name: "IX_GIOHANG_SANPHAM_IDSanPham",
                table: "GIOHANG_SANPHAM",
                column: "IDSanPham");

            migrationBuilder.CreateIndex(
                name: "IX_HANGTONKHO_IDQuanLy",
                table: "HANGTONKHO",
                column: "IDQuanLy");

            migrationBuilder.CreateIndex(
                name: "IX_HANGTONKHO_IDSanPham",
                table: "HANGTONKHO",
                column: "IDSanPham");

            migrationBuilder.CreateIndex(
                name: "IX_HANGTONKHO_TaiKhoanIDTaiKhoan",
                table: "HANGTONKHO",
                column: "TaiKhoanIDTaiKhoan");

            migrationBuilder.CreateIndex(
                name: "IX_LichSuKhos_IDNguyenLieu",
                table: "LichSuKhos",
                column: "IDNguyenLieu");

            migrationBuilder.CreateIndex(
                name: "IX_SANPHAM_IDPhanLoai",
                table: "SANPHAM",
                column: "IDPhanLoai");

            migrationBuilder.CreateIndex(
                name: "IX_TAIKHOAN_IDQuanLy",
                table: "TAIKHOAN",
                column: "IDQuanLy");

            migrationBuilder.CreateIndex(
                name: "IX_TAIKHOAN_IDVaiTro",
                table: "TAIKHOAN",
                column: "IDVaiTro");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CongThuc");

            migrationBuilder.DropTable(
                name: "DANHGIA");

            migrationBuilder.DropTable(
                name: "DONHANG_SANPHAM");

            migrationBuilder.DropTable(
                name: "GIOHANG_SANPHAM");

            migrationBuilder.DropTable(
                name: "HANGTONKHO");

            migrationBuilder.DropTable(
                name: "LichSuKhos");

            migrationBuilder.DropTable(
                name: "DONHANG");

            migrationBuilder.DropTable(
                name: "GIOHANG");

            migrationBuilder.DropTable(
                name: "SANPHAM");

            migrationBuilder.DropTable(
                name: "NguyenLieu");

            migrationBuilder.DropTable(
                name: "VOUCHER");

            migrationBuilder.DropTable(
                name: "TAIKHOAN");

            migrationBuilder.DropTable(
                name: "PHANLOAI");

            migrationBuilder.DropTable(
                name: "VAITRO");
        }
    }
}
