import React, { useState, useEffect } from "react";
import { 
  View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "../src/api/apiConfig"; 
import { useCart } from "../context/CartContext"; 

export default function ProductDetailScreen({ route, navigation }) {
  // 1. Nhận dữ liệu từ Navigation (Hỗ trợ cả Object hoặc chỉ ID)
  const { product: initialProduct, productId: paramId } = route.params || {}; 
  const { addToCart: updateContextCart } = useCart() || {};
  
  const [product, setProduct] = useState(initialProduct || null);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]); 
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(false);

  // Xác định ID sản phẩm an toàn
  const productId = product?.idSanPham || product?.IDSanPham || paramId;

  useEffect(() => {
    if (productId) {
      console.log("🔍 Đang xem sản phẩm ID:", productId);
      fetchProductDetail();
      fetchReviews();
    } else {
      Alert.alert("Lỗi", "Không tìm thấy thông tin sản phẩm.");
      navigation.goBack();
    }
  }, [productId]);

  // Lấy chi tiết sản phẩm từ BE (đã chuẩn hóa DTO)
  const fetchProductDetail = async () => {
    // Nếu đã có dữ liệu đầy đủ từ trang trước thì không gọi lại để tăng tốc
    if (product && product.moTa) return; 

    setLoading(true);
    try {
      const res = await api.get(`/api/SanPhams/${productId}`);
      console.log("📦 Dữ liệu BE trả về:", res.data); // Debug dữ liệu
      setProduct(res.data);
    } catch (error) {
      console.log("❌ Lỗi tải chi tiết sản phẩm:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách bình luận chi tiết
  const fetchReviews = async () => {
    try {
      const res = await api.get(`/api/DanhGia/product/${productId}`);
      const summaryData = res.data?.data || res.data;
      
      if (summaryData && Array.isArray(summaryData.reviews)) {
        setReviews(summaryData.reviews);
        setAverageRating(summaryData.averageRating || 0);
      }
    } catch (error) {
      console.log("❌ Lỗi tải đánh giá:", error.message);
    }
  };

  // 2. Trích xuất dữ liệu sau khi BE đã chuẩn hóa camelCase
  const ten = product?.tenSanPham || "Tên món ăn";
  const gia = product?.gia || 0;
  const moTa = product?.moTa || "Mô tả đang được cập nhật...";
  const hinhAnh = product?.imageUrl;
  
  // Ưu tiên lấy điểm và số lượng đánh giá có sẵn trong DTO SanPhamResponse
  const diemSao = product?.diemDanhGia || averageRating;
  const tongReview = product?.soLuongDanhGia || reviews.length;

  const handleIncrease = () => setQuantity(prev => prev + 1);
  const handleDecrease = () => { if (quantity > 1) setQuantity(prev => prev - 1); };

  const handleAddToCart = async () => {
    if (!productId) return;
    try {
        await api.post("/api/GioHang/add", { IDSanPham: productId, soLuong: quantity });
        if (updateContextCart) updateContextCart(product, quantity); 
        Alert.alert("Thành công", `Đã thêm vào giỏ!`, [
            { text: "Xem giỏ hàng", onPress: () => navigation.navigate("CartScreen") },
            { text: "Tiếp tục", onPress: () => {} },
        ]);
    } catch (error) { Alert.alert("Lỗi", "Không thể thêm vào giỏ hàng."); }
  };

  if (loading && !product) {
    return (
      <View style={styles.loadingCenter}>
        <ActivityIndicator size="large" color="#ff6600" />
        <Text style={{marginTop: 10, color: '#666'}}>Đang tải món ngon...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết món</Text>
        <TouchableOpacity onPress={() => navigation.navigate("CartScreen")}>
            <Ionicons name="cart-outline" size={26} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Ảnh Sản Phẩm */}
        <View style={styles.imageContainer}>
             {hinhAnh ? (
                <Image source={{ uri: hinhAnh }} style={styles.image} resizeMode="cover" />
             ) : (
                <View style={styles.placeholder}><Text style={{fontSize: 80}}>🥤</Text></View>
             )}
        </View>

        {/* Thông tin sản phẩm */}
        <View style={styles.infoContainer}>
            <Text style={styles.name}>{ten}</Text>
            
            <View style={styles.priceRow}>
              <Text style={styles.price}>{(gia).toLocaleString("vi-VN")}đ</Text>
              <View style={styles.avgRatingBox}>
                <Ionicons name="star" size={16} color="#ffaa00" />
                <Text style={styles.avgRatingText}> {diemSao}/5 ({tongReview})</Text>
              </View>
            </View>

            <View style={styles.divider} />
            <Text style={styles.descTitle}>Mô tả món ăn</Text>
            <Text style={styles.description}>{moTa}</Text>
            <View style={styles.divider} />

            {/* Danh sách đánh giá chi tiết */}
            <View style={styles.reviewHeaderTitle}>
              <Text style={styles.descTitle}>Khách hàng nói gì ({reviews.length})</Text>
            </View>
            
            {reviews.length === 0 ? (
              <Text style={styles.noReviewText}>Chưa có đánh giá nào cho sản phẩm này.</Text>
            ) : (
              reviews.map((item, index) => (
                <View key={index} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewerName}>{item.tenNguoiDung || "Khách hàng"}</Text>
                    <View style={styles.starRow}>
                      {[...Array(5)].map((_, i) => (
                        <Ionicons 
                          key={i} 
                          name={i < (item.soSao || 0) ? "star" : "star-outline"} 
                          size={12} 
                          color="#ffaa00" 
                        />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.reviewComment}>{item.binhLuan || "Món này rất ngon!"}</Text>
                </View>
              ))
            )}
        </View>
      </ScrollView>

      {/* Footer Thanh toán */}
      <View style={styles.footer}>
          <View style={styles.quantityContainer}>
              <TouchableOpacity onPress={handleDecrease} style={styles.qtyBtn}>
                <Ionicons name="remove" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{quantity}</Text>
              <TouchableOpacity onPress={handleIncrease} style={styles.qtyBtn}>
                <Ionicons name="add" size={24} color="#333" />
              </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.addToCartBtn} onPress={handleAddToCart}>
              <Text style={styles.addToCartText}>Thêm vào giỏ</Text>
          </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff' },
  backBtn: { padding: 8, backgroundColor: '#f5f5f5', borderRadius: 50 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  scrollContent: { paddingBottom: 120 },
  imageContainer: { alignItems: 'center', marginVertical: 15 },
  image: { width: '90%', height: 320, borderRadius: 30 },
  placeholder: { width: '90%', height: 320, backgroundColor: '#f9f9f9', borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  infoContainer: { paddingHorizontal: 20 },
  name: { fontSize: 28, fontWeight: 'bold', color: '#222' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  price: { fontSize: 24, fontWeight: 'bold', color: '#ff6600' },
  avgRatingBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff4e6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
  avgRatingText: { fontWeight: 'bold', color: '#ff6600', fontSize: 14 },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 20 },
  descTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  description: { fontSize: 15, color: '#666', lineHeight: 24, marginTop: 8 },
  reviewHeaderTitle: { marginBottom: 15 },
  reviewItem: { backgroundColor: '#fcfcfc', padding: 15, borderRadius: 15, marginBottom: 12, borderWidth: 1, borderColor: '#f0f0f0' },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  reviewerName: { fontSize: 14, fontWeight: 'bold', color: '#444' },
  starRow: { flexDirection: 'row' },
  reviewComment: { fontSize: 14, color: '#555', lineHeight: 20 },
  noReviewText: { color: '#999', fontStyle: 'italic', textAlign: 'center', marginTop: 10 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: 16, borderTopWidth: 1, borderColor: '#eee', flexDirection: 'row', alignItems: 'center' },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 30, padding: 5, marginRight: 15 },
  qtyBtn: { width: 45, height: 45, borderRadius: 25, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3 },
  qtyText: { marginHorizontal: 15, fontSize: 20, fontWeight: 'bold' },
  addToCartBtn: { flex: 1, backgroundColor: '#ff6600', paddingVertical: 16, borderRadius: 30, alignItems: 'center', elevation: 4 },
  addToCartText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});