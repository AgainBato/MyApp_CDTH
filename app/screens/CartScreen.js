import React, { useState, useCallback, useMemo, useRef } from "react";
import {
  View, Text, TouchableOpacity, FlatList, StyleSheet, Image, ActivityIndicator, Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import api from "../src/api/apiConfig";

// Kiểm tra Context để tránh lỗi ReferenceError
import * as CartContextModule from "../context/CartContext";
const useCart = CartContextModule?.useCart || (() => ({})); 

const CartScreen = () => {
  const navigation = useNavigation();
  const { setCartCount } = useCart();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]); 
  const [discount, setDiscount] = useState(0); 
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  // Cờ hiệu để kiểm soát việc reset dữ liệu
  const isSelectingVoucher = useRef(false);

  // --- 1. ĐỊNH DẠNG TIỀN AN TOÀN ---
  const formatCurrency = (value) => {
    const num = Number(value);
    if (isNaN(num) || value === null || value === undefined) return "0";
    return num.toLocaleString("vi-VN");
  };

  const getItemId = (item) => item?.idSanPham || item?.IDSanPham || item?.id;

  // --- 2. LOGIC RESET KHI VÀO/RA MÀN HÌNH ---
  useFocusEffect(
    useCallback(() => {
      fetchCart();

      // Chỉ reset nếu không phải quay về từ luồng mua sắm (Voucher/Confirm)
      if (!isSelectingVoucher.current) {
        setSelectedItems([]);
        setDiscount(0);
        setSelectedVoucher(null);
      }
      isSelectingVoucher.current = false;
    }, [])
  );

  const fetchCart = async () => {
    if (cartItems.length === 0) setLoading(true);
    try {
      const res = await api.get("/api/GioHang");
      const data = res.data?.data || res.data || [];
      setCartItems(data);
      if (setCartCount) setCartCount(data.length);
    } catch (error) {
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  // --- 3. TÍNH TOÁN CHI TIẾT THANH TOÁN ---
  const totalPrice = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const id = String(getItemId(item));
      const gia = Number(item.gia || item.donGia || 0);
      const soLuong = Number(item.soLuong || 1);
      return selectedItems.includes(id) ? sum + (gia * soLuong) : sum;
    }, 0);
  }, [cartItems, selectedItems]);

  const discountAmount = useMemo(() => (totalPrice * (Number(discount) || 0)) / 100, [totalPrice, discount]);
  const finalTotal = useMemo(() => Math.max(0, totalPrice - discountAmount), [totalPrice, discountAmount]);

  // --- 4. CẬP NHẬT GIỎ HÀNG ---
  const updateQuantity = async (item, newQty) => {
    if (newQty < 1) return;
    const id = getItemId(item);
    setCartItems(prev => prev.map(p => getItemId(p) === id ? { ...p, soLuong: newQty } : p));
    try {
      await api.put("/api/GioHang/update", null, { params: { IDSanPham: id, soLuongMoi: newQty } });
    } catch (e) { fetchCart(); }
  };

  const removeItem = (item) => {
    const id = getItemId(item);
    Alert.alert("Xác nhận", "Xóa món này khỏi giỏ hàng?", [
      { text: "Hủy" },
      { text: "Xóa", style: "destructive", onPress: async () => {
          setCartItems(prev => prev.filter(p => getItemId(p) !== id));
          try { await api.delete("/api/GioHang/remove", { params: { IDSanPham: id } }); } catch (e) { fetchCart(); }
      }}
    ]);
  };

  // --- 5. ĐIỀU HƯỚNG SANG TRANG XÁC NHẬN ---
  const handleGoToConfirm = () => {
    const itemsToBuy = cartItems.filter(i => selectedItems.includes(String(getItemId(i))));
    
    // Đánh dấu để không reset khi ConfirmOrder gọi ngược lại Voucher hoặc Back
    isSelectingVoucher.current = true; 

    navigation.navigate("ConfirmOrder", { 
      cart: itemsToBuy,
      originalTotal: totalPrice,       // Truyền tổng gốc chưa giảm
      selectedVoucher: selectedVoucher, // Truyền object voucher để hiện mã 🎟
      discountValue: discount,         // Truyền % giảm
      total: finalTotal                // Truyền tổng cuối cùng
    });
  };

  const renderItem = ({ item }) => {
    const idStr = String(getItemId(item));
    const isSelected = selectedItems.includes(idStr);

    return (
      <View style={[styles.cartItem, isSelected && { borderColor: '#ff6600' }]}>
        <TouchableOpacity onPress={() => setSelectedItems(prev => isSelected ? prev.filter(i => i !== idStr) : [...prev, idStr])}>
          <Ionicons name={isSelected ? "checkbox" : "square-outline"} size={24} color={isSelected ? "#ff6600" : "#ccc"} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.itemContent} onPress={() => navigation.navigate("ProductScreen", { product: item })}>
          {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.image} />}
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>{item.tenSanPham || "Sản phẩm"}</Text>
            <Text style={styles.price}>{formatCurrency(item.gia || item.donGia)} đ</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.rightActions}>
          <TouchableOpacity onPress={() => removeItem(item)}><Ionicons name="trash-outline" size={20} color="#999" /></TouchableOpacity>
          <View style={styles.quantityContainer}>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item, (item.soLuong || 1) - 1)}><Text>-</Text></TouchableOpacity>
            <Text style={styles.qty}>{item.soLuong || 1}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item, (item.soLuong || 1) + 1)}><Text>+</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.navigate("Home")}><Ionicons name="home-outline" size={26} color="#333" /></TouchableOpacity>
        <Text style={styles.header}>Giỏ hàng</Text>
        <TouchableOpacity onPress={() => {
            Alert.alert("Cảnh báo", "Xóa sạch giỏ hàng?", [
                { text: "Hủy" },
                { text: "Xóa hết", style: "destructive", onPress: async () => {
                    setCartItems([]); try { await api.delete("/api/GioHang/clear"); } catch (e) { fetchCart(); }
                }}
            ]);
        }}><Ionicons name="trash-outline" size={26} color="red" /></TouchableOpacity>
      </View>

      <FlatList
        data={cartItems}
        keyExtractor={(item, index) => String(getItemId(item) || index)}
        renderItem={renderItem}
        ListHeaderComponent={cartItems.length > 0 && (
          <TouchableOpacity style={styles.selectAll} onPress={() => {
            if (selectedItems.length === cartItems.length) setSelectedItems([]);
            else setSelectedItems(cartItems.map(i => String(getItemId(i))));
          }}>
            <Ionicons name={selectedItems.length === cartItems.length ? "checkbox" : "square-outline"} size={24} color="#ff6600" />
            <Text style={{marginLeft: 10}}>Chọn tất cả ({cartItems.length})</Text>
          </TouchableOpacity>
        )}
      />

      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.voucherBtn} onPress={() => {
            isSelectingVoucher.current = true;
            navigation.navigate("VoucherScreen", {
              onSelectVoucher: (v) => {
                setSelectedVoucher(v);
                setDiscount(Number(v.giamGia || v.tiLeGiam || 0));
              }
            });
          }}>
            <Ionicons name="ticket-outline" size={20} color="#ff6600" />
            <Text style={{ marginLeft: 8, flex: 1, color: selectedVoucher ? '#ff6600' : '#333' }}>
              {selectedVoucher ? `Mã: ${selectedVoucher.maVoucher || selectedVoucher.code || "Voucher"} (-${discount}%)` : "Chọn mã giảm giá"}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <View style={styles.totalRow}>
            <View>
              <Text style={{ fontSize: 12, color: '#888' }}>Tổng cộng</Text>
              {discount > 0 && selectedItems.length > 0 ? (
                <>
                  <Text style={{ textDecorationLine: 'line-through', color: '#888' }}>{formatCurrency(totalPrice)} đ</Text>
                  <Text style={styles.finalTotal}>{formatCurrency(finalTotal)} đ</Text>
                  <Text style={{ fontSize: 12, color: '#2ecc71' }}>Tiết kiệm: {formatCurrency(discountAmount)} đ</Text>
                </>
              ) : (
                <Text style={styles.finalTotal}>{formatCurrency(finalTotal)} đ</Text>
              )}
            </View>
            <TouchableOpacity 
              style={[styles.buyBtn, selectedItems.length === 0 && { backgroundColor: '#ccc' }]}
              disabled={selectedItems.length === 0}
              onPress={handleGoToConfirm}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Mua hàng ({selectedItems.length})</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, alignItems: 'center' },
  header: { fontSize: 20, fontWeight: "bold" },
  selectAll: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  cartItem: { flexDirection: "row", alignItems: "center", padding: 10, marginBottom: 10, borderWidth: 1, borderColor: '#f0f0f0', borderRadius: 12 },
  image: { width: 60, height: 60, borderRadius: 10, marginRight: 10 },
  itemContent: { flexDirection: 'row', flex: 1, alignItems: 'center' },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: "600" },
  price: { color: "#ff6600", fontWeight: "bold" },
  rightActions: { alignItems: 'flex-end', justifyContent: 'space-between', height: 60 },
  quantityContainer: { flexDirection: "row", alignItems: "center" },
  qtyBtn: { backgroundColor: "#f5f5f5", width: 26, height: 26, alignItems: 'center', justifyContent: 'center', borderRadius: 5 },
  qty: { marginHorizontal: 10, fontWeight: 'bold' },
  footer: { paddingVertical: 15, borderTopWidth: 1, borderColor: '#eee' },
  voucherBtn: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#fafafa', borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#eee' },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  finalTotal: { fontSize: 22, fontWeight: "bold", color: "#ff6600" },
  buyBtn: { backgroundColor: "#ff6600", paddingVertical: 12, paddingHorizontal: 20, borderRadius: 25 }
});