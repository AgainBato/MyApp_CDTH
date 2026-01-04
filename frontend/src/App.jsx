import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import Pages
import MainLayout from './layouts/MainLayout';
import OrderManager from './pages/OrderManager';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import PointOfSale from './pages/PointOfSale';
import Login from './pages/Login'; // Đảm bảo bạn đã tạo file Login.jsx như hướng dẫn trước

function App() {
  const [user, setUser] = useState(null);

  // 1. Kiểm tra đăng nhập khi F5 trang
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // 2. Hàm xử lý khi nhấn Đăng nhập (từ trang Login)
  const handleLogin = (userData) => {
    setUser(userData);
  };

  // 3. Hàm xử lý khi nhấn Đăng xuất (từ MainLayout)
  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  // 4. Component bảo vệ: Chưa đăng nhập -> Đá về trang Login
  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <BrowserRouter>
      {/* Container hiển thị thông báo (Toast) */}
      <ToastContainer position="top-right" autoClose={2000} />
      
      <Routes>
        {/* Route Đăng nhập (Không cần Layout) */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />

        {/* Route Chính (Cần đăng nhập mới vào được) */}
        <Route path="/" element={
            <ProtectedRoute>
              {/* Truyền user và hàm logout xuống MainLayout */}
              <MainLayout user={user} onLogout={handleLogout} />
            </ProtectedRoute>
        }>
          {/* Mặc định vào Orders */}
          <Route index element={<Navigate to="/orders" replace />} />

          <Route path="orders" element={<OrderManager />} />
          <Route path="pos" element={<PointOfSale />} />
          
          {/* Ai cũng vào được kho và báo cáo (theo yêu cầu mới của bạn) */}
          <Route path="inventory" element={<Inventory/>} />
          <Route path="reports" element={<Reports/>} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;