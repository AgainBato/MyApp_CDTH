using DrinkShop.Domain.Entities;
using Microsoft.AspNetCore.Http;

namespace DrinkShop.Application.Interfaces
{
public interface IFileStorageService

    {
        Task<string> SaveFileAsync(IFormFile file, string subFolder);
        Task DeleteFileAsync(string fileUrl);
    }

}