using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using DrinkShop.Domain.Models; // Nơi chứa các model kết quả (RevenueResult...)

namespace DrinkShop.Domain.Interfaces
{
    public interface IStatisticRepository
    {
        // Các hàm này để lấy dữ liệu thô từ Database
        Task<List<RevenueResult>> GetRevenueByDay(DateTime from, DateTime to);
        Task<List<RevenueResult>> GetRevenueByMonth(DateTime from, DateTime to);
        Task<List<RevenueResult>> GetRevenueByYear();
        
        Task<List<ProductStatResult>> GetTopProducts(int topN);
        
        Task<List<RatingStatResult>> GetRatingStats();
    }
}