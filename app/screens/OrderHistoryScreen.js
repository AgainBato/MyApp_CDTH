import React, { useEffect } from "react";
import {
  View, Text, TouchableOpacity, FlatList, StyleSheet,
  ActivityIndicator, RefreshControl
} from "react-native";
import { useOrders } from "../context/OrderContext";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const OrderHistoryScreen = () => {
  const { orders, loading, fetchMyOrders, hasNextPage, pageNumber, totalPages } = useOrders();
  const navigation = useNavigation();

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN") + " " + date.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed": return "#27ae60";
      case "Pending": return "#ffaa00";
      case "Cancelled": return "#e74c3c";
      default: return "#7f8c8d";
    }
  };

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      activeOpacity={0.8}
      onPress={() => navigation.navigate("OrderDetail", { orderId: item.orderId })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.idGroup}>
          <Ionicons name="receipt-outline" size={18} color="#555" />
          <Text style={styles.orderIdText}> Đơn hàng #{item.orderId}</Text>
        </View>
        <Text style={[styles.statusText, { color: getStatusColor(item.tinhTrang) }]}>
          {item.tinhTrang || "Đang xử lý"}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardBody}>
        <Text style={styles.dateText}>📅 {formatDate(item.createdAt)}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.totalLabel}>Tổng cộng:</Text>
          <Text style={styles.totalValue}>{(item.totalAmount || 0).toLocaleString("vi-VN")} đ</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.paymentStatus}>
          {item.paymentStatus === "Unpaid" ? "🔴 Chưa thanh toán" : "🔵 Đã thanh toán"}
        </Text>
        <Text style={styles.detailLink}>Xem chi tiết </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => String(item.orderId)}
        renderItem={renderOrderItem}
        contentContainerStyle={styles.listContent}
        
        // 1. XÓA BỎ các dòng onEndReached và onEndReachedThreshold ở đây
        
        // Giữ lại làm mới (Pull to refresh) để cập nhật trang hiện tại
        refreshControl={
          <RefreshControl 
              refreshing={loading} 
              onRefresh={() => fetchMyOrders(pageNumber)} 
              colors={["#ff6600"]} 
          />
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Ionicons name="cart-outline" size={80} color="#ccc" />
              <Text style={styles.emptyText}>Bạn chưa có đơn hàng nào.</Text>
            </View>
          )
        }
      />

      {/* 2. THÊM thanh điều hướng trang ở dưới FlatList */}
      <View style={styles.paginationBar}>
        <TouchableOpacity 
          onPress={() => fetchMyOrders(1)} 
          disabled={pageNumber <= 1 || loading}
        >
          <Ionicons name="play-back" size={24} color={pageNumber <= 1 ? "#ccc" : "#ff6600"} />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => fetchMyOrders(pageNumber - 1)} 
          disabled={pageNumber <= 1 || loading}
        >
          <Ionicons name="chevron-back" size={24} color={pageNumber <= 1 ? "#ccc" : "#ff6600"} />
        </TouchableOpacity>

        <Text style={styles.pageInfo}>Trang {pageNumber} / {totalPages}</Text>

        <TouchableOpacity 
          onPress={() => fetchMyOrders(pageNumber + 1)} 
          disabled={pageNumber >= totalPages || loading}
        >
          <Ionicons name="chevron-forward" size={24} color={pageNumber >= totalPages ? "#ccc" : "#ff6600"} />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => fetchMyOrders(totalPages)} 
          disabled={pageNumber >= totalPages || loading}
        >
          <Ionicons name="play-forward" size={24} color={pageNumber >= totalPages ? "#ccc" : "#ff6600"} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OrderHistoryScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f5f5f5" },
    listContent: { padding: 12 },
    paginationBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  pageInfo: {
    marginHorizontal: 20,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  orderCard: { backgroundColor: "#fff", borderRadius: 10, marginBottom: 12, padding: 15, elevation: 2 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  idGroup: { flexDirection: "row", alignItems: "center" },
  orderIdText: { fontSize: 14, fontWeight: "bold", color: "#444" },
  statusText: { fontSize: 13, fontWeight: "bold" },
  divider: { height: 1, backgroundColor: "#f0f0f0", marginBottom: 10 },
  cardBody: { marginBottom: 10 },
  dateText: { fontSize: 13, color: "#777", marginBottom: 5 },
  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalLabel: { fontSize: 14, color: "#333" },
  totalValue: { fontSize: 16, fontWeight: "bold", color: "#ff6600" },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", marginTop: 5, borderTopWidth: 0.5, borderTopColor: "#eee", paddingTop: 10 },
  paymentStatus: { fontSize: 12, color: "#666" },
  detailLink: { fontSize: 12, color: "#ff6600", fontWeight: "600" },
  emptyContainer: { alignItems: "center", marginTop: 100 },
  emptyText: { textAlign: "center", color: "#888", marginTop: 15, fontSize: 16 },
});