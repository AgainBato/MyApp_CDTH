using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DrinkShop.Application.Helpers
{
    /// <summary>
    /// Lớp generic (chung) để chứa dữ liệu của một trang 
    /// và các siêu dữ liệu (metadata) phân trang.
    /// </summary>
    /// <typeparam name="T">Kiểu dữ liệu của các mục (ví dụ: SanPham, TaiKhoan)</typeparam>
    public class PagedList<T>
    {
        /// <summary>
        /// Danh sách các mục thuộc trang hiện tại
        /// </summary>
        public List<T> Items { get; }

        // --- Siêu dữ liệu (Metadata) ---
        public int CurrentPage { get; }
        public int TotalPages { get; }
        public int PageSize { get; }
        public int TotalCount { get; }

        public bool HasPreviousPage => CurrentPage > 1;
        public bool HasNextPage => CurrentPage < TotalPages;

        /// <summary>
        /// Constructor này là private để buộc người dùng
        /// phải sử dụng phương thức 'CreateAsync'
        /// </summary>
        private PagedList(List<T> items, int totalCount, int pageNumber, int pageSize)
        {
            Items = items;
            TotalCount = totalCount;
            PageSize = pageSize;
            CurrentPage = pageNumber;
            // Tính toán tổng số trang
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
        }

        /// <summary>
        /// Phương thức tĩnh (static) để tạo ra PagedList từ một IQueryable.
        /// Đây là nơi EF Core thực sự chạy 2 truy vấn tới DB.
        /// </summary>
        /// <param name="source">Nguồn IQueryable (ví dụ: _context.SanPhams)</param>
        /// <param name="pageNumber">Trang hiện tại</param>
        /// <param name="pageSize">Số lượng mục trên trang</param>
        public static async Task<PagedList<T>> CreateAsync(
            IQueryable<T> source, 
            int pageNumber, 
            int pageSize)
        {
            // 1. Truy vấn COUNT (để tính tổng số trang)
            var totalCount = await source.CountAsync();

            // 2. Truy vấn SKIP và TAKE (để lấy dữ liệu của trang)
            var items = await source
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // 3. Trả về đối tượng PagedList
            return new PagedList<T>(items, totalCount, pageNumber, pageSize);
        }
    }
}