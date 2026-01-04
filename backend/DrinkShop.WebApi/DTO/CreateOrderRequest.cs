using System.ComponentModel.DataAnnotations;
namespace DrinkShop.WebApi.DTO
{
    public class CreateOrderRequest
    {
        public List<int> CartItemIds { get; set; } = new(); // Danh sách ID sản phẩm khách đã tick chọn
        public string Pttt { get; set; } = "COD";
        public int? VoucherId { get; set; }
    }
}