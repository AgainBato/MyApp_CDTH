using DrinkShop.Application.DTO;
using System.Threading.Tasks;

namespace DrinkShop.Application.Interfaces
{
    public interface IPosService
    {
        Task<PosOrderReceiptDto> CreateAndPayPosOrderAsync(PosCreateOrderDto request, int staffId);
    }
}