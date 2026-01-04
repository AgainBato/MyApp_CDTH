import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { FaBox, FaShoppingCart, FaClipboardList, FaChartBar, FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import logo from '../assets/logo.png';

const MainLayout = ({ user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate('/login');
  };

  // --- STYLE ---  
  const styles = {
    container: {
      display: 'flex',
      height: '100vh',
      width: '100vw',
      fontFamily: 'Arial, sans-serif',
      overflow: 'hidden',
    },
    // SIDEBAR TỔNG
    sidebar: {
      width: '260px',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      borderRight: '1px solid #ddd',
    },

    // 1. PHẦN LOGO
    sidebarTop: {
      height: '180px', // Thu gọn lại chút để nhường chỗ cho User Info
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '10px',
      borderBottom: '1px solid #eee',
    },
    logoImage: {
      maxWidth: '80%',
      maxHeight: '80%',
      objectFit: 'contain'
    },

    // 2. PHẦN THÔNG TIN USER (MỚI)
    userInfo: { 
      padding: '15px', 
      backgroundColor: '#FFF7ED', // Cam rất nhạt
      borderBottom: '1px solid #FFEDD5', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '10px' 
    },
    userName: { fontSize: '14px', fontWeight: 'bold', color: '#EA580C' },
    userRole: { fontSize: '12px', color: '#666' },

    // 3. PHẦN MENU (Nền cam)
    sidebarBottom: {
      flex: 1,
      backgroundColor: '#EA580C', // Màu cam đậm
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    },
    
    icon: {
      marginRight: '15px',
      fontSize: '20px'
    },

    // NỘI DUNG CHÍNH (Bên phải)
    mainContent: {
      flex: 1,
      backgroundColor: '#f5f5f5',
      padding: '20px',
      overflowY: 'auto',
    },

    // Nút đăng xuất
    logoutBtn: { 
      marginTop: 'auto', 
      display: 'flex', 
      alignItems: 'center', 
      padding: '12px 20px', 
      color: 'white', 
      cursor: 'pointer', 
      borderTop: '1px solid rgba(255,255,255,0.2)',
      transition: 'background 0.2s'
    }
  };

  // Hàm style động cho Link
  const getLinkStyle = (path) => {
    const isActive = location.pathname === path;
    return {
      display: 'flex',
      alignItems: 'center',
      padding: '12px 20px',
      textDecoration: 'none',
      color: 'white',
      fontSize: '16px',
      fontWeight: '500',
      borderRadius: '8px',
      marginBottom: '8px',
      transition: '0.2s',
      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : 'transparent', 
      boxShadow: isActive ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
      fontWeight: isActive ? 'bold' : '500'
    };
  };

  return (
    <div style={styles.container}>
      {/* --- SIDEBAR TRÁI --- */}
      <div style={styles.sidebar}>
        
        {/* 1. Logo Section */}
        <div style={styles.sidebarTop}>
           <img src={logo} alt="Logo Flash" style={styles.logoImage} />
        </div>

        {/* 2. User Info Section (Hiển thị tên người đăng nhập) */}
        <div style={styles.userInfo}>
            <FaUserCircle size={30} color="#EA580C" />
            <div>
                <div style={styles.userName}>{user?.name || 'User'}</div>
                <div style={styles.userRole}>{user?.role === 'Manager' ? 'Quản Lý' : 'Nhân Viên'}</div>
            </div>
        </div>

        {/* 3. Menu Section */}
        <div style={styles.sidebarBottom}>
          
          <Link to="/orders" style={getLinkStyle('/orders')}>
            <FaBox style={styles.icon} />
            Order Manager
          </Link>

          <Link to="/pos" style={getLinkStyle('/pos')}>
            <FaShoppingCart style={styles.icon} />
            Point of Sale
          </Link>

          <Link to="/inventory" style={getLinkStyle('/inventory')}>
            <FaClipboardList style={styles.icon} />
            Inventory Check
          </Link>

          <Link to="/reports" style={getLinkStyle('/reports')}>
            <FaChartBar style={styles.icon} />
            Reports
          </Link>

          {/* Nút Đăng Xuất */}
          <div 
            style={styles.logoutBtn} 
            onClick={handleLogout}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <FaSignOutAlt style={styles.icon} />
            Đăng Xuất
          </div>

        </div>
      </div>

      {/* --- CONTENT PHẢI --- */}
      <div style={styles.mainContent}>
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;