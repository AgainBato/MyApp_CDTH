import { initializeApp, getApp, getApps } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDtZXiFvD8OeJKRdWTKTtzWnahIpu0Bayw",
  authDomain: "drink-shop-app-98ac1.firebaseapp.com",
  projectId: "drink-shop-app-98ac1",
  storageBucket: "drink-shop-app-98ac1.firebasestorage.app",
  messagingSenderId: "576154742174",
  appId: "1:576154742174:web:f62b6cdd2eca64f924ba8f",
  measurementId: "G-RVQPLM3MT9"
};

// 1. Khởi tạo Firebase App (Kiểm tra nếu đã tồn tại thì lấy app cũ)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// 2. Khởi tạo Auth với bộ nhớ đệm (Persistence)
// Sử dụng tên biến ReactNativeAsyncStorage đúng như đã import
let auth;
try {
    auth = getAuth(app);
} catch (error) {
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
}

export { auth };