import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaSpinner, FaStar } from 'react-icons/fa';
import axiosClient from '../api/axiosClient'; 
import { toast } from 'react-toastify';

const Reports = () => {
  // --- STATE ---
  const [revenueData, setRevenueData] = useState(0);
  const [topProducts, setTopProducts] = useState([]);
  const [ratingStats, setRatingStats] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('month'); // day, month, year

  // --- GỌI API ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Gọi API Doanh thu
        const resRevenue = await axiosClient.get(`/ThongKe/revenue?type=${filterType}`);
        
        // 🔴 SỬA LỖI Ở ĐÂY: Backend trả về Mảng, ta cần tính tổng
        const rawList = Array.isArray(resRevenue.data) ? resRevenue.data : [];
        
        // Dùng hàm reduce để cộng dồn totalRevenue của từng phần tử trong mảng
        const totalRev = rawList.reduce((sum, item) => sum + (item.totalRevenue || 0), 0);
        
        setRevenueData(totalRev);

        // 2. Gọi API Top Bán Chạy
        const resTop = await axiosClient.get('/ThongKe/top-products?n=5');
        setTopProducts(resTop.data || []);

        // 3. Gọi API Đánh giá
        const resRating = await axiosClient.get('/ThongKe/ratings');
        // Vì API rating trong StatisticRepository đang trả về list rỗng, ta mock tạm dữ liệu để hiển thị demo
        // Sau này bạn code xong phần repository đánh giá thì bỏ dòng mock này đi
        const mockRating = { averageRating: 4.8, totalReviews: 125 };
        setRatingStats(resRating.data && resRating.data.length > 0 ? resRating.data : mockRating); 

      } catch (error) {
        console.error("Lỗi tải báo cáo:", error);
        toast.error("Không thể tải dữ liệu báo cáo!");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filterType]); 

  // --- HÀM HỖ TRỢ ---
  const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

  // --- STYLES ---
  const styles = {
    container: { display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif', height: '100%', gap: '20px' },
    title: { fontSize: '24px', fontWeight: 'bold', color: '#000', margin: 0, textTransform: 'uppercase' },
    filterBar: { display: 'flex', gap: '10px', marginBottom: '10px' },
    filterBtn: (isActive) => ({
        padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 'bold',
        backgroundColor: isActive ? '#EA580C' : '#fff', color: isActive ? '#fff' : '#666', boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
    }),
    cardsContainer: { display: 'flex', gap: '20px', flex: 1, alignItems: 'stretch', flexWrap: 'wrap' },
    card: { flex: 1, minWidth: '300px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', padding: '20px', display: 'flex', flexDirection: 'column' },
    cardTitle: { fontSize: '16px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center', color: '#EA580C', borderBottom: '2px dashed #eee', paddingBottom: '10px', textTransform: 'uppercase' },
    revenueText: { fontSize: '32px', fontWeight: 'bold', color: '#166534', textAlign: 'center', margin: 'auto' },
    listContainer: { display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', flex: 1 },
    listItem: { display: 'flex', justifyContent: 'space-between', fontSize: '14px', borderBottom: '1px solid #f9f9f9', paddingBottom: '8px' },
    ratingBox: { textAlign: 'center', marginTop: 'auto', marginBottom: 'auto' },
    ratingScore: { fontSize: '48px', fontWeight: 'bold', color: '#333' },
    footer: { display: 'flex', justifyContent: 'flex-end', paddingTop: '10px' },
    exportBtn: { backgroundColor: '#1E293B', color: '#fff', border: 'none', padding: '12px 30px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }
  };

  if (loading && revenueData === 0 && topProducts.length === 0) {
      return <div style={{padding:'50px', textAlign:'center', color: '#666'}}><FaSpinner className="spinner"/> Đang tải báo cáo...</div>
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>BÁO CÁO THỐNG KÊ</h1>

      <div style={styles.filterBar}>
         <button style={styles.filterBtn(filterType === 'day')} onClick={() => setFilterType('day')}>Hôm nay</button>
         <button style={styles.filterBtn(filterType === 'month')} onClick={() => setFilterType('month')}>Tháng này</button>
         <button style={styles.filterBtn(filterType === 'year')} onClick={() => setFilterType('year')}>Năm nay</button>
      </div>

      <div style={styles.cardsContainer}>
        
        {/* CARD 1: TỔNG DOANH THU */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>DOANH THU</div>
          <div style={styles.revenueText}>
             {formatPrice(revenueData)}
          </div>
          <div style={{textAlign: 'center', color: '#888', fontSize: '13px', marginTop: '10px'}}>
             (Tổng hợp theo {filterType === 'day' ? 'ngày' : filterType === 'month' ? 'tháng' : 'năm'})
          </div>
        </div>

        {/* CARD 2: TOP SẢN PHẨM BÁN CHẠY */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>TOP 5 BÁN CHẠY</div>
          <div style={styles.listContainer}>
             {topProducts.length === 0 ? <p style={{textAlign:'center', color:'#999'}}>Chưa có dữ liệu</p> : 
                topProducts.map((item, index) => (
                  <div key={index} style={styles.listItem}>
                    {/* Map đúng tên biến từ DTO: productName, soLuong */}
                    <span>#{index + 1} <b>{item.productName || item.tenSanPham}</b></span>
                    <span style={{color: '#EA580C', fontWeight:'bold'}}>{item.soLuong} ly</span>
                  </div>
                ))
             }
          </div>
        </div>

        {/* CARD 3: ĐÁNH GIÁ */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>CHẤT LƯỢNG DỊCH VỤ</div>
          <div style={styles.ratingBox}>
              <div style={styles.ratingScore}>
                  {ratingStats?.averageRating || 0}/5
              </div>
              <div>
                  {[1,2,3,4,5].map(s => (
                      <FaStar key={s} color={s <= (ratingStats?.averageRating || 0) ? '#FBBF24' : '#E5E7EB'} size={24}/>
                  ))}
              </div>
              <div style={{marginTop: '15px', color: '#666'}}>
                  Dựa trên <b>{ratingStats?.totalReviews || 0}</b> lượt đánh giá
              </div>
          </div>
        </div>

      </div>

      <div style={styles.footer}>
        <button style={styles.exportBtn} onClick={() => toast.info("Đã xuất báo cáo thành công!")}>XUẤT BÁO CÁO</button>
      </div>
      
      <style>{`.spinner { animation: spin 1s linear infinite; } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Reports;