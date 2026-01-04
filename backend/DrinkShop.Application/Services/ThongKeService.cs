using DrinkShop.Application.DTO;
using DrinkShop.Application.Interfaces;
using DrinkShop.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DrinkShop.Domain.Interfaces;
namespace DrinkShop.Application.Services
{
    public class ThongKeService : IThongKeService
    {
        // QUAN TRỌNG: Khai báo biến là Repository Interface (Cái kho)
        private readonly IStatisticRepository _repo;

        // Inject Repository vào Constructor
        public ThongKeService(IStatisticRepository repo)
        {
            _repo = repo;
        }

        public async Task<List<RevenueStatDto>> GetRevenueStatisticsAsync(string type, DateTime? fromDate, DateTime? toDate)
        {
            var f = fromDate ?? DateTime.MinValue;
            var t = toDate ?? DateTime.MaxValue;

            List<RevenueResult> rawData;

            // Gọi hàm từ Repository (Bước 1)
            if (type?.ToLower() == "day")
                rawData = await _repo.GetRevenueByDay(f, t);
            else if (type?.ToLower() == "month")
                rawData = await _repo.GetRevenueByMonth(f, t);
            else
                rawData = await _repo.GetRevenueByYear();

            // Chuyển đổi dữ liệu sang DTO
            return rawData.Select(x => new RevenueStatDto
            {
                Period = x.TimeLabel,
                TotalRevenue = x.Revenue,
                TotalOrders = x.OrderCount
            }).ToList();
        }

        public async Task<List<ProductStatDto>> GetTopSellingProductsAsync(int topN)
        {
            var rawData = await _repo.GetTopProducts(topN);
            return rawData.Select(x => new ProductStatDto
            {
                ProductName = x.ProductName,
                SoLuong = x.SoLuong,
                TotalRevenueFromProduct = x.TotalAmount
            }).ToList();
        }

        public async Task<List<RatingStatDto>> GetRatingDistributionAsync()
        {
            var rawData = await _repo.GetRatingStats();
            return rawData.Select(x => new RatingStatDto
            {
                StarRating = x.Star,
                Count = x.Count
            }).ToList();
        }
    }
}