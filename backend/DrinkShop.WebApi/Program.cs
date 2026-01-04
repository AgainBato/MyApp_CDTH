//
using DrinkShop.Application.Interfaces;
using DrinkShop.Application.Services;
using DrinkShop.Infrastructure;
using Microsoft.EntityFrameworkCore;
using DrinkShop.WebApi.Utilities;
using DrinkShop.WebApi.Filters;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json.Serialization;
using DrinkShop.Application.constance;
using DrinkShop.Domain.Interfaces;
using DrinkShop.Infrastructure.Repositories;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2; 
using dotenv.net;
using Microsoft.AspNetCore.HttpOverrides;

var builder = WebApplication.CreateBuilder(args);
DotEnv.Load();

// ==========================================
// 1.1. CẤU HÌNH FIREBASE ADMIN (MỚI THÊM)
// ==========================================
// Đảm bảo file firebase-key.json đã set "Copy to Output Directory" -> "Copy if newer"
string pathToKey = Path.Combine(Directory.GetCurrentDirectory(), "firebase-key.json");

// Kiểm tra file key có tồn tại không để tránh lỗi crash khi deploy
if (File.Exists(pathToKey))
{
    FirebaseApp.Create(new AppOptions()
    {
        Credential = GoogleCredential.FromFile(pathToKey)
    });
}
else
{
    Console.WriteLine($"WARNING: Khong tim thay file Firebase Key tai: {pathToKey}");
}

// ==========================================
// 1. CẤU HÌNH CONTROLLERS & JSON & FILTER
// ==========================================
builder.Services.AddControllers(options =>
{
    // Đăng ký Filter tự động validate (nếu bạn có class ValidateModelAttribute)
    // options.Filters.Add<ValidateModelAttribute>(); 
})
.AddJsonOptions(options =>
{
    options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    // 👇 QUAN TRỌNG: Dòng này giúp sửa lỗi 500 do vòng lặp dữ liệu (Circular Reference)
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    
    // Format JSON cho đẹp (xuống dòng) - tùy chọn
    options.JsonSerializerOptions.WriteIndented = true;
});

// 👇 THAY ĐỔI QUAN TRỌNG: Cấu hình CORS đọc từ biến môi trường
// Nếu không có biến ClientUrl (chạy local), mặc định dùng localhost:5173
var clientUrl = builder.Configuration["ClientUrl"] ?? "http://localhost:5173";

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(clientUrl) // Cho phép domain được cấu hình
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// 2. Custom lại format lỗi trả về khi dữ liệu không hợp lệ (BadRequest)
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var errors = context.ModelState
            .Where(e => e.Value != null && e.Value.Errors.Count > 0)
            .Select(e => $"{e.Key}: {string.Join(", ", e.Value!.Errors.Select(er => er.ErrorMessage))}")
            .ToList();

        return new BadRequestObjectResult(new
        {
            success = false,
            message = "Dữ liệu không hợp lệ",
            errors = errors
        });
    };
});

// ==========================================
// 2. CẤU HÌNH DATABASE
// ==========================================
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString,
        b => b.MigrationsAssembly("DrinkShop.Infrastructure")));

// ==========================================
// 3. CẤU HÌNH AUTHENTICATION (JWT)
// ==========================================
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = "DrinkShop",
            ValidAudience = "DrinkShopClient",
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes("this_is_a_very_strong_and_secure_secret_key_64_chars_long!")
            )
        };
    });

