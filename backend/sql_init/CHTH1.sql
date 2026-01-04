
CREATE DATABASE CHTH
GO
USE CHTH
GO


CREATE TABLE VAITRO(
	IDVaiTro INT IDENTITY(1, 1) PRIMARY KEY,
	TenVaiTro NVARCHAR(100),
	Permission NVARCHAR(250)
);

CREATE TABLE TAIKHOAN(
	IDTaiKhoan INT IDENTITY (1,1) PRIMARY KEY,
	IDQuanLy INT NULL,
	HoTen NVARCHAR(100),
	SDT NVARCHAR(10),
	Email NVARCHAR(100),
	MatKhau NVARCHAR(100),
	IDVaiTro INT NULL,
	DiaChi NVARCHAR(255),
	ResetToken NVARCHAR(100),
	ResetTokenExpire DATETIME,
	RefreshToken NVARCHAR(200),
	RefreshTokenExpire DATETIME
);

CREATE TABLE GIOHANG(
	IDGioHang INT IDENTITY(1, 1) PRIMARY KEY,
	IDTaiKhoan INT NOT NULL UNIQUE
);


CREATE TABLE PHANLOAI(
	IDPhanLoai INT IDENTITY(1, 1) PRIMARY KEY,
	Ten NVARCHAR(100),
	MoTa NVARCHAR(255)
);

CREATE TABLE SANPHAM(
	IDSanPham INT IDENTITY(1, 1) PRIMARY KEY,
	TenSanPham NVARCHAR(100),
	Gia DECIMAL(10, 2),
	MoTa NVARCHAR(255),
	TinhTrang NVARCHAR(100),
	ImageUrl NVARCHAR(250),
	IDPhanLoai INT NOT NULL
);


CREATE TABLE DANHGIA(
	IDDanhGia INT IDENTITY(1, 1) PRIMARY KEY,
	SoSao INT CHECK(SoSao BETWEEN 1 AND 5),
	BinhLuan NVARCHAR(255),
	ThoiGianTao DATETIME DEFAULT GETDATE(),
	IDSanPham INT NOT NULL,
	IDTaiKhoan INT NOT NULL
);

CREATE TABLE GIOHANG_SANPHAM(
	IDGioHangSanPham INT IDENTITY(1, 1) PRIMARY KEY,
	IDGioHang INT NOT NULL,
	IDSanPham INT NOT NULL,
	SoLuong INT NOT NULL
);


CREATE TABLE VOUCHER(
	IDVoucher INT IDENTITY(1, 1) PRIMARY KEY,
	MoTa NVARCHAR(255),
	GiamGia INT,
	ToiDa DECIMAL(10, 2),
	DieuKienMin DECIMAL(10,2) DEFAULT 0,
	SoLuong INT,
	SoLuongConLai INT,
	BatDau DATETIME,
	KetThuc DATETIME
);


CREATE TABLE DONHANG(
	IDDonHang INT IDENTITY(1, 1) PRIMARY KEY,
	IDTaiKhoan INT NOT NULL,
	TinhTrang NVARCHAR(50) DEFAULT 'Pending',
	PTTT NVARCHAR(50),
	NgayTao DATETIME DEFAULT GETDATE(),
	TongTien DECIMAL(18, 2),
	IDVoucher INT NULL,
	GhiChu NVARCHAR(500) NOT NULL DEFAULT N''
);

CREATE TABLE DONHANG_SANPHAM(
	IDDonHangSanPham INT IDENTITY(1, 1) PRIMARY KEY,
	IDDonHang INT NOT NULL,
	IDSanPham INT NOT NULL,
	SoLuong INT NOT NULL,
	GiaDonVi DECIMAL(18,2) NOT NULL
);


CREATE TABLE NGUYENLIEU (
	IDNguyenLieu INT IDENTITY(1,1) PRIMARY KEY,
	TenNguyenLieu NVARCHAR(200),
	SoLuongTon DECIMAL(18,2),
	DonViTinh NVARCHAR(100),
	IsDeleted BIT DEFAULT 0
);

CREATE TABLE CONGTHUC(
	IDCongThuc INT IDENTITY(1,1) PRIMARY KEY,
	IDSanPham INT NOT NULL,
	IDNguyenLieu INT NOT NULL,
	SoLuongCan FLOAT
);


