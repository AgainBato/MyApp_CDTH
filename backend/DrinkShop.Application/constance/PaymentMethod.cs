namespace DrinkShop.Application.constance
{
    public static class PaymentMethod
    {
        public const string COD = "COD"; // Thanh toán khi nhận hàng
        public const string Momo = "Momo";
        public const string VNPay = "VNPay";
        public const string Banking = "Banking"; // Chuyển khoản ngân hàng

        // Danh sách để kiểm tra validation cho nhanh
        public static readonly HashSet<string> List = new HashSet<string> 
        { 
            COD, Momo, VNPay, Banking 
        };
    }
}