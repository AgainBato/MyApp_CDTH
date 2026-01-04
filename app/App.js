import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Giữ lại các Provider
import { AuthProvider } from "./context/AuthContext";
import { CartProvider, useCart } from "./context/CartContext";
import { OrderProvider } from "./context/OrderContext";

// Import Screens
import HomeScreen from "./screens/HomeScreen";
import CategoryScreen from "./screens/CategoryScreen";
import ProfileScreen from "./screens/ProfileScreen";
import LoginScreen from "./screens/LoginScreen";
import CartScreen from "./screens/CartScreen";
import ConfirmOrderScreen from "./screens/ConfirmOrderScreen";
import EditProfileScreen from "./screens/EditProfileScreen";
import ChangePasswordScreen from "./screens/ChangePasswordScreen";
import OrderHistoryScreen from "./screens/OrderHistoryScreen";
import OrderDetailScreen from "./screens/OrderDetailScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import RegisterScreen from "./screens/RegisterScreen";
import VoucherScreen from "./screens/VoucherScreen";
import ResetPasswordScreen from "./screens/ResetPasswordScreen";
import ProductScreen from "./screens/ProductScreen"; 
import ChatScreen from "./screens/ChatScreen";


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// --- TAB NAVIGATOR ---
function TabNavigator() {
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#ff6600",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: { paddingBottom: 5, height: 60 },
        tabBarIcon: ({ color, size }) => {
          let icon;
          if (route.name === "Home") icon = "home";
          else if (route.name === "Category") icon = "list";
          // 👇 SỬ DỤNG TÊN ROUTE "CartScreen" CHO GIỎ HÀNG (để khớp với Stack)
          else if (route.name === "CartScreen") icon = "cart"; 
          // else if (route.name === "Orders") icon = "receipt";
          else if (route.name === "Profile") icon = "person";
          return <Ionicons name={icon} size={size} color={color} />;
        },
      })}
    >
      {/* 👇 TÊN ROUTE PHẢI KHỚP: Đảm bảo màn hình Home nằm ở đây */}
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "Trang chủ" }} />
      <Tab.Screen name="Category" component={CategoryScreen} options={{ title: "Danh mục" }} />
      
      {/* 👇 FIX: Đổi tên Tab Route Giỏ hàng thành "CartScreen" để đồng nhất */}
      <Tab.Screen
        name="CartScreen"
        component={CartScreen}
        options={{
          title: "Giỏ hàng",
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name="cart" size={size} color={color} />
              {cartCount > 0 && (
                <View style={{ position: "absolute", right: -6, top: -3, backgroundColor: "red", borderRadius: 8, width: 16, height: 16, justifyContent: "center", alignItems: "center" }}>
                  <Text style={{ color: "white", fontSize: 10, fontWeight: "bold" }}>{cartCount}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />

      {/* <Tab.Screen name="Orders" component={OrderHistoryScreen} options={{ title: "Đơn hàng" }} /> */}
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "Tài khoản" }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  // Kiểm tra đăng nhập khi mở App
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        setInitialRoute(token ? "Main" : "Login");
      } catch (e) {
        setInitialRoute("Login");
      }
    };
    checkLogin();
  }, []);

  if (initialRoute === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#ff6600" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <AuthProvider>
          <CartProvider>
            <OrderProvider>
              <NavigationContainer>
                <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerTintColor: "#ff6600" }}>
                  
                  {/* === CÁC MÀN HÌNH CHÍNH (STACK NAVIGATOR) === */}
                  
                  <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                  <Stack.Screen name="RegisterScreen" component={RegisterScreen} options={{ title: "Đăng ký" }} />
                  <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} options={{ title: "Quên mật khẩu" }} />
                  <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} options={{ title: "Đặt lại mật khẩu" }} />

                  {/* 👇 Màn hình Tab Navigator (Chứa các Tab: Home, CartScreen, v.v.) */}
                  <Stack.Screen name="Main" component={TabNavigator} options={{ headerShown: false }} />
                  <Stack.Screen name="Chatbot" component={ChatScreen} />
                  
                  {/* 👇 FIX LỖI: Đăng ký màn hình Home ở cấp Stack CHA (cho phép gọi từ CartScreen) */}
                  <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
                  
                  {/* 👇 FIX LỖI: Đăng ký màn hình CartScreen ở cấp Stack CHA */}
                  <Stack.Screen name="CartScreen" component={CartScreen} options={{ headerShown: false }}/>


                  <Stack.Screen name="ConfirmOrder" component={ConfirmOrderScreen} options={{ title: "Xác nhận" }}/>
                  <Stack.Screen name="UserProfileScreen" component={EditProfileScreen} options={{ title: "Sửa hồ sơ" }}/>
                  <Stack.Screen name="ChangePasswordScreen" component={ChangePasswordScreen} options={{ title: "Đổi mật khẩu" }}/>
                  <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: "Chi tiết đơn hàng" }}/>
                  <Stack.Screen name="VoucherScreen" component={VoucherScreen} options={{ headerShown: false }}/>

                  <Stack.Screen 
                    name="ProductScreen" 
                    component={ProductScreen} 
                    options={{ headerShown: false }} 
                  />
                  <Stack.Screen 
                    name="OrderHistoryScreen" // <--- Đây là cái tên định danh (Route Name)
                    component={OrderHistoryScreen} 
                    options={{ title: "Lịch sử mua hàng" }} 
                  />
                  <Stack.Screen 
                    name="OrderDetailScreen"  // <-- Tên này phải khớp chính xác với lệnh replace()
                    component={OrderDetailScreen} 
                    options={{ title: "Chi tiết đơn hàng" }} 
                  />

                </Stack.Navigator>
              </NavigationContainer>
            </OrderProvider>
          </CartProvider>
        </AuthProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}