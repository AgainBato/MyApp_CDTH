using System.ComponentModel.DataAnnotations;

namespace DrinkShop.WebApi.DTO.Auth
{
    public class UpdateProfileDto
    {
        [MaxLength(100, ErrorMessage = "Họ tên quá dài")]
        public string? HoTen { get; set; } // Cho phép null để người dùng không gửi field này nếu không muốn sửa

        [Phone(ErrorMessage = "Số điện thoại không hợp lệ")]
        [RegularExpression(@"^\d{10}$", ErrorMessage = "Số điện thoại phải có đúng 10 chữ số và không chứa ký tự khác")]
        public string? SDT { get; set; }
        [Required(ErrorMessage = "Địa chỉ không được bỏ trống")]
        [RegularExpression(@"^[a-zA-Z0-9\sÀ-ỹà-ỵĂ-ỹ]+$", ErrorMessage = "Địa chỉ không được có ký tự đặc biệt")]
        public string? DiaChi { get; set; }
    }
}