// ==========================================
// 4. CẤU HÌNH AUTHORIZATION (PHÂN QUYỀN)
// ==========================================
builder.Services.AddAuthorization(options =>
{
    // ... (Giữ nguyên các Policy của bạn) ...
    options.AddPolicy("CanViewProduct", policy => 
        policy.RequireClaim("Permission", Permissions.Product.View));

    options.AddPolicy("CanManageProduct", policy => 
        policy.RequireClaim("Permission", 
            Permissions.Product.Manage, 
            Permissions.Product.Create, 
            Permissions.Product.Edit, 
            Permissions.Product.Delete));

    options.AddPolicy("CanManageOrder", policy => 
        policy.RequireClaim("Permission", Permissions.Order.Manage));

    options.AddPolicy(Permissions.Order.ViewAll, policy => 
        policy.RequireClaim("Permission", Permissions.Order.ViewAll));

    options.AddPolicy(Permissions.Order.ViewMine, policy => 
        policy.RequireClaim("Permission", Permissions.Order.ViewMine));

    options.AddPolicy("CanManageVoucher", policy => 
        policy.RequireClaim("Permission",
            Permissions.Voucher.ViewAll, 
            Permissions.Voucher.Create, 
            Permissions.Voucher.Edit, 
            Permissions.Voucher.Delete)); 

    options.AddPolicy(Permissions.Statistic.ViewRevenue, policy => 
        policy.RequireClaim("Permission", Permissions.Statistic.ViewRevenue));

    options.AddPolicy(Permissions.Statistic.ViewTopProducts, policy => 
        policy.RequireClaim("Permission", Permissions.Statistic.ViewTopProducts));

    options.AddPolicy(Permissions.Statistic.ViewRating, policy => 
        policy.RequireClaim("Permission", Permissions.Statistic.ViewRating));

    options.AddPolicy(Permissions.Pos.CreateOrder, policy => 
        policy.RequireClaim("Permission", Permissions.Pos.CreateOrder));
});

// ==========================================
// 5. CẤU HÌNH SWAGGER
// ==========================================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "DrinkShop.WebApi",
        Version = "v1"
    });

    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Nhập token theo định dạng: Bearer {your JWT token}"
    });

    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ==========================================
// 6. ĐĂNG KÝ DEPENDENCY INJECTION (DI)
// ==========================================
builder.Services.AddScoped<IFileStorageService, FileStorageService>();
builder.Services.AddDirectoryBrowser();

builder.Services.AddScoped<IPhanLoaiService, PhanLoaiService>();
builder.Services.AddScoped<ISanPhamService, SanPhamService>();
builder.Services.AddScoped<IGioHangService, GioHangService>();
builder.Services.AddScoped<IDonHangService, DonHangService>();
builder.Services.AddScoped<IVoucherService, VoucherService>();
builder.Services.AddScoped<IDanhGiaService, DanhGiaService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<INguyenLieuService, NguyenLieuService>();
builder.Services.AddScoped<IPosService, PosService>();
builder.Services.AddScoped<IStatisticRepository, StatisticRepository>();
builder.Services.AddScoped<IThongKeService, ThongKeService>();
builder.Services.AddScoped<IGroqService, GroqService>();

// ==========================================
// 7. BUILD & PIPELINE
// ==========================================
var app = builder.Build();

// 2. Middleware xử lý lỗi toàn cục (Đặt sớm nhất có thể)
app.UseMiddleware<ExceptionMiddleware>();

// 3. Chuyển hướng HTTPS (Trong Docker internal thường dùng HTTP, HTTPS do Gateway xử lý)
// app.UseHttpsRedirection(); 

app.UseStaticFiles();

// 4. Routing
app.UseRouting(); 
app.UseCors(); // Kích hoạt CORS với policy đã định nghĩa ở trên

// 5. Cấu hình Swagger
// 👇 Đã comment điều kiện if(dev) để luôn hiện Swagger khi deploy test
// if (app.Environment.IsDevelopment())
// {
    app.UseSwagger();
    app.UseSwaggerUI();
// }

// 6. QUAN TRỌNG: Thứ tự Xác thực (Authentication) -> Phân quyền (Authorization)
app.UseAuthentication(); 
app.UseAuthorization();

// 7. Chạy Controllers (Sử dụng endpoint routing)
app.MapControllers();

app.Run();