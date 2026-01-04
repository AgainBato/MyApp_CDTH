using System.Collections.Generic;
using System.Reflection;

namespace DrinkShop.Application.constance
{
    public static class Permissions
    {
        // === KEY KÍCH HOẠT SIÊU QUYỀN ===
        public const string FullAccess = "FULL_ACCESS";

        // 1. QUYỀN SẢN PHẨM
        public static class Product
        {
            public const string View = "PRODUCT_VIEW";
            public const string Manage = "PRODUCT_MANAGE"; 
            
            public const string Create = "PRODUCT_CREATE";
            public const string Edit = "PRODUCT_EDIT";
            public const string Delete = "PRODUCT_DELETE";

            public const string UploadImage = "PRODUCT_UPLOAD_IMAGE";

            public const string CategoryView = "CATEGORY_VIEW";
            public const string CategoryManage = "CATEGORY_MANAGE";
        }

        // 2. QUYỀN ĐƠN HÀNG
        public static class Order
        {
            public const string ViewMine = "ORDER_VIEW_MINE"; // Khách xem đơn mình
            public const string ViewAll = "ORDER_VIEW_ALL";   // Staff xem hết
            public const string Manage = "ORDER_MANAGE";      // Duyệt đơn
        }

        // 3. QUYỀN VOUCHER
        public static class Voucher
        {
            public const string ViewAll = "VOUCHER_VIEW_ALL";
            public const string Create = "VOUCHER_CREATE";
            public const string Edit = "VOUCHER_EDIT";
            public const string Delete = "VOUCHER_DELETE";
        }

        // 4. QUYỀN THỐNG KÊ
        public static class Statistic
        {
            public const string ViewRevenue = "STATISTIC_VIEW_REVENUE";
            public const string ViewTopProducts = "STATISTIC_VIEW_TOP_PRODUCTS";
            public const string ViewRating = "STATISTIC_VIEW_RATING";
        }

        // ✅ 5. QUYỀN BÁN HÀNG TẠI QUẦY (POS) - DÀNH CHO STAFF
        public static class Pos
        {
            // Quyền tạo đơn hàng trên máy POS
            public const string CreateOrder = "POS_CREATE_ORDER"; 
        }

        // === HÀM THẦN THÁNH: TỰ ĐỘNG LẤY TẤT CẢ QUYỀN ===
        public static List<string> GetAllPermissions()
        {
            var permissions = new List<string>();
            var nestedTypes = typeof(Permissions).GetNestedTypes();

            foreach (var type in nestedTypes)
            {
                var fields = type.GetFields(BindingFlags.Public | BindingFlags.Static | BindingFlags.FlattenHierarchy);
                foreach (var field in fields)
                {
                    if (field.IsLiteral && !field.IsInitOnly && field.FieldType == typeof(string))
                    {
                        var value = field.GetValue(null)?.ToString();
                        if (!string.IsNullOrEmpty(value) && value != FullAccess) 
                        {
                            permissions.Add(value);
                        }
                    }
                }
            }
            return permissions;
        }
    }
}