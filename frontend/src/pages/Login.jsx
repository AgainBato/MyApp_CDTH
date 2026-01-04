import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock } from 'react-icons/fa';
import logo from '../assets/logo.png'; 
import { toast } from 'react-toastify';
import axiosClient from '../api/axiosClient'; 

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Gọi API Login
      const res = await axiosClient.post('/Auth/login', {
        taiKhoan: email,
        matKhau: password
      });

      // 2. Lấy dữ liệu từ API trả về (Cấu trúc trả về trong AuthController.cs)
      const { accessToken, refreshToken, user, message } = res.data;

      // 3. Tạo object User để lưu vào LocalStorage
      // Lưu ý: Role thực tế nằm trong accessToken (JWT). 
      // Ở đây ta lưu thông tin cơ bản để hiển thị UI.
      const userData = {
        id: user.idTaiKhoan,
        name: user.hoTen || user.email,
        email: user.email,
        token: accessToken,
        refreshToken: refreshToken
        // Nếu muốn lấy Role, bạn cần giải mã token (dùng jwt-decode)
        // hoặc chờ API /me trả về role.
      };

      // 4. Lưu vào storage và cập nhật state App
      localStorage.setItem('user', JSON.stringify(userData));
      onLogin(userData);
      
      toast.success(message || "Đăng nhập thành công!");
      navigate('/');
      
    } catch (error) {
      console.error("Login Error:", error);
      // Lấy thông báo lỗi chuẩn từ Backend
      const msg = error.response?.data?.message || "Đăng nhập thất bại! Vui lòng kiểm tra lại.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // --- STYLES (Giữ nguyên) ---
  const styles = {
    container: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', fontFamily: 'Arial, sans-serif' },
    card: { backgroundColor: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px', textAlign: 'center' },
    logo: { height: '80px', objectFit: 'contain', marginBottom: '20px' },
    title: { fontSize: '24px', fontWeight: 'bold', marginBottom: '30px', color: '#333' },
    inputGroup: { marginBottom: '20px', textAlign: 'left' },
    inputWrapper: { display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '8px', padding: '10px 15px', backgroundColor: '#f9fafb' },
    icon: { color: '#9ca3af', marginRight: '10px' },
    input: { border: 'none', outline: 'none', width: '100%', backgroundColor: 'transparent', fontSize: '15px' },
    button: { width: '100%', backgroundColor: loading ? '#ccc' : '#EA580C', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontSize: '16px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '10px' },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <img src={logo} alt="Logo" style={styles.logo} />
        <h2 style={styles.title}>Đăng Nhập Hệ Thống</h2>
        
        <form onSubmit={handleLogin}>
          <div style={styles.inputGroup}>
            <div style={styles.inputWrapper}>
              <FaUser style={styles.icon} />
              <input 
                type="text" 
                placeholder="Tài khoản / Email" 
                style={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <div style={styles.inputWrapper}>
              <FaLock style={styles.icon} />
              <input 
                type="password" 
                placeholder="Mật khẩu" 
                style={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Đang xử lý..." : "ĐĂNG NHẬP"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;