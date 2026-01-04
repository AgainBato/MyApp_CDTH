using DrinkShop.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;
using DrinkShop.Application.Helpers;
using DrinkShop.Application.constance.Response;   

namespace DrinkShop.Application.Interfaces
{
    public interface ISanPhamService
    {
        // Các hàm cũ giữ nguyên...
        Task<PagedList<SanPham>> GetSanPhams(PaginationParams paginationParams, string? tenSanPham, int? idPhanLoai);
        
        // ⚠️ SỬA DÒNG NÀY: Đổi SanPham thành SanPhamResponse
        Task<SanPhamResponse?> GetSanPhamById(int id); 

        // ✅ THÊM DÒNG NÀY (Để sửa lỗi CS1061):
        Task<SanPham?> GetOriginalSanPhamById(int id); 

        // Các hàm Manager...
        Task AddSanPham(SanPham sanPham);
        Task UpdateSanPham(SanPham sanPham);
        Task DeleteSanPham(int id);
    }
}