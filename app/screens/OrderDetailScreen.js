import React, { useEffect, useState } from "react";
import {
  View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, 
  TouchableOpacity, Alert, Modal, TextInput
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import api from "../src/api/apiConfig";

const OrderDetailScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // States đánh giá
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const formatCurrency = (val) => (val || 0).toLocaleString("vi-VN") + "đ";

  useEffect(() => { fetchOrderDetail(); }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      const res = await api.get(`/api/DonHang/my-orders/${orderId}`);
      setOrder(res.data.data || res.data);
    } catch (err) {
      Alert.alert("Lỗi", "Không thể tải thông tin đơn hàng.");
    } finally { setLoading(false); }
  };

  const handleCancelOrder = () => {
    Alert.alert("Xác nhận", "Bạn muốn hủy đơn hàng này?", [
      { text: "Đóng", style: "cancel" },
      { text: "Xác nhận hủy", style: "destructive", onPress: async () => {
          try {
            await api.put(`/api/DonHang/my-orders/${orderId}/cancel`);
            Alert.alert("Thành công", "Đơn hàng đã được hủy.");
            navigation.goBack(); 
          } catch (err) {
            Alert.alert("Lỗi", err.response?.data?.message || "Không thể hủy đơn.");
          }
      }}
    ]);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#ff6600" /></View>;
  if (!order) return <View style={styles.center}><Text>Không tìm thấy đơn hàng</Text></View>;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* HEADER TỰ CHẾ CHO ĐẸP */}
      <View style={styles.customHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="#333" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
        <View style={{width: 24}} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 40}}>
        {/* BANNER TRẠNG THÁI */}
        <View style={[styles.statusCard, { backgroundColor: order.tinhTrang === "Cancelled" || order.tinhTrang === "Đã hủy" ? "#95a5a6" : "#ff6600" }]}>
           <MaterialCommunityIcons name="receipt-text-check-outline" size={35} color="#fff" />
           <View style={{marginLeft: 15, flex: 1}}>
              <Text style={styles.statusMainText}>{order.tinhTrang}</Text>
              <Text style={styles.orderIdSub}>Mã đơn: #{order.orderId}</Text>
           </View>
        </View>

        {/* DANH SÁCH MÓN ĂN */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Sản phẩm ({order.items?.length || 0})</Text>
          {(order.items || []).map((item, index) => (
            <View key={index} style={styles.productCard}>
              <Image source={{ uri: item.imageUrl || "https://via.placeholder.com/150" }} style={styles.productImg} />
              <View style={{ flex: 1 }}>
                <Text style={styles.productName} numberOfLines={1}>{item.tenSanPham}</Text>
                <Text style={styles.productQtyText}>Số lượng: x{item.soLuong}</Text>
              </View>
              <Text style={styles.productPriceText}>{formatCurrency(item.giaDonVi)}</Text>
            </View>
          ))}
        </View>

        {/* THÔNG TIN THANH TOÁN */}
        <View style={styles.section}>
          <View style={styles.billRow}><Text style={styles.billLabel}>Tổng tiền hàng</Text><Text style={styles.billValue}>{formatCurrency(order.totalAmount)}</Text></View>
          <View style={styles.billRow}><Text style={styles.billLabel}>Phí vận chuyển</Text><Text style={styles.billValue}>0đ</Text></View>
          {order.discountAmount > 0 && (
            <View style={styles.billRow}><Text style={styles.billLabel}>Voucher giảm giá</Text><Text style={[styles.billValue, {color: '#27ae60'}]}>-{formatCurrency(order.discountAmount)}</Text></View>
          )}
          <View style={styles.divider} />
          <View style={styles.billRow}>
            <Text style={styles.totalFinalLabel}>Thành tiền</Text>
            <Text style={styles.totalFinalVal}>{formatCurrency(order.totalAmount - (order.discountAmount || 0))}</Text>
          </View>
          <View style={styles.paymentInfoBox}>
            <Text style={styles.paymentInfoText}>💳 Phương thức: {order.paymentMethod}</Text>
            <Text style={styles.paymentInfoText}>📅 Ngày đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}</Text>
          </View>
        </View>

        {/* NÚT BẤM */}
        <View style={styles.footerActions}>
          {order.tinhTrang === "Pending" && (
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelOrder}>
              <Text style={styles.cancelBtnText}>Hủy đơn hàng</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f6f8" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  customHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', alignItems: 'center', elevation: 2 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  statusCard: { padding: 25, flexDirection: 'row', alignItems: 'center' },
  statusMainText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  orderIdSub: { color: "#fff", opacity: 0.9, fontSize: 13, marginTop: 2 },
  section: { backgroundColor: "#fff", padding: 15, marginTop: 10, marginHorizontal: 12, borderRadius: 12, elevation: 1 },
  sectionLabel: { fontSize: 15, fontWeight: "bold", marginBottom: 15, color: '#2c3e50' },
  productCard: { flexDirection: "row", alignItems: "center", marginBottom: 15, borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0', paddingBottom: 10 },
  productImg: { width: 60, height: 60, borderRadius: 8, marginRight: 12, backgroundColor: '#f9f9f9' },
  productName: { fontSize: 15, fontWeight: "bold", color: '#333' },
  productQtyText: { fontSize: 13, color: "#7f8c8d", marginTop: 5 },
  productPriceText: { fontSize: 14, fontWeight: "700", color: "#ff6600" },
  billRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  billLabel: { fontSize: 14, color: '#7f8c8d' },
  billValue: { fontSize: 14, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 10 },
  totalFinalLabel: { fontSize: 16, fontWeight: "bold", color: "#2c3e50" },
  totalFinalVal: { fontSize: 20, fontWeight: "bold", color: "#ff6600" },
  paymentInfoBox: { marginTop: 15, backgroundColor: '#fdf2e9', padding: 12, borderRadius: 8 },
  paymentInfoText: { fontSize: 13, color: '#d35400', marginBottom: 4 },
  footerActions: { padding: 15, marginTop: 10 },
  cancelBtn: { padding: 16, borderRadius: 12, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e74c3c", alignItems: "center", marginBottom: 12 },
  cancelBtnText: { color: "#e74c3c", fontWeight: "bold", fontSize: 16 },
  backBtn: { padding: 16, borderRadius: 12, backgroundColor: "#34495e", alignItems: "center" },
  backBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

export default OrderDetailScreen;