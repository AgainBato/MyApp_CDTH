using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using DrinkShop.Application.Interfaces;

namespace DrinkShop.Application.Services
{
    public class FileStorageService : IFileStorageService
    {
        private readonly IWebHostEnvironment _webHostEnvironment;
        
        // Đừng quên khai báo hằng số này ở đầu Class
        private const string HOST_IP = "http://172.16.1.57:5118"; 

        public FileStorageService(IWebHostEnvironment webHostEnvironment)
        {
            _webHostEnvironment = webHostEnvironment;
        }

        // Hàm hỗ trợ lấy đường dẫn vật lý an toàn
        private string GetRootPath()
        {
            return _webHostEnvironment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        }

        public async Task<string> SaveFileAsync(IFormFile file, string subFolder)
        {
            if (file == null) return null;

            string rootPath = GetRootPath();
            string contentPath = Path.Combine(rootPath, "images", subFolder);
            
            if (!Directory.Exists(contentPath)) 
                Directory.CreateDirectory(contentPath);

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var fullPath = Path.Combine(contentPath, fileName);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return $"{HOST_IP}/images/{subFolder}/{fileName}";
        }

        public async Task DeleteFileAsync(string fileUrl)
        {
            if (string.IsNullOrEmpty(fileUrl)) return;

            try {
                var uri = new Uri(fileUrl);
                var fileName = Path.GetFileName(uri.LocalPath);
                
                // Lấy subFolder (ví dụ: avatars) từ URL
                var pathSegments = uri.LocalPath.Split('/', StringSplitOptions.RemoveEmptyEntries);
                var subFolder = pathSegments[pathSegments.Length - 2]; 
                
                // SỬA LỖI TẠI ĐÂY: Dùng GetRootPath() thay vì gọi trực tiếp WebRootPath
                string rootPath = GetRootPath();
                var filePath = Path.Combine(rootPath, "images", subFolder, fileName);
                
                if (File.Exists(filePath)) File.Delete(filePath);
            } catch { 
                // Không throw lỗi ở đây để tránh làm crash app khi chỉ đơn giản là không xóa được file cũ
            }
        }
    }
}