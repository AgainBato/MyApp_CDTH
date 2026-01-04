using DrinkShop.Application.DTO;
using DrinkShop.Application.Interfaces;
using DrinkShop.Domain.Entities;
using DrinkShop.Infrastructure; 
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DrinkShop.Application.Services
{
    public class PosService : IPosService
    {
        private readonly ApplicationDbContext _context;

        public PosService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<PosOrderReceiptDto> CreateAndPayPosOrderAsync(PosCreateOrderDto request, int staffId)
        {
            if (request.Items == null || !request.Items.Any())
                throw new Exception("Đơn hàng phải có ít nhất 1 sản phẩm.");

            decimal totalAmount = 0;
            var orderDetails = new List<DonHangSanPham>();

            foreach (var item in request.Items)
            {
                var product = await _context.SanPhams.FindAsync(item.IDSanPham);
                if (product == null) throw new Exception($"Sản phẩm ID {item.IDSanPham} không tồn tại.");

                totalAmount += product.Gia * item.SoLuong;

                orderDetails.Add(new DonHangSanPham
                {
                    IDSanPham = item.IDSanPham,
                    SoLuong = item.SoLuong,
                    GiaDonVi = product.Gia
                });
            }

            string paymentStatus = "Unpaid";
            string orderStatus = "In Process";
            decimal changeAmount = 0;

            if (request.PaymentMethod.ToUpper() == "CASH" && request.AmountReceived >= totalAmount)
            {
                 changeAmount = request.AmountReceived - totalAmount;
            }
            
            int guestId = staffId; 

            var order = new DonHang
            {
                IDTaiKhoan = guestId,
                NgayTao = DateTime.Now,
                TongTien = totalAmount,
                TinhTrang = orderStatus,
                TrangThaiThanhToan = paymentStatus,
                PTTT = request.PaymentMethod,
                GhiChu = request.Note + " (Web POS)",
                ChiTietDonHangs = orderDetails
            };

            _context.DonHangs.Add(order);
            await _context.SaveChangesAsync();

            return new PosOrderReceiptDto
            {
                OrderId = order.IDDonHang,
                TotalAmount = totalAmount,
                AmountReceived = request.AmountReceived,
                ChangeAmount = changeAmount,
                PaymentStatus = paymentStatus,
                CreatedAt = order.NgayTao ?? DateTime.Now,
            };
        }
    }
}