CREATE TABLE LICHSUKHO(
	IDLichSuKho INT IDENTITY(1,1) PRIMARY KEY,
	IDNguyenLieu INT NOT NULL,
	SoLuongThayDoi DECIMAL(18,2),
	SoLuongSauKhiDoi DECIMAL(18,2),
	LyDo NVARCHAR(255),
	NguoiThucHien NVARCHAR(100),
	NgayTao DATETIME DEFAULT GETDATE()
);

CREATE TABLE HANGTONKHO(
	IDHangTonKho INT IDENTITY(1, 1) PRIMARY KEY,
	Ten NVARCHAR(100),
	DonViTinh NVARCHAR(100),
	SoLuong DECIMAL(8, 2),
	NgayNhap DATETIME,
	IDQuanLy INT,
	IDSanPham INT NOT NULL
);



ALTER TABLE TAIKHOAN 
ADD CONSTRAINT FK_TK_VAITRO FOREIGN KEY (IDVaiTro) REFERENCES VAITRO(IDVaiTro);

ALTER TABLE TAIKHOAN
ADD CONSTRAINT FK_TK_QUANLY FOREIGN KEY (IDQuanLy) REFERENCES TAIKHOAN(IDTaiKhoan);

ALTER TABLE GIOHANG 
ADD CONSTRAINT FK_GH_TK FOREIGN KEY (IDTaiKhoan) REFERENCES TAIKHOAN(IDTaiKhoan) ON DELETE CASCADE;

ALTER TABLE SANPHAM
ADD CONSTRAINT FK_SP_PL FOREIGN KEY (IDPhanLoai) REFERENCES PHANLOAI(IDPhanLoai);

ALTER TABLE DANHGIA
ADD CONSTRAINT FK_DG_SP FOREIGN KEY(IDSanPham) REFERENCES SANPHAM(IDSanPham),
	CONSTRAINT FK_DG_TK FOREIGN KEY(IDTaiKhoan) REFERENCES TAIKHOAN(IDTaiKhoan);

ALTER TABLE GIOHANG_SANPHAM
ADD CONSTRAINT FK_GHSP_GH FOREIGN KEY(IDGioHang) REFERENCES GIOHANG(IDGioHang) ON DELETE CASCADE,
	CONSTRAINT FK_GHSP_SP FOREIGN KEY(IDSanPham) REFERENCES SANPHAM(IDSanPham) ON DELETE NO ACTION;

ALTER TABLE DONHANG
ADD CONSTRAINT FK_DH_TK FOREIGN KEY(IDTaiKhoan) REFERENCES TAIKHOAN(IDTaiKhoan) ON DELETE NO ACTION,
	CONSTRAINT FK_DH_VC FOREIGN KEY(IDVoucher) REFERENCES VOUCHER(IDVoucher) ON DELETE SET NULL;

ALTER TABLE DONHANG_SANPHAM
ADD CONSTRAINT FK_DHSP_DH FOREIGN KEY(IDDonHang) REFERENCES DONHANG(IDDonHang) ON DELETE CASCADE,
	CONSTRAINT FK_DHSP_SP FOREIGN KEY(IDSanPham) REFERENCES SANPHAM(IDSanPham) ON DELETE NO ACTION;

ALTER TABLE CONGTHUC
ADD CONSTRAINT FK_CT_SP FOREIGN KEY(IDSanPham) REFERENCES SANPHAM(IDSanPham) ON DELETE CASCADE,
	CONSTRAINT FK_CT_NL FOREIGN KEY(IDNguyenLieu) REFERENCES NGUYENLIEU(IDNguyenLieu);

ALTER TABLE LICHSUKHO
ADD CONSTRAINT FK_LSK_NL FOREIGN KEY(IDNguyenLieu) REFERENCES NGUYENLIEU(IDNguyenLieu);

ALTER TABLE HANGTONKHO
ADD CONSTRAINT FK_HTK_TK FOREIGN KEY(IDQuanLy) REFERENCES TAIKHOAN(IDTaiKhoan),
	CONSTRAINT FK_HTK_SP FOREIGN KEY(IDSanPham) REFERENCES SANPHAM(IDSanPham);




-- Vai trò
INSERT INTO VAITRO (TenVaiTro, Permission) VALUES
(N'Quản lý', NULL),
(N'Nhân viên', NULL),
(N'Khách hàng', NULL);

-- Tài khoản
INSERT INTO TAIKHOAN (IDQuanLy, HoTen, SDT, Email, MatKhau, IDVaiTro)
VALUES
(NULL, N'Nguyễn Văn A', '0901234567', 'admin@example.com', '123456', 1),
(1, N'Trần Thị B', '0902345678', 'manager@example.com', '123456', 2),
(NULL, N'Lê Văn C', '0903456789', 'customer1@example.com', '123456', 3),
(NULL, N'Phạm Thị D', '0904567890', 'customer2@example.com', '123456', 3);

-- Giỏ hàng
INSERT INTO GIOHANG (IDTaiKhoan) VALUES (3), (4);

-- Phân loại
INSERT INTO PHANLOAI (Ten, MoTa) VALUES
(N'Trà sữa', N'Các loại trà sữa'),
(N'Cà phê', N'Các loại cà phê'),
(N'Nước ép', N'Các loại nước ép');

-- Sản phẩm
INSERT INTO SANPHAM (TenSanPham, Gia, MoTa, TinhTrang, ImageUrl, IDPhanLoai)
VALUES
(N'Trà sữa truyền thống', 30000, N'Ngon, ngọt vừa', N'Còn hàng', NULL, 1),
(N'Trà sữa matcha', 35000, N'Vị matcha thanh mát', N'Còn hàng', NULL, 1),
(N'Cà phê sữa đá', 25000, N'Cà phê đậm vị', N'Còn hàng', NULL, 2),
(N'Nước ép cam', 28000, N'Tươi ngon 100%', N'Còn hàng', NULL, 3);

-- Đánh giá
INSERT INTO DANHGIA (SoSao, BinhLuan, IDSanPham, IDTaiKhoan)
VALUES
(5, N'Rất ngon!', 1, 3),
(4, N'Ổn, hơi ngọt', 2, 3),
(5, N'Cà phê thơm', 3, 4);

-- Giỏ hàng – sản phẩm
INSERT INTO GIOHANG_SANPHAM (IDGioHang, IDSanPham, SoLuong) VALUES
(1, 1, 2),
(1, 3, 1),
(2, 2, 1);

-- Voucher (thêm cột mới)
INSERT INTO VOUCHER (MoTa, GiamGia, ToiDa, DieuKienMin, SoLuong, SoLuongConLai, BatDau, KetThuc)
VALUES
(N'Giảm 10%', 10, 20000, 0, 100, 100, '2025-01-01', '2025-12-31'),
(N'Giảm 20%', 20, 30000, 0, 100, 100, '2025-02-01', '2025-12-31');

-- Đơn hàng
INSERT INTO DONHANG (IDTaiKhoan, TinhTrang, PTTT, IDVoucher, TongTien)
VALUES
(3, N'Đang xử lý', N'Thanh toán khi nhận hàng', 1, 85000),
(4, N'Hoàn thành', N'Thanh toán online', NULL, 35000);

-- Đơn hàng – sản phẩm (THÊM GIÁ ĐƠN VỊ)
INSERT INTO DONHANG_SANPHAM (IDDonHang, IDSanPham, SoLuong, GiaDonVi)
VALUES
(1, 1, 2, 30000),
(1, 3, 1, 25000),
(2, 2, 1, 35000);

-- Hàng tồn kho
INSERT INTO HANGTONKHO (Ten, DonViTinh, SoLuong, NgayNhap, IDQuanLy, IDSanPham)
VALUES
(N'Trà sữa truyền thống', N'Ly', 100, GETDATE(), 1, 1),
(N'Trà sữa matcha', N'Ly', 50, GETDATE(), 1, 2),
(N'Cà phê sữa đá', N'Ly', 200, GETDATE(), 1, 3),
(N'Nước ép cam', N'Ly', 80, GETDATE(), 1, 4);
INSERT INTO NGUYENLIEU(TenNguyenLieu, SoLuongTon, DonViTinh, IsDeleted) VALUES 
(N'Bột Matcha Nhật', 1000, 'gram', 0),
(N'Sữa đặc', 5000, 'ml', 0),
(N'Sữa tươi không đường', 10000, 'ml', 0),
(N'Đường nước', 2000, 'ml', 0),
(N'Trà đen (lá khô)', 500, 'gram', 0),
(N'Hạt cà phê Rang', 2000, 'gram', 0),
(N'Cam tươi', 50, 'quả', 0);
-- Giả định IDSanPham và IDNguyenLieu tự tăng theo thứ tự INSERT ở trên
-- Công thức cho Trà sữa matcha (IDSanPham = 1)
INSERT INTO CongThuc (IDSanPham, IDNguyenLieu, SoLuongCan) VALUES 
(1, 1, 10),  -- 10g Bột Matcha
(1, 2, 30),  -- 30ml Sữa đặc
(1, 3, 150), -- 150ml Sữa tươi
(1, 4, 20);  -- 20ml Đường

-- Công thức cho Trà sữa truyền thống (IDSanPham = 2)
INSERT INTO CongThuc (IDSanPham, IDNguyenLieu, SoLuongCan) VALUES 
(2, 5, 15),  -- 15g Trà đen
(2, 2, 40),  -- 40ml Sữa đặc
(2, 4, 25);  -- 25ml Đường

-- Công thức cho Nước ép cam (IDSanPham = 4)
INSERT INTO CongThuc (IDSanPham, IDNguyenLieu, SoLuongCan) VALUES 
(4, 7, 3);   -- 3 Quả cam cho 1 ly
INSERT INTO CongThuc (IDSanPham, IDNguyenLieu, SoLuongCan) VALUES 
(3, 6, 25),  -- 25g Hạt cà phê rang (xay)
(3, 2, 45),  -- 45ml Sữa đặc
(3, 4, 10);  -- 10ml Đường nước (tùy chọn)

SELECT * FROM VAITRO
SELECT * FROM TAIKHOAN
SELECT * FROM GIOHANG
SELECT * FROM PHANLOAI
SELECT * FROM SANPHAM
SELECT * FROM DANHGIA
SELECT * FROM GIOHANG_SANPHAM
SELECT * FROM VOUCHER
SELECT * FROM DONHANG
SELECT * FROM DONHANG_SANPHAM
SELECT * FROM HANGTONKHO
SELECT * FROM SANPHAM
SELECT * FROM CONGTHUC
SELECT * FROM NGUYENLIEU
UPDATE VAITRO
SET Permission = 'FULL_ACCESS'
WHERE TenVaiTro = N'Quản lý';
UPDATE VAITRO
SET Permission = 'FULL_ACCESS'
WHERE TenVaiTro = N'Nhân viên';
UPDATE VAITRO
SET Permission = 'VIEW,CREATE,UPDATE'
WHERE TenVaiTro = N'Khách hàng';
-- Thêm cột trạng thái thanh toán kiểu chữ
ALTER TABLE DONHANG 
ADD TrangThaiThanhToan NVARCHAR(50) DEFAULT N'Chờ thanh toán';

-- Thêm cột ngày cập nhật
ALTER TABLE DONHANG 
ADD NgayCapNhat DATETIME DEFAULT GETDATE();

UPDATE TAIKHOAN
SET IDVaiTro = 2
WHERE IDTaiKhoan = 5;

UPDATE DONHANG
SET TinhTrang = 'Pending'
WHERE TinhTrang IS NULL;

UPDATE DONHANG
SET TrangThaiThanhToan = 'Unpaid'
WHERE TrangThaiThanhToan IS NULL;

UPDATE TAIKHOAN
SET MatKhau = '$2a$11$k0JMjdxH6Y8ZI1i9CEwmVeOuHwZ7bRP68mpoMEOC/YLXTr4Wr9L5m'
WHERE IDTaiKhoan IN (1, 2, 3, 4);
-- Đây là chuỗi hash CHUẨN của số '123456'
UPDATE TAIKHOAN 
SET MatKhau = '$2a$11$Z6n.wMeJ.sV.i.U.n.u.Oe.j.L.p.Q.r.t.V.w.X.y.Z.a.B.c.D.e' 
WHERE Email = 'customer2@example.com';
ALTER TABLE TAIKHOAN
ADD Avatar NVARCHAR(500) NULL;

INSERT INTO TAIKHOAN (IDQuanLy, HoTen, SDT, Email, MatKhau, IDVaiTro, DiaChi)
VALUES 
(
    NULL,N'Khách Vãng Lai','0000000000','guest_pos@drinkshop.com','khongcanmatkhau',3, N'Tại quầy')