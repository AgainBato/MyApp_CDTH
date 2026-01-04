import React, { useEffect, useState } from 'react';
import { 
  View, Text, FlatList, StyleSheet, TouchableOpacity, 
  ActivityIndicator, Modal, Alert, Clipboard 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../src/api/apiConfig';

const VoucherScreen = ({ navigation, route }) => {
  const onSelectVoucher = route?.params?.onSelectVoucher;
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- STATES CHI TIẾT VOUCHER ---
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // 1. Lấy toàn bộ danh sách Voucher
  const fetchAllVouchers = async () => {
    try {
      const response = await api.get("/api/Voucher");
      const result = response.data?.data || response.data;
      setVouchers(Array.isArray(result) ? result : (result.items || []));
    } catch (error) {
      console.log("❌ Lỗi API Voucher:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Lấy chi tiết 1 Voucher khi ấn vào (Dùng API /api/Voucher/{id})
  const fetchVoucherDetail = async (id) => {
    setLoadingDetail(true);
    setIsModalVisible(true);
    try {
      const response = await api.get(`/api/Voucher/${id}`);
      const result = response.data?.data || response.data;
      setSelectedVoucher(result);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải thông tin voucher.");
      setIsModalVisible(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => { fetchAllVouchers(); }, []);

  const copyToClipboard = (code) => {
    Clipboard.setString(code);
    Alert.alert("Thành công", "Đã sao chép mã giảm giá!");
  };

  const renderVoucherItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => fetchVoucherDetail(item.idVoucher || item.id)} // Gọi hàm xem chi tiết, KHÔNG điều hướng
    >
      <View style={styles.leftSection}>
        <MaterialCommunityIcons name="ticket-percent" size={35} color="#ff6600" />
      </View>
      
      <View style={styles.midSection}>
        <Text style={styles.codeText}>{item.maVoucher}</Text>
        <Text style={styles.descText} numberOfLines={1}>{item.moTa || "Nhấn để xem chi tiết"}</Text>
        <Text style={styles.expiryText}>HSD: {item.ngayHetHan ? new Date(item.ngayHetHan).toLocaleDateString('vi-VN') : 'Vô hạn'}</Text>
      </View>

      <TouchableOpacity 
        style={styles.copyButton} 
        onPress={() => {
          if (onSelectVoucher) {
            onSelectVoucher(item);
            navigation.goBack();
          } else {
            copyToClipboard(item.maVoucher);
          }
        }}
      >
        <Text style={styles.copyButtonText}>{onSelectVoucher ? 'Dùng' : 'Sao chép'}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kho Voucher của bạn</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <ActivityIndicator color="#ff6600" style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={vouchers}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderVoucherItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>Hiện chưa có mã giảm giá nào.</Text>}
        />
      )}

      {/* MODAL CHI TIẾT (HIỆN NGAY TẠI TRANG VOUCHER) */}
      <Modal visible={isModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.detailCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi tiết ưu đãi</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close-circle" size={30} color="#888" />
              </TouchableOpacity>
            </View>

            {loadingDetail ? (
              <ActivityIndicator color="#ff6600" style={{ marginVertical: 30 }} />
            ) : (
              selectedVoucher && (
                <View style={styles.detailBody}>
                  <View style={styles.infoRow}><Text style={styles.label}>Mã:</Text><Text style={styles.valBold}>{selectedVoucher.maVoucher}</Text></View>
                  <View style={styles.infoRow}><Text style={styles.label}>Giảm giá:</Text><Text style={styles.valColor}>{selectedVoucher.giamGia?.toLocaleString()} {selectedVoucher.loaiGiamGia === 'Phần trăm' ? '%' : 'đ'}</Text></View>
                  <View style={styles.infoRow}><Text style={styles.label}>Đơn tối thiểu:</Text><Text style={styles.val}>{selectedVoucher.donHangToiThieu?.toLocaleString()} đ</Text></View>
                  <View style={styles.infoRow}><Text style={styles.label}>Hết hạn:</Text><Text style={styles.val}>{selectedVoucher.ngayHetHan ? new Date(selectedVoucher.ngayHetHan).toLocaleDateString('vi-VN') : 'Vô hạn'}</Text></View>
                  <View style={styles.divider} />
                  <Text style={styles.label}>Điều kiện áp dụng:</Text>
                  <Text style={styles.descContent}>{selectedVoucher.moTa || "Áp dụng cho tất cả đồ uống tại cửa hàng."}</Text>

                  <TouchableOpacity style={styles.useBtn} onPress={() => {
                    setIsModalVisible(false);
                    if (onSelectVoucher) {
                      onSelectVoucher(selectedVoucher);
                      navigation.goBack();
                    } else {
                      copyToClipboard(selectedVoucher.maVoucher);
                    }
                  }}>
                    <Text style={styles.useBtnText}>Dùng ngay</Text>
                  </TouchableOpacity>
                </View>
              )
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', elevation: 2 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  listContent: { padding: 16 },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, marginBottom: 12, padding: 15, alignItems: 'center', elevation: 2 },
  leftSection: { width: 50, height: 50, backgroundColor: '#fff5ed', borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  midSection: { flex: 1, marginLeft: 12 },
  codeText: { fontSize: 15, fontWeight: 'bold', color: '#ff6600' },
  descText: { fontSize: 12, color: '#666', marginTop: 2 },
  expiryText: { fontSize: 10, color: '#999', marginTop: 4 },
  copyButton: { backgroundColor: '#ff6600', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 15 },
  copyButtonText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },

  // MODAL STYLES
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 25 },
  detailCard: { backgroundColor: '#fff', borderRadius: 20, width: '100%', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  label: { fontSize: 14, color: '#777' },
  val: { fontSize: 14, color: '#333', fontWeight: '500' },
  valBold: { fontSize: 16, color: '#ff6600', fontWeight: 'bold' },
  valColor: { fontSize: 14, color: '#2ecc71', fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 12 },
  descContent: { fontSize: 14, color: '#555', lineHeight: 20, marginTop: 5 },
  useBtn: { backgroundColor: '#ff6600', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 20 },
  useBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999' }
});

export default VoucherScreen;