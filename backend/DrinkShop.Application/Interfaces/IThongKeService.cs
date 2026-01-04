using DrinkShop.Application.DTO;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;

namespace DrinkShop.Application.Interfaces // <--- Namespace chuẩn
{
    public interface IThongKeService
    {
        Task<List<RevenueStatDto>> GetRevenueStatisticsAsync(string type, DateTime? fromDate, DateTime? toDate);
        Task<List<ProductStatDto>> GetTopSellingProductsAsync(int topN);
        Task<List<RatingStatDto>> GetRatingDistributionAsync();
    }
}