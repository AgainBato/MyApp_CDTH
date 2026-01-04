using DrinkShop.Application.Helpers;
using DrinkShop.Application.Interfaces;
using DrinkShop.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using System.IO;
using System;
using DrinkShop.Application.constance.Response;

[Route("api/[controller]")]
[ApiController]
public class SanPhamsController : ControllerBase
{
    private readonly ISanPhamService _sanPhamService;
    private readonly IConfiguration _configuration;
    // 1. Khai báo thêm biến private cho Service lưu trữ file
    private readonly IFileStorageService _fileStorageService;

    public SanPhamsController(
        ISanPhamService sanPhamService, 
        IConfiguration configuration,
        IFileStorageService fileStorageService) // Nhận thêm tham số ở đây
    {
        _sanPhamService = sanPhamService;
        _configuration = configuration;
        _fileStorageService = fileStorageService; // Gán giá trị vào biến nội bộ
    }

    // --- PRIVATE METHODS (Xử lý Placeholder) ---

    // 1. Overload cho Entity (Dùng cho danh sách)
    private SanPham ApplyPlaceholder(SanPham sanPham)
    {
        if (sanPham == null) return null;
        var defaultImageUrl = _configuration["AppSettings:DefaultProductImageUrl"];
        if (string.IsNullOrEmpty(sanPham.ImageUrl)) sanPham.ImageUrl = defaultImageUrl;
        return sanPham;
    }

    // 2. Overload cho DTO (Dùng cho chi tiết - Mới thêm)
    private SanPhamResponse ApplyPlaceholder(SanPhamResponse sanPham)
    {
        if (sanPham == null) return null;
        var defaultImageUrl = _configuration["AppSettings:DefaultProductImageUrl"];
        if (string.IsNullOrEmpty(sanPham.ImageUrl)) sanPham.ImageUrl = defaultImageUrl;
        return sanPham;
    }

    // --- GET (PUBLIC) ---

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetSanPhams([FromQuery] PaginationParams paginationParams, [FromQuery] string? tenSanPham, [FromQuery] int? IDPhanLoai)
    {
        // Hàm này trả về List<SanPham> (Entity) -> Dùng ApplyPlaceholder(Entity)
        var pagedList = await _sanPhamService.GetSanPhams(paginationParams, tenSanPham, IDPhanLoai);

        foreach (var sanPham in pagedList.Items)
        {
            ApplyPlaceholder(sanPham);
        }

        Response.Headers.Append("X-Pagination", JsonSerializer.Serialize(new
        {
            pagedList.CurrentPage,
            pagedList.TotalPages,
            pagedList.PageSize,
            pagedList.TotalCount
        }));

        return Ok(pagedList);
    }

    [AllowAnonymous]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetSanPham(int id)
    {
        // Hàm này trả về SanPhamResponse (DTO) -> Dùng ApplyPlaceholder(DTO)
        var sanPhamDto = await _sanPhamService.GetSanPhamById(id);
        
        if (sanPhamDto == null) return NotFound();
        
        return Ok(ApplyPlaceholder(sanPhamDto));
    }

    // --- MANAGER (POST/PUT/DELETE) ---

    [Authorize(Policy = "CanManageProduct")]
    [HttpPost]
    public async Task<IActionResult> PostSanPham(SanPham sanPham)
    {
        await _sanPhamService.AddSanPham(sanPham);
        // Lưu ý: CreatedAtAction trỏ về GetSanPham (trả về DTO) là hợp lệ
        return CreatedAtAction(nameof(GetSanPham), new { id = sanPham.IDSanPham }, sanPham);
    }

    [Authorize(Policy = "CanManageProduct")]
    [HttpPut("{id}")]
    public async Task<IActionResult> PutSanPham(int id, SanPham sanPham)
    {
        if (id != sanPham.IDSanPham) return BadRequest("ID không khớp");
        await _sanPhamService.UpdateSanPham(sanPham);
        return NoContent();
    }

    [Authorize(Policy = "CanManageProduct")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSanPham(int id)
    {
        await _sanPhamService.DeleteSanPham(id);
        return NoContent();
    }

    // --- UPLOAD ẢNH (QUAN TRỌNG: ĐÃ SỬA LOGIC GỌI SERVICE) ---

    [Authorize(Policy = "CanManageProduct")]
    [HttpPost("{id}/image")]
    public async Task<IActionResult> UploadImage(int id, IFormFile file)
    {
        // 1. Kiểm tra tính hợp lệ của file
        if (file == null || file.Length == 0) 
            return BadRequest(new { message = "File không hợp lệ." });

        // 2. Lấy Entity gốc (Không dùng DTO để đảm bảo lưu được vào DB)
        var sanPham = await _sanPhamService.GetOriginalSanPhamById(id);
        if (sanPham == null) 
            return NotFound(new { message = "Không tìm thấy sản phẩm." });

        try
        {
            // 3. Xử lý xóa ảnh cũ nếu có
            // Lưu ý: DeleteFileAsync trong Service của bạn giờ nhận vào một URL
            if (!string.IsNullOrEmpty(sanPham.ImageUrl))
            {
                await _fileStorageService.DeleteFileAsync(sanPham.ImageUrl);
            }

            // 4. Gọi Service để lưu ảnh mới vào thư mục 'products'
            // Service này sẽ tự tạo Guid và trả về URL hoàn chỉnh (chứa IP của bạn)
            string newUrl = await _fileStorageService.SaveFileAsync(file, "products");

            // 5. Cập nhật Entity và lưu vào Database thông qua Service
            sanPham.ImageUrl = newUrl;
            await _sanPhamService.UpdateSanPham(sanPham);

            return Ok(new { 
                message = "Cập nhật ảnh sản phẩm thành công", 
                imageUrl = newUrl 
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
        }
    }
    
}