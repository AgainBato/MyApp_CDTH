using DrinkShop.Domain.Interfaces; // Quan trọng: Gọi Interface từ Domain
using DrinkShop.Domain.Models;     // Quan trọng: Gọi Model kết quả từ Domain
using DrinkShop.Infrastructure; // Nơi chứa DbContext
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq; // Quan trọng: Để dùng .Where, .Select, .Sum
using System.Threading.Tasks;

namespace DrinkShop.Infrastructure.Repositories
{
    public class StatisticRepository : IStatisticRepository
    {
        // Lưu ý: Thay 'ApplicationDbContext' bằng tên chính xác DbContext của bạn (ví dụ: DrinkShopDbContext)
        private readonly ApplicationDbContext _context; 

        public StatisticRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. Thống kê theo NGÀY
        public async Task<List<RevenueResult>> GetRevenueByDay(DateTime from, DateTime to)
        {
            var query = _context.DonHangs
                .Where(o => o.NgayTao >= from 
                         && o.NgayTao <= to 
                         && o.TinhTrang == "Completed") // Chỉ lấy đơn đã xong
                .GroupBy(o => o.NgayTao.Value.Date)
                .Select(g => new RevenueResult
                {
                    TimeLabel = g.Key.ToString("dd/MM/yyyy"),
                    Revenue = g.Sum(x => x.TongTien ?? 0m),
                    OrderCount = g.Count()
                });

            return await query.ToListAsync();
        }

        // 2. Thống kê theo THÁNG
        public async Task<List<RevenueResult>> GetRevenueByMonth(DateTime from, DateTime to)
        {
            var data = await _context.DonHangs
                .Where(o => o.NgayTao >= from 
                         && o.NgayTao <= to 
                         && o.TinhTrang == "Completed")
                .ToListAsync(); // Lấy về RAM trước để format tháng cho dễ (tránh lỗi SQL translation)

            var result = data
                .GroupBy(o => new { o.NgayTao.Value.Month, o.NgayTao.Value.Year })
                .Select(g => new RevenueResult
                {
                    TimeLabel = $"{g.Key.Month}/{g.Key.Year}",
                    Revenue = g.Sum(x => x.TongTien ?? 0m),
                    OrderCount = g.Count()
                })
                .ToList();

            return result;
        }

        // 3. Thống kê theo NĂM
        public async Task<List<RevenueResult>> GetRevenueByYear()
        {
            var query = _context.DonHangs
                .Where(o => o.TinhTrang == "Completed")
                .GroupBy(o => o.NgayTao.Value.Year)
                .Select(g => new RevenueResult
                {
                    TimeLabel = g.Key.ToString(),
                    Revenue = g.Sum(x => x.TongTien ?? 0m),
                    OrderCount = g.Count()
                });

            return await query.ToListAsync();
        }

        // 4. Top sản phẩm bán chạy
        public async Task<List<ProductStatResult>> GetTopProducts(int topN)
        {
            // Join bảng DonHangSanPham với DonHang để lọc theo trạng thái Completed
            var query = _context.DonHangSanPhams
                .Include(d => d.SanPham) // Join với bảng sản phẩm để lấy tên
                .Where(d => d.DonHang.TinhTrang == "Completed")
                .GroupBy(d => d.SanPham.TenSanPham) // Giả sử bảng SanPham có cột TenSanPham
                .Select(g => new ProductStatResult
                {
                    ProductName = g.Key,
                    SoLuong = g.Sum(x => x.SoLuong),
                    TotalAmount = g.Sum(x => x.SoLuong * x.GiaDonVi)
                })
                .OrderByDescending(x => x.SoLuong)
                .Take(topN);

            return await query.ToListAsync();
        }

        // 5. Thống kê đánh giá (Tạm để trống nếu chưa có bảng Rating)
        public async Task<List<RatingStatResult>> GetRatingStats()
        {
            return new List<RatingStatResult>();
        }
    }
}