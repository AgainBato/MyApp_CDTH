using DrinkShop.Domain.Entities;

namespace DrinkShop.Application.Interfaces
{
    public interface IVoucherService
    {
        Task<IEnumerable<Voucher>> GetAllAsync();
        Task<Voucher?> GetByIdAsync(int id);
        Task<Voucher?> GetByDescriptionAsync(string mota);
        Task<Voucher> CreateAsync(Voucher voucher);
        Task<Voucher?> UpdateAsync(int id, Voucher voucher);
        Task<bool> DeleteAsync(int id);
    }
}
