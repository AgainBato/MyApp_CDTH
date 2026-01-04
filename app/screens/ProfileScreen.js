// screens/ProfileScreen.js
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 👇 Import quan trọng để tự động load lại dữ liệu
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProfileScreen = ({ onLogout }) => {
  const navigation = useNavigation();
  
  // State lưu thông tin người dùng thật
  const [userData, setUserData] = useState(null);

  // 👇 HÀM LOAD DỮ LIỆU TỪ STORAGE
  const loadUserInfo = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem("userInfo");
      if (jsonValue != null) {
        const parsedUser = JSON.parse(jsonValue);
        setUserData(parsedUser);
      }
    } catch (e) {
      console.error("Lỗi load user info:", e);
    }
  };

  // 👇 TỰ ĐỘNG CHẠY KHI MÀN HÌNH ĐƯỢC MỞ
  useFocusEffect(
    useCallback(() => {
      loadUserInfo();
    }, [])
  );

  // Danh sách tính năng
  const menuItems = [
    // Lưu ý: "screen" phải khớp chính xác tên trong App.js
    { id: 1, title: "Chỉnh sửa thông tin cá nhân", icon: "👤", screen: "UserProfileScreen" }, 
    { id: 2, title: "Thay đổi mật khẩu", icon: "🔒", screen: "ChangePasswordScreen" },
    { id: 3, title: "Lịch sử đơn", icon: "🧾", screen: "OrderHistoryScreen" },
    
    // 👇 SỬA LẠI: "VoucherScreen" (Không có chữ 's' ở cuối)
    { id: 4, title: "Kho Voucher", icon: "🎁", screen: "VoucherScreen" }, 
  ];

  const handleMenuPress = (item) => {
    if (item.screen) {
        // Điều hướng
        if (item.title === "Chỉnh sửa thông tin cá nhân") {
             navigation.navigate("UserProfileScreen");
        } else if (item.title === "Thay đổi mật khẩu") {
             navigation.navigate("ChangePasswordScreen"); 
        } else {
             // Các mục khác (Voucher, Order...) sẽ chạy vào đây
             try {
                navigation.navigate(item.screen);
             } catch (err) {
                console.log(err);
                Alert.alert("Thông báo", "Chưa tìm thấy màn hình này");
             }
        }
    } else {
        Alert.alert("Thông báo", "Tính năng đang phát triển");
    }
  };

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất không?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
            // Xóa sạch dữ liệu phiên đăng nhập
            await AsyncStorage.removeItem("accessToken");
            await AsyncStorage.removeItem("userInfo");
            await AsyncStorage.removeItem("refreshToken");
            
            if (onLogout) {
                onLogout(); 
            } else {
                // Fallback nếu không truyền prop onLogout
                navigation.replace("Login"); 
            }
        }, 
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* 👤 Thông tin người dùng */}
        <View style={styles.profileBox}>
            {/* Logic Avatar: Có link ảnh thì hiện, không thì hiện ảnh mặc định */}
          <Image 
            source={ 
                userData?.avatar 
                ? { uri: userData.avatar } 
                : require("../assets/avatar.jpg") 
            } 
            style={styles.avatar} 
          />
          
          <View style={styles.info}>
            <Text style={styles.name}>
                {userData?.hoTen || "Khách hàng"}
            </Text>
             {userData?.sdt && (
                <Text style={styles.phone}>{userData.sdt}</Text>
             )}
          </View>
        </View>

        {/* ⚙️ Menu */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => handleMenuPress(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 🚪 Nút đăng xuất */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 16,
  },
  profileBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginVertical: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: '#eee'
  },
  info: {
    marginLeft: 16,
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  email: {
    fontSize: 15,
    color: "#777",
    marginTop: 4,
  },
  phone: {
    fontSize: 14,
    color: "#999",
    marginTop: 2,
  },
  menuContainer: {
    marginTop: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
  },
  menuIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  logoutButton: {
    backgroundColor: "#ff4444",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  logoutText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});