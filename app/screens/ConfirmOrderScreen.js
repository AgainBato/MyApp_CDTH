import React, { useState, useEffect } from "react";
import {
  View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; 
import { Ionicons } from "@expo/vector-icons";
import api from "../src/api/apiConfig";

const PAYMENT_METHODS = [
  { key: "COD", label: "Thanh toán khi nhận hàng (COD)" },
  { key: "MOMO", label: "Ví điện tử MoMo" },
  { key: "VNPAY", label: "VNPay (QR/ATM)" },
];

const ConfirmOrderScreen = ({ route, navigation }) => {
  const {
    cart = [], // Đây là mảng các sản phẩm BẠN ĐÃ CHỌN từ Giỏ hàng
    originalTotal = 0,
    selectedVoucher = null,
    discountValue = 0,
    total = 0,
  } = route.params || {};

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [isOrdering, setIsOrdering] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [userProfile, setUserProfile] = useState({ hoTen: '', sdt: '', diaChi: null });

  const [currentVoucher, setCurrentVoucher] = useState(selectedVoucher);
  const [currentDiscount, setCurrentDiscount] = useState(discountValue);
  const [currentTotal, setCurrentTotal] = useState(total);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/api/Auth/me');
        const data = res.data.data || res.data; 
        setUserProfile({
          hoTen: data.hoTen || 'Chưa cập nhật',
          sdt: data.sdt || 'Chưa cập nhật',
          diaChi: data.diaChi || null,
        });
      } catch (error) {
        console.log("Lỗi tải thông tin người dùng");
      } finally {
        setIsProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const updateVoucher = (v) => {
    const pct = v.giamGia || v.tiLeGiam || 0;
    const discountAmt = (originalTotal * pct) / 100;
    setCurrentVoucher(v);
    setCurrentDiscount(pct);
    setCurrentTotal(originalTotal - discountAmt);
  };

  const handlePlaceOrder = async () => {
    if (!userProfile.diaChi) {
      Alert.alert("Lưu ý", "Vui lòng cập nhật địa chỉ giao hàng trong trang cá nhân.");
      return;
    }

    setIsOrdering(true);
    try {
      // BƯỚC QUAN TRỌNG: Lấy danh sách ID của các món ĐÃ CHỌN
      // Để gửi lên cho hàm CreateOrderFromCartAsync(userId, CartItemIds, ...)
      const selectedIds = cart.map(item => item.idSanPham || item.id);

      // 1. Chuẩn bị dữ liệu Body khớp CHÍNH XÁC với DTO 'CreateOrderRequest' ở Backend
      const orderData = {
        cartItemIds: selectedIds, // Tên phải khớp với thuộc tính trong C# DTO
        pttt: paymentMethod,
        voucherId: currentVoucher?.idVoucher || currentVoucher?.id || null,
      };

      // 2. Gửi yêu cầu đặt hàng
      const res = await api.post("/api/DonHang", orderData);

      if (res.data?.success || res.status === 200) {
        // Backend trả về mã đơn hàng vừa tạo
        const orderId = res.data.data?.idDonHang || res.data.data?.orderId || res.data.data?.id;
        
        Alert.alert(
          "Thành công", 
          "Đơn hàng của bạn đã được tiếp nhận!",
          [{
            text: "Xem chi tiết",
            onPress: () => navigation.replace("OrderDetailScreen", { orderId: orderId })
          }]
        );
      }
    } catch (err) {
      console.log("🔥 Lỗi đặt hàng:", err.response?.data || err.message);
      const errorMsg = err.response?.data?.message || "Không thể đặt hàng, vui lòng thử lại.";
      Alert.alert("Lỗi", errorMsg);
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* ĐỊA CHỈ */}
        <View style={styles.sectionBox}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={18} color="#ff6600" />
            <Text style={styles.sectionTitle}> Địa chỉ nhận hàng</Text>
          </View>
          <View style={styles.addressContent}>
            {isProfileLoading ? (
              <ActivityIndicator size="small" color="#ff6600" />
            ) : (
              <>
                <Text style={styles.userText}>{userProfile.hoTen} | {userProfile.sdt}</Text>
                <Text style={styles.addressText}>{userProfile.diaChi || "Vui lòng cập nhật địa chỉ"}</Text>
              </>
            )}
          </View>
        </View>

        {/* DANH SÁCH MÓN */}
        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>Sản phẩm đã chọn ({cart.length})</Text>
          {cart.map((item, index) => (
            <View key={index} style={styles.productItem}>
              <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={1}>{item.tenSanPham}</Text>
                <Text style={styles.productQtyPrice}>
                  {Number(item.gia || 0).toLocaleString()}đ x {item.soLuong}
                </Text>
              </View>
              <Text style={styles.productTotal}>
                {Number((item.gia || 0) * (item.soLuong || 0)).toLocaleString()}đ
              </Text>
            </View>
          ))}
        </View>

        {/* VOUCHER */}
        <TouchableOpacity 
          style={styles.sectionBox} 
          onPress={() => navigation.navigate("VoucherScreen", { onSelectVoucher: updateVoucher })}
        >
          <View style={styles.voucherRow}>
            <Ionicons name="ticket-outline" size={20} color="#ff6600" />
            <Text style={styles.voucherLabel}> Voucher của Drink Shop</Text>
            <Text style={styles.voucherValue}>
              {currentVoucher ? `-${currentDiscount}%` : "Chọn mã giảm giá"}
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#ccc" />
          </View>
        </TouchableOpacity>

        {/* THANH TOÁN */}
        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          {PAYMENT_METHODS.map((item) => (
            <TouchableOpacity key={item.key} style={styles.paymentOption} onPress={() => setPaymentMethod(item.key)}>
              <Ionicons 
                name={paymentMethod === item.key ? "radio-button-on" : "radio-button-off"} 
                size={20} color="#ff6600" 
              />
              <Text style={styles.paymentText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* TỔNG TIỀN CHI TIẾT */}
        <View style={styles.sectionBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Tổng tiền hàng</Text>
            <Text style={styles.summaryValue}>{Number(originalTotal).toLocaleString()}đ</Text>
          </View>
          {currentDiscount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>Voucher giảm giá</Text>
              <Text style={[styles.summaryValue, { color: '#e74c3c' }]}>
                -{Number(originalTotal - currentTotal).toLocaleString()}đ
              </Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng thanh toán</Text>
            <Text style={styles.totalValue}>{Number(currentTotal).toLocaleString()}đ</Text>
          </View>
        </View>
      </ScrollView>

      {/* FOOTER */}
      <View style={styles.footer}>
        <View style={styles.footerPriceInfo}>
          <Text style={styles.footerLabel}>Tổng thanh toán</Text>
          <Text style={styles.footerPrice}>{Number(currentTotal).toLocaleString()}đ</Text>
        </View>
        <TouchableOpacity 
          style={[styles.orderButton, (!userProfile.diaChi || isOrdering) && { backgroundColor: '#bdc3c7' }]}
          onPress={handlePlaceOrder}
          disabled={isOrdering || !userProfile.diaChi}
        >
          {isOrdering ? <ActivityIndicator color="#fff" /> : <Text style={styles.orderButtonText}>Đặt hàng</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  sectionBox: { backgroundColor: "#fff", padding: 16, marginBottom: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#2c3e50' },
  addressContent: { borderLeftWidth: 2, borderLeftColor: '#ff6600', paddingLeft: 12 },
  userText: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  addressText: { fontSize: 13, color: '#7f8c8d', marginTop: 4 },
  productItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  productImage: { width: 60, height: 60, borderRadius: 10, marginRight: 12 },
  productInfo: { flex: 1 },
  productName: { fontSize: 14, fontWeight: '600', color: '#333' },
  productQtyPrice: { fontSize: 13, color: '#95a5a6', marginTop: 4 },
  productTotal: { fontSize: 14, fontWeight: 'bold', color: '#2c3e50' },
  voucherRow: { flexDirection: 'row', alignItems: 'center' },
  voucherLabel: { flex: 1, fontSize: 14, color: '#333' },
  voucherValue: { fontSize: 13, color: '#ff6600', marginRight: 5 },
  paymentOption: { flexDirection: 'row', alignItems: 'center', marginTop: 15 },
  paymentText: { marginLeft: 10, fontSize: 14, color: '#333' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryText: { color: '#7f8c8d', fontSize: 14 },
  summaryValue: { fontSize: 14, color: '#333', fontWeight: '500' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f1f1f1' },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50' },
  totalValue: { fontSize: 20, fontWeight: 'bold', color: '#ff6600' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', elevation: 10 },
  footerLabel: { fontSize: 12, color: '#95a5a6' },
  footerPrice: { fontSize: 22, fontWeight: 'bold', color: '#ff6600' },
  orderButton: { backgroundColor: "#ff6600", paddingVertical: 14, paddingHorizontal: 40, borderRadius: 30 },
  orderButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 }
});

export default ConfirmOrderScreen;