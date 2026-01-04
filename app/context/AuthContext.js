import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null); // nếu muốn lưu info người dùng

  // Kiểm tra token khi mở app
  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        const userStr = await AsyncStorage.getItem("userInfo");
        setIsLoggedIn(!!token);
        setUserInfo(userStr ? JSON.parse(userStr) : null);
      } catch (e) {
        console.log("Error reading token:", e);
        setIsLoggedIn(false);
        setUserInfo(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkToken();
  }, []);

  // Hàm login
  const login = async (token, info = null) => {
    try {
      await AsyncStorage.setItem("accessToken", token);
      if (info) {
        await AsyncStorage.setItem("userInfo", JSON.stringify(info));
        setUserInfo(info);
      }
      setIsLoggedIn(true);
    } catch (e) {
      console.log("Login error:", e);
    }
  };

  // Hàm logout
  const logout = async () => {
    try {
      await AsyncStorage.removeItem("accessToken");
      await AsyncStorage.removeItem("refreshToken"); // nếu dùng refreshToken
      await AsyncStorage.removeItem("userInfo");
    } catch (e) {
      console.log("Logout error:", e);
    } finally {
      setIsLoggedIn(false);
      setUserInfo(null);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, login, logout, userInfo }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook tiện dụng
export const useAuth = () => useContext(AuthContext);
