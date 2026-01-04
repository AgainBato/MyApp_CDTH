using System.Collections.Generic;
using System.Threading.Tasks;
using DrinkShop.Domain.Entities; // Dùng Entities từ DAL

namespace DrinkShop.Application.Interfaces
{
    // Interface này định nghĩa các chức năng mà BLL sẽ cung cấp cho PhanLoai
    public interface IPhanLoaiService
    {
        Task<IEnumerable<PhanLoai>> GetAllAsync();
        Task<PhanLoai?> GetByIdAsync(int id);
        Task<PhanLoai> CreateAsync(PhanLoai phanLoaiMoi);
        Task<PhanLoai?> UpdateAsync(int id, PhanLoai phanLoaiCapNhat);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
    }
}