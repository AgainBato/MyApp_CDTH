using DrinkShop.Application.DTO;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DrinkShop.Application.Interfaces
{
    public interface IGroqService
    {
        // Gửi lịch sử chat và dữ liệu DB để nhận phản hồi từ AI
        Task<string> GetAiResponseAsync(List<ChatMessageDto> history, string dbContext);
    }
}