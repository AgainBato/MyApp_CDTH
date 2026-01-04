import React, { createContext, useState, useContext } from 'react';
import api from '../src/api/apiConfig'; // Đảm bảo đường dẫn này đúng

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
const [orders, setOrders] = useState([]);
const [pageNumber, setPageNumber] = useState(1); // Sửa 'page' thành 'pageNumber'
const [totalPages, setTotalPages] = useState(1); // Thêm biến này để biết tổng số trang
const [loading, setLoading] = useState(false);
const [hasNextPage, setHasNextPage] = useState(true); // Để dùng cho nút bấm "Sau >"
const [refreshing, setRefreshing] = useState(false);

const fetchMyOrders = async (targetPage = 1) => {
  if (loading) return;
  setLoading(true);

  try {
    const res = await api.get('/api/DonHang/my-orders', {
      params: { pageNumber: targetPage, pageSize: 5 }
    });

    const result = res.data.data;

    setOrders(result.items);
    setPageNumber(result.currentPage);
    setTotalPages(result.totalPages);
    
    // Cập nhật trạng thái còn trang tiếp theo hay không
    setHasNextPage(result.currentPage < result.totalPages); 

  } catch (error) {
    console.error("Lỗi:", error);
  } finally {
    setLoading(false);
  }
};

  return (
    <OrderContext.Provider value={{ orders, loading, fetchMyOrders, hasNextPage, pageNumber, totalPages }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => useContext(OrderContext);