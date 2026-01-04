using DrinkShop.Application.Interfaces;
using DrinkShop.Infrastructure;
using DrinkShop.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using DrinkShop.Application.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DrinkShop.Application.Services
{
    public class DanhGiaService : IDanhGiaService
    {
        private readonly ApplicationDbContext _context;

        public DanhGiaService(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. Thêm đánh giá mới
        public async Task<DanhGia> AddReviewAsync(int userId, int productId, int soSao, string binhLuan)
        {
            // Kiểm tra User đã mua và nhận hàng thành công chưa?
            bool daMuaHang = await _context.DonHangs
                .AnyAsync(dh => dh.IDTaiKhoan == userId 
                             && (dh.TinhTrang == "Completed" || dh.TinhTrang == "Đã giao")
                             && dh.ChiTietDonHangs.Any(ct => ct.IDSanPham == productId));

            if (!daMuaHang)
            {
                throw new Exception("Bạn phải mua và nhận hàng thành công mới được đánh giá sản phẩm này.");
            }

            // Kiểm tra xem đã đánh giá sản phẩm này chưa?
            bool daDanhGia = await _context.DanhGias
                .AnyAsync(d => d.IDTaiKhoan == userId && d.IDSanPham == productId);
            
            if (daDanhGia)
            {
                throw new Exception("Bạn đã đánh giá sản phẩm này rồi.");
            }

            var danhGia = new DanhGia
            {
                IDTaiKhoan = userId,
                IDSanPham = productId,
                SoSao = soSao,
                BinhLuan = binhLuan,
                ThoiGianTao = DateTime.Now
            };

            _context.DanhGias.Add(danhGia);
            await _context.SaveChangesAsync();

            return danhGia;
        }

        // 2. Lấy thông tin tổng hợp Đánh giá (Gộp danh sách và trung bình sao)
        public async Task<ProductReviewSummaryDto> GetProductReviewSummaryAsync(int productId)
        {
            // Lấy danh sách từ DB và map sang DTO ngay tại câu lệnh SQL
            var reviews = await _context.DanhGias
                .Include(d => d.TaiKhoan)
                .Where(d => d.IDSanPham == productId)
                .OrderByDescending(d => d.ThoiGianTao)
                .Select(d => new ReviewDto
                {
                    SoSao = d.SoSao,
                    BinhLuan = d.BinhLuan ?? "",
                    ThoiGianTao = d.ThoiGianTao,
                    // Xử lý null an toàn cho tên người dùng
                    TenNguoiDung = d.TaiKhoan != null ? d.TaiKhoan.HoTen : "Khách hàng"
                })
                .ToListAsync();

            // Tính toán trung bình cộng trên mảng đã lấy về
            double average = reviews.Any() ? reviews.Average(r => r.SoSao) : 0;

            return new ProductReviewSummaryDto
            {
                AverageRating = Math.Round(average, 1),
                TotalReviews = reviews.Count,
                Reviews = reviews
            };
        }
    }
}