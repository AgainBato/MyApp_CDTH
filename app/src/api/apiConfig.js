import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ⚠️ Lưu ý: IP này có thể thay đổi nếu bạn tắt mở lại Wifi máy tính
export const API_URL = "http://172.16.1.57:5118";

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // Thêm timeout 10s để app không bị treo nếu mạng lag
  headers: {
    "Content-Type": "application/json",
  },
});

// 👇 1. REQUEST INTERCEPTOR (Gửi đi)
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      
      // 🔍 Debug: In ra xem có token thật không
      if (token) {
        // console.log("🔑 Token tìm thấy:", token.substring(0, 10) + "..."); // Chỉ in 1 đoạn đầu cho gọn
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.log("⚠️ Không tìm thấy Token trong AsyncStorage!");
      }
    } catch (error) {
      console.log("Lỗi lấy token:", error);
    }
    
    // DEBUG: Log request body và params
    if (config.data) {
      console.log(`📤 Request to ${config.url}:`, config.data);
    }
    if (config.params) {
      console.log(`📤 Request params to ${config.url}:`, config.params);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 👇 2. RESPONSE INTERCEPTOR (Nhận về - QUAN TRỌNG ĐỂ BẮT LỖI 500)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server trả về lỗi (4xx, 5xx)
      console.log(`🔥 API Lỗi [${error.response.status}]:`, error.response.data);
      
      if (error.response.status === 401) {
        // Token hết hạn hoặc sai -> Có thể điều hướng về trang Login tại đây
        console.log("Token hết hạn, cần đăng nhập lại");
      }
    } else if (error.request) {
      // Không nhận được phản hồi (Server tắt hoặc sai IP)
      console.log("🔥 Không kết nối được Server (Kiểm tra lại IP hoặc Wifi)");
    } else {
      console.log("🔥 Lỗi config axios:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;