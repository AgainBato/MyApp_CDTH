import React, { useState, useEffect } from 'react';
import { 
  View, Text, FlatList, StyleSheet, TouchableOpacity, 
  ActivityIndicator, Alert, Image, Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../src/api/apiConfig'; 
import { useCart } from '../context/CartContext';

const { width } = Dimensions.get('window');

export default function CategoryScreen({ navigation }) {
  const { addToCart: updateContextCart } = useCart() || {};
  
  // State quản lý dữ liệu
  const [categories, setCategories] = useState([]); 
  const [displayProducts, setDisplayProducts] = useState([]); 
  const [allProducts, setAllProducts] = useState([]); 
  const [selectedId, setSelectedId] = useState(0); 
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  // 1. Lấy dữ liệu từ Backend
  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const resCat = await api.get('/api/Phanloai'); 
      const categoriesData = resCat.data.data || []; 

      // Đồng bộ key idPhanLoai cho nút "Tất cả"
      setCategories([{ idPhanLoai: 0, ten: "Tất cả" }, ...categoriesData]);

      const resProd = await api.get('/api/SanPhams', {
          params: { pageNumber: 1, pageSize: 100 } 
      });
      const listAll = resProd.data.items || resProd.data || []; 
      
      setAllProducts(listAll);     
      setDisplayProducts(listAll); 
    } catch (error) {
      console.log("❌ Lỗi khởi tạo:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Logic lọc danh mục (Sửa lỗi chọn nhầm)
  const handleSelectCategory = (id) => {
    setSelectedId(id);
    if (id === 0) {
        setDisplayProducts(allProducts);
    } else {
        // Kiểm tra cả hai trường hợp idPhanLoai (hoa/thường) để an toàn
        const filtered = allProducts.filter(p => p.idPhanLoai === id || p.IDPhanLoai === id);
        setDisplayProducts(filtered);
    }
  };

  // 3. Điều hướng
  const goToHome = () => navigation.navigate("Home");

  // --- RENDER COMPONENT ---

  const renderCategoryItem = ({ item }) => {
    const isSelected = selectedId === item.idPhanLoai;
    return (
      <TouchableOpacity 
        activeOpacity={0.8}
        style={[styles.catItem, isSelected && styles.catItemActive]}
        onPress={() => handleSelectCategory(item.idPhanLoai)}
      >
        <Text style={[styles.catText, isSelected && styles.catTextActive]}>
          {item.ten} 
        </Text>
      </TouchableOpacity>
    );
  };

  const renderProductItem = ({ item }) => (
    <TouchableOpacity 
        activeOpacity={0.9}
        style={styles.prodItem}
        onPress={() => navigation.navigate("ProductScreen", { productId: item.idSanPham || item.IDSanPham })}
    > 
      <View style={styles.imageContainer}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.img} resizeMode="cover" />
          ) : (
            <View style={styles.placeholder}><Text style={{fontSize: 40}}>🥤</Text></View>
          )}
      </View>
      <View style={styles.prodInfo}>
        <Text style={styles.prodName} numberOfLines={2}>{item.tenSanPham}</Text>
        <View style={styles.priceRow}>
            <Text style={styles.prodPrice}>{(item.gia || 0).toLocaleString('vi-VN')}đ</Text>
            <TouchableOpacity 
              style={styles.addBtn} 
              onPress={() => {
                api.post("/api/GioHang/add", { IDSanPham: item.idSanPham || item.IDSanPham, soLuong: 1 });
                Alert.alert("Thành công", "Đã thêm vào giỏ!");
              }}
            >
                <Ionicons name="add" size={18} color="#fff" />
            </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goToHome}>
            <Ionicons name="home-outline" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Danh mục</Text>
        <View style={{ width: 40 }} /> 
      </View>

      {/* Tabs Phân loại dạng hạt đậu */}
      <View style={styles.catWrapper}>
        <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => (item.idPhanLoai || index).toString()}
            renderItem={renderCategoryItem}
            contentContainerStyle={{ paddingHorizontal: 15 }}
        />
      </View>

      <View style={styles.body}>
        {loading ? (
            <ActivityIndicator size="large" color="#ff6600" style={{marginTop: 50}} />
        ) : (
            <FlatList
                data={displayProducts}
                numColumns={2} 
                keyExtractor={(item) => String(item?.idSanPham || Math.random())}
                renderItem={renderProductItem}
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.prodListPadding}
                ListEmptyComponent={<Text style={styles.emptyText}>Mục này hiện chưa có món nào.</Text>}
            />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff'
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#000', flex: 1, textAlign: 'center' },
  backButton: { width: 40 },

  // Tabs style (Pills)
  catWrapper: { paddingVertical: 10, backgroundColor: '#fff' },
  catItem: { 
    paddingVertical: 10, paddingHorizontal: 22, backgroundColor: '#F2F2F2', 
    borderRadius: 25, marginRight: 10, justifyContent: 'center'
  },
  catItemActive: { 
    backgroundColor: '#ff6600',
    elevation: 4, shadowColor: '#ff6600', shadowOpacity: 0.2, shadowRadius: 5
  },
  catText: { fontSize: 15, color: '#666', fontWeight: '600' },
  catTextActive: { color: '#fff', fontWeight: '700' },

  body: { 
    flex: 1, backgroundColor: '#F8F9FA', 
    borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: 5 
  },
  row: { justifyContent: 'space-between', paddingHorizontal: 15 },
  prodListPadding: { paddingTop: 20, paddingBottom: 100 },

  // Product Card style
  prodItem: { 
    width: (width / 2) - 22, backgroundColor: '#fff', borderRadius: 20, 
    marginBottom: 15, padding: 10, elevation: 4,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8
  },
  imageContainer: { 
    width: '100%', aspectRatio: 1, borderRadius: 15, 
    overflow: 'hidden', backgroundColor: '#f0f0f0' 
  },
  img: { width: '100%', height: '100%' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  prodInfo: { marginTop: 10 },
  prodName: { fontSize: 15, fontWeight: '700', color: '#333', height: 42 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },
  prodPrice: { color: '#ff6600', fontWeight: 'bold', fontSize: 16 },
  addBtn: { 
    backgroundColor: '#ff6600', width: 30, height: 30, 
    borderRadius: 15, justifyContent: 'center', alignItems: 'center' 
  },
  emptyText: { textAlign: 'center', marginTop: 100, color: '#999', fontStyle: 'italic' }
});