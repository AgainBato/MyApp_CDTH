import React, { useEffect, useState, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Keyboard, Image, Alert, Modal, ActivityIndicator,
  KeyboardAvoidingView, Platform, RefreshControl,
  Animated, PanResponder, Dimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

// Components & Config
import BannerSlider from "../components/BannerSlider";
import { useCart } from "../context/CartContext";
import api from "../src/api/apiConfig";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const scrollViewChatRef = useRef();
  const { addToCart: updateContextCart, cartCount } = useCart() || {};

  // --- STATES DỮ LIỆU ---
  const [foods, setFoods] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // --- STATES CHI TIẾT VOUCHER ---
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [isVoucherModalVisible, setIsVoucherModalVisible] = useState(false);
  const [loadingVoucherDetail, setLoadingVoucherDetail] = useState(false);

  // --- STATES CHATBOT AI ---
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const [messages, setMessages] = useState([{ role: "assistant", content: "Chào bạn! Trợ lý DrinkShop có thể giúp gì cho bạn?" }]);

  // --- LOGIC BONG BÓNG CHAT (DI CHUYỂN & HÍT CẠNH) ---
  const pan = useRef(new Animated.ValueXY({ x: SCREEN_WIDTH - 75, y: SCREEN_HEIGHT - 250 })).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        pan.setValue({ x: gestureState.moveX - 30, y: gestureState.moveY - 30 });
      },
      onPanResponderRelease: (e, gestureState) => {
        // Nếu di chuyển rất ít (< 5px) thì coi là nhấn (Tap)
        if (Math.abs(gestureState.dx) < 5 && Math.abs(gestureState.dy) < 5) {
          setIsChatVisible(true);
        }
        // Logic "hít" vào 2 cạnh màn hình
        let finalX = gestureState.moveX > SCREEN_WIDTH / 2 ? SCREEN_WIDTH - 70 : 10;
        Animated.spring(pan, {
          toValue: { x: finalX, y: gestureState.moveY - 30 },
          useNativeDriver: false,
          friction: 6,
        }).start();
      },
    })
  ).current;

  // 1. Fetch Dữ liệu
  const fetchData = async () => {
    fetchVouchers();
    fetchSanPhams(1);
  };

  const fetchVouchers = async () => {
    try {
      const response = await api.get("/api/Voucher");
      const result = response.data?.data || response.data;
      setVouchers(Array.isArray(result) ? result : (result.items || []));
    } catch (error) { console.log("❌ Lỗi Voucher:", error); }
  };

  const fetchVoucherDetail = async (id) => {
    setLoadingVoucherDetail(true);
    setIsVoucherModalVisible(true);
    try {
      const response = await api.get(`/api/Voucher/${id}`);
      setSelectedVoucher(response.data?.data || response.data);
    } catch (error) {
      setIsVoucherModalVisible(false);
      Alert.alert("Lỗi", "Không thể tải chi tiết voucher.");
    } finally { setLoadingVoucherDetail(false); }
  };

  const fetchSanPhams = async (targetPage = 1) => {
    setLoading(true);
    try {
      const response = await api.get("/api/SanPhams", { params: { pageNumber: targetPage, pageSize: 6 } });
      const result = response.data?.data || response.data;
      if (result && (result.items || result.Items)) {
        setFoods(result.items || result.Items);
        setPageNumber(result.currentPage || 1);
        setTotalPages(result.totalPages || 1);
      }
    } catch (error) { console.log("❌ Lỗi Food:", error); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // 2. Logic Chatbot AI
  const handleSendMessage = async () => {
    if (!chatInput.trim() || loadingChat) return;
    const userMsg = { role: "user", content: chatInput };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setChatInput("");
    setLoadingChat(true);
    try {
        const res = await api.post("/api/Chat", { messages: newHistory.slice(-6) });
        if (res.data?.answer) setMessages(prev => [...prev, { role: "assistant", content: res.data.answer }]);
    } catch (err) {
        setMessages(prev => [...prev, { role: "assistant", content: "Lỗi kết nối AI." }]);
    } finally { setLoadingChat(false); }
  };

  const handleAdd = async (item) => {
    try {
      await api.post("/api/GioHang/add", { IDSanPham: item.idSanPham || item.IDSanPham, soLuong: 1 });
      Alert.alert("Thành công", `Đã thêm vào giỏ!`);
      if (updateContextCart) updateContextCart(item);
    } catch (error) { Alert.alert("Lỗi", "Không thể thêm sản phẩm."); }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerContainer}>
        <View style={styles.searchBar}>
          <Ionicons name={isSearching ? "arrow-back" : "search"} size={20} color="#888" 
            onPress={() => { if(isSearching){ setIsSearching(false); setSearchText(""); Keyboard.dismiss(); }}} />
          <TextInput style={styles.searchInput} placeholder="Tìm kiếm món ngon..." value={searchText} onChangeText={setSearchText} onFocus={() => setIsSearching(true)} />
        </View>
        <TouchableOpacity style={styles.headerIconButton} onPress={() => navigation.navigate("CartScreen")}>
          <Ionicons name="cart-outline" size={28} color="#333" />
          {cartCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{cartCount}</Text></View>}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchData();}} />}>
        {!isSearching ? (
          <>
            <BannerSlider />
            {/* VOUCHER SECTION */}
            <View style={styles.voucherSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitleSmall}>Ưu đãi từ cửa hàng</Text>
                <TouchableOpacity onPress={() => navigation.navigate("VoucherScreen")}><Text style={styles.seeAllText}>Tất cả</Text></TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.voucherScroll}>
                {vouchers.map((v, index) => (
                  <TouchableOpacity key={index} style={styles.voucherCard} onPress={() => fetchVoucherDetail(v.idVoucher || v.id)}>
                    <MaterialCommunityIcons name="ticket-percent" size={22} color="#ff6600" />
                    <View style={{marginLeft: 8}}><Text style={styles.voucherCode}>{v.maVoucher}</Text><Text style={styles.voucherDesc} numberOfLines={1}>{v.moTa || "Xem chi tiết"}</Text></View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <Text style={styles.sectionTitle}>Món ngon dành cho bạn</Text>
            {loading ? <ActivityIndicator color="#ff6600" style={{marginTop: 30}} /> : (
              <>
                <View style={styles.foodContainer}>
                  {foods.map((item, idx) => (
                    <FoodCard key={idx} item={item} onAdd={() => handleAdd(item)} onPress={(p) => navigation.navigate("ProductScreen", { product: p })} />
                  ))}
                </View>
                <View style={styles.paginationBar}>
                  <TouchableOpacity onPress={() => fetchSanPhams(pageNumber - 1)} disabled={pageNumber <= 1}><Ionicons name="chevron-back" size={22} color={pageNumber <= 1 ? "#ccc" : "#ff6600"} /></TouchableOpacity>
                  <Text style={styles.pageInfo}>Trang {pageNumber} / {totalPages}</Text>
                  <TouchableOpacity onPress={() => fetchSanPhams(pageNumber + 1)} disabled={pageNumber >= totalPages}><Ionicons name="chevron-forward" size={22} color={pageNumber >= totalPages ? "#ccc" : "#ff6600"} /></TouchableOpacity>
                </View>
              </>
            )}
          </>
        ) : null}
      </ScrollView>

      {/* --- BONG BÓNG CHAT DI ĐỘNG --- */}
      <Animated.View {...panResponder.panHandlers} style={[pan.getLayout(), styles.floatingBubble]}>
        <View style={styles.bubbleInner}>
          <MaterialCommunityIcons name="robot" size={30} color="#fff" />
          <View style={styles.onlineBadge} />
        </View>
      </Animated.View>

      {/* --- MODAL CHATBOT AI --- */}
      <Modal visible={isChatVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={styles.chatWindow}>
            <View style={styles.chatHeader}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}><MaterialCommunityIcons name="robot" size={24} color="#ff6600" /><Text style={styles.chatTitle}> DrinkShop AI</Text></View>
              <TouchableOpacity onPress={() => setIsChatVisible(false)}><Ionicons name="close-circle" size={30} color="#888" /></TouchableOpacity>
            </View>
            <ScrollView style={styles.chatContent} ref={scrollViewChatRef} onContentSizeChange={() => scrollViewChatRef.current?.scrollToEnd()}>
              {messages.map((m, i) => (
                <View key={i} style={[styles.bubble, m.role === 'user' ? styles.userBubble : styles.botBubble]}><Text style={{ color: m.role === 'user' ? '#fff' : '#333' }}>{m.content}</Text></View>
              ))}
              {loadingChat && <ActivityIndicator style={{marginTop:10}} color="#ff6600" />}
            </ScrollView>
            <View style={styles.chatInputArea}>
              <TextInput style={styles.chatTextInput} placeholder="Hỏi AI..." value={chatInput} onChangeText={setChatInput} />
              <TouchableOpacity onPress={handleSendMessage}><Ionicons name="send" size={24} color="#ff6600" /></TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* MODAL CHI TIẾT VOUCHER */}
      <Modal visible={isVoucherModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlayCenter}>
          <View style={styles.voucherDetailCard}>
            <View style={styles.modalHeaderDetail}><Text style={styles.modalTitleDetail}>Chi tiết Voucher</Text><TouchableOpacity onPress={() => setIsVoucherModalVisible(false)}><Ionicons name="close-circle" size={28} color="#888" /></TouchableOpacity></View>
            {loadingVoucherDetail ? <ActivityIndicator color="#ff6600" /> : selectedVoucher && (
              <View>
                <View style={styles.rowD}><Text style={styles.labelD}>Mã:</Text><Text style={styles.valB}>{selectedVoucher.maVoucher}</Text></View>
                <View style={styles.rowD}><Text style={styles.labelD}>Giảm:</Text><Text style={styles.valG}>{selectedVoucher.giamGia?.toLocaleString()} đ</Text></View>
                <View style={styles.dividerD} />
                <Text style={styles.labelD}>Điều kiện:</Text>
                <Text style={styles.descD}>{selectedVoucher.moTa || "Áp dụng cho mọi đơn hàng."}</Text>
                <TouchableOpacity style={styles.closeBtnD} onPress={() => setIsVoucherModalVisible(false)}><Text style={{color: '#fff', fontWeight:'bold'}}>Đóng</Text></TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// --- COMPONENT THẺ SẢN PHẨM (CHUẨN ĐẸP) ---
const FoodCard = ({ item, onAdd, onPress }) => (
  <TouchableOpacity style={styles.foodCard} onPress={() => onPress(item)}>
    <View style={styles.imageWrapper}>
      {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.foodImage} /> : <View style={styles.placeholder}><Text>🥤</Text></View>}
    </View>
    <View style={styles.cardInfo}>
      <Text style={styles.foodName} numberOfLines={2}>{item.tenSanPham}</Text>
      <Text style={styles.foodPrice}>{(item.gia ?? 0).toLocaleString("vi-VN")} đ</Text>
      <TouchableOpacity style={styles.addButton} onPress={(e) => { e.stopPropagation(); onAdd(); }}>
        <Ionicons name="add" size={22} color="#fff" />
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  headerContainer: { paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center' },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f2f2f2', borderRadius: 12, paddingHorizontal: 12, height: 45 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16 },
  headerIconButton: { marginLeft: 12 },
  badge: { position: 'absolute', right: -5, top: -5, backgroundColor: 'red', borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  // VOUCHER CSS
  voucherSection: { marginTop: 15, paddingLeft: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 16, marginBottom: 12 },
  sectionTitleSmall: { fontSize: 17, fontWeight: '700', color: '#333' },
  seeAllText: { fontSize: 13, color: '#ff6600', fontWeight: '600' },
  voucherScroll: { paddingRight: 16 },
  voucherCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#ff6600', borderRadius: 10, marginRight: 12, padding: 10, width: 180, elevation: 2 },
  voucherCode: { fontSize: 13, fontWeight: 'bold', color: '#ff6600' },
  voucherDesc: { fontSize: 10, color: '#666', width: 110 },

  // PRODUCT GRID CSS (CHỐNG LỆCH)
  sectionTitle: { fontSize: 20, fontWeight: "700", color: "#333", marginTop: 25, paddingHorizontal: 16 },
  foodContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", paddingHorizontal: 16, marginTop: 15 },
  foodCard: { width: "48%", backgroundColor: "#fff", borderRadius: 15, marginBottom: 16, borderWidth: 1, borderColor: '#f0f0f0', elevation: 3, overflow: 'hidden' },
  imageWrapper: { width: '100%', aspectRatio: 1, backgroundColor: '#f9f9f9' },
  foodImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cardInfo: { padding: 10, alignItems: 'center' },
  foodName: { fontSize: 14, fontWeight: "600", textAlign: 'center', height: 40, color: '#333' },
  foodPrice: { color: "#ff6600", fontWeight: "bold", fontSize: 15, marginTop: 5 },
  addButton: { marginTop: 10, backgroundColor: "#ff6600", borderRadius: 20, width: 35, height: 35, justifyContent: "center", alignItems: "center" },

  // BONG BÓNG CHAT CSS
  floatingBubble: { position: 'absolute', width: 60, height: 60, zIndex: 9999 },
  bubbleInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#ff6600', justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 5 },
  onlineBadge: { position: 'absolute', right: 2, bottom: 2, width: 15, height: 15, borderRadius: 7.5, backgroundColor: '#2ecc71', borderWidth: 2, borderColor: '#fff' },

  // CHAT MODAL CSS
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  chatWindow: { backgroundColor: '#fff', height: '85%', borderTopLeftRadius: 25, borderTopRightRadius: 25 },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderColor: '#eee' },
  chatTitle: { fontSize: 18, fontWeight: 'bold', color: '#ff6600' },
  chatContent: { flex: 1, padding: 10 },
  bubble: { padding: 12, borderRadius: 18, marginVertical: 5, maxWidth: '85%' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#ff6600', borderBottomRightRadius: 2 },
  botBubble: { alignSelf: 'flex-start', backgroundColor: '#f0f0f0', borderBottomLeftRadius: 2 },
  chatInputArea: { flexDirection: 'row', padding: 15, borderTopWidth: 1, borderColor: '#eee', alignItems: 'center' },
  chatTextInput: { flex: 1, backgroundColor: '#f5f5f5', borderRadius: 20, paddingHorizontal: 15, height: 45, marginRight: 10 },

  // VOUCHER MODAL DETAIL CSS
  modalOverlayCenter: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 25 },
  voucherDetailCard: { backgroundColor: '#fff', borderRadius: 20, width: '100%', padding: 20 },
  modalHeaderDetail: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  modalTitleDetail: { fontSize: 18, fontWeight: 'bold' },
  rowD: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  labelD: { color: '#777' },
  valB: { fontWeight: 'bold', color: '#ff6600' },
  valG: { fontWeight: 'bold', color: '#2ecc71' },
  dividerD: { height: 1, backgroundColor: '#eee', marginVertical: 12 },
  descD: { color: '#555', lineHeight: 20 },
  closeBtnD: { backgroundColor: '#ff6600', borderRadius: 10, padding: 12, alignItems: 'center', marginTop: 15 },
  paginationBar: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 25 },
  pageInfo: { marginHorizontal: 20, fontSize: 14, fontWeight: '700' },
});

export default HomeScreen;