using System.Collections.Generic;
using System.Threading.Tasks;
using DrinkShop.Application.Interfaces;
using DrinkShop.Infrastructure; // Để dùng DbContext
using DrinkShop.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DrinkShop.Application.Services
{
    // Class này implement interface IPhanLoaiService
    public class PhanLoaiService : IPhanLoaiService
    {
        private readonly ApplicationDbContext _context;

        // Dùng Dependency Injection để tiêm DbContext vào
        public PhanLoaiService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<PhanLoai>> GetAllAsync()
        {
            return await _context.PhanLoais.ToListAsync();
        }

        public async Task<PhanLoai?> GetByIdAsync(int id)
        {
            return await _context.PhanLoais.FindAsync(id);
        }

        public async Task<PhanLoai> CreateAsync(PhanLoai phanLoaiMoi)
        {
            _context.PhanLoais.Add(phanLoaiMoi);
            await _context.SaveChangesAsync();
            return phanLoaiMoi;
        }

        public async Task<PhanLoai?> UpdateAsync(int id, PhanLoai phanLoaiCapNhat)
        {
            var existing = await _context.PhanLoais.FindAsync(id);
            if (existing == null) return null;

            // Cập nhật các trường cho phép
            existing.Ten = phanLoaiCapNhat.Ten;
            existing.MoTa = phanLoaiCapNhat.MoTa;

            _context.PhanLoais.Update(existing);
            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var existing = await _context.PhanLoais.FindAsync(id);
            if (existing == null) return false;
            _context.PhanLoais.Remove(existing);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.PhanLoais.AnyAsync(p => p.IDPhanLoai == id);
        }
    }
}