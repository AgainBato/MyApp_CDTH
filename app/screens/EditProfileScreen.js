import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, 
  ActivityIndicator, ScrollView, Image, KeyboardAvoidingView, 
  Platform, TouchableWithoutFeedback, Keyboard 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from 'expo-image-picker';
import { CommonActions } from "@react-navigation/native";

import { useAuth } from "../context/AuthContext";
import api from "../src/api/apiConfig";

export default function UserProfileScreen({ navigation }) {
  const { logout } = useAuth(); 
  const [user, setUser] = useState(null);
  const [editData, setEditData] = useState({ hoTen: "", sdt: "", diaChi: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarTimestamp, setAvatarTimestamp] = useState(Date.now());

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/Auth/me");
      const userData = res.data;
      setUser(userData);
      setEditData({
          hoTen: userData.hoTen || "",
          sdt: userData.sdt || "",
          diaChi: userData.diaChi || ""
      });
      await AsyncStorage.setItem("userInfo", JSON.stringify(userData));
    } catch (error) {
      if (error.response?.status === 401) {
          logout();
          return;
      }
      const cache = await AsyncStorage.getItem("userInfo");
      if (cache) setUser(JSON.parse(cache));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleLogout = async () => {
    Alert.alert("Đăng xuất", "Bạn có chắc muốn thoát?", [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Xác nhận", 
          onPress: async () => {
            await AsyncStorage.clear();
            navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "Login" }] }));
          }
        }
    ]);
  };

  // ==========================
  // 1. CẢI THIỆN HÀM CHỌN ẢNH
  // ==========================
  const handlePickAvatar = async () => {
    console.log("📸 Bắt đầu tiến trình chọn ảnh...");

    try {
      // 1. Kiểm tra quyền hiện tại
      const { status: existingStatus } = await ImagePicker.getMediaLibraryPermissionsAsync();
      console.log("📊 Trạng thái quyền hiện tại:", existingStatus);

      let finalStatus = existingStatus;

      // 2. Nếu chưa được cấp quyền, hãy yêu cầu
      if (existingStatus !== 'granted') {
        console.log("🔑 Đang yêu cầu cấp quyền...");
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log("❌ Quyền bị từ chối!");
        Alert.alert("Lỗi", "Bạn cần cấp quyền trong Cài đặt để sử dụng tính năng này.");
        return;
      }

      console.log("✅ Quyền hợp lệ, đang mở thư viện...");

      // 3. Mở thư viện ảnh
      const result = await ImagePicker.launchImageLibraryAsync({
        // Thay thế ImagePicker.MediaType.Images bằng ['images']
        mediaTypes: ['images'], 
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      console.log("📄 Kết quả ImagePicker:", result.canceled ? "Đã hủy" : "Đã chọn ảnh");

      if (!result.canceled) {
        uploadAvatarToServer(result.assets[0]);
      }
    } catch (error) {
      console.error("🔥 Lỗi chi tiết tại ImagePicker:", error);
      Alert.alert("Lỗi", "Không thể mở thư viện ảnh.");
    }
  };

  // ==========================
  // 2. HOÀN THIỆN LOGIC UPLOAD
  // ==========================
  const uploadAvatarToServer = async (imageAsset) => {
      setUploading(true);
      try {
          const formData = new FormData();
          const imageUri = Platform.OS === 'android' ? imageAsset.uri : imageAsset.uri.replace('file://', '');

          formData.append('file', {
              uri: imageUri,
              name: imageAsset.fileName || `avatar_${Date.now()}.jpg`,
              type: imageAsset.mimeType || 'image/jpeg',
          });

          const res = await api.post('/api/Auth/upload-avatar', formData, {
              headers: { 'Content-Type': 'multipart/form-data' },
          });

          // SỬA TẠI ĐÂY: Cập nhật UI ngay khi thành công
          if (res.data.success || res.data.avatarUrl) {
              const newUrl = res.data.avatarUrl;
              const updatedUser = { ...user, avatar: newUrl };
              
              setUser(updatedUser);
              setAvatarTimestamp(Date.now()); // Làm mới ảnh hiển thị
              await AsyncStorage.setItem("userInfo", JSON.stringify(updatedUser));
              
              Alert.alert("Thành công", "Đã cập nhật ảnh đại diện!");
          }
      } catch (error) {
          Alert.alert("Lỗi", "Không thể upload. Kiểm tra IP Server và thư mục wwwroot.");
      } finally {
          setUploading(false);
      }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put("/api/Auth/update-profile", editData);
      const newUser = { ...user, ...editData };
      setUser(newUser);
      await AsyncStorage.setItem("userInfo", JSON.stringify(newUser));
      Alert.alert("Thành công", "Đã lưu hồ sơ");
      setIsEditing(false);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật thông tin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView showsVerticalScrollIndicator={false}>
            
            <View style={styles.header}>
              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                  <Ionicons name="log-out-outline" size={26} color="#ff6600" />
              </TouchableOpacity>

              {/* ===== VÙNG BẤM AVATAR ĐÃ ĐƯỢC MỞ RỘNG ===== */}
              <TouchableOpacity 
                activeOpacity={0.8} 
                onPress={handlePickAvatar} 
                style={styles.avatarWrapper}
                disabled={uploading}
              >
                  <View style={styles.avatarContainer}>
                      <Image
                        source={{ uri: user?.avatar ? `${user.avatar}?t=${avatarTimestamp}` : "https://i.pravatar.cc/300" }}
                        style={styles.avatar}
                      />
                      {uploading && (
                        <View style={styles.loadingOverlay}>
                          <ActivityIndicator size="small" color="#fff" />
                        </View>
                      )}
                  </View>
                  <View style={styles.cameraBtn}>
                      <Ionicons name="camera" size={18} color="#fff" />
                  </View>
              </TouchableOpacity>

              <Text style={styles.name}>{user?.hoTen || "Khách hàng"}</Text>
              <Text style={styles.email}>{user?.email || "Chưa cập nhật email"}</Text>
            </View>

            <View style={styles.body}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
                <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
                  <Text style={isEditing ? styles.cancel : styles.edit}>{isEditing ? "Hủy" : "Chỉnh sửa"}</Text>
                </TouchableOpacity>
              </View>

              <Field icon="person-outline" label="Họ và tên" value={user?.hoTen} editable={isEditing} inputValue={editData.hoTen} onChange={(v) => setEditData({ ...editData, hoTen: v })} />
              <Field icon="call-outline" label="Số điện thoại" value={user?.sdt} editable={isEditing} keyboardType="phone-pad" inputValue={editData.sdt} onChange={(v) => setEditData({ ...editData, sdt: v })} />
              <Field icon="location-outline" label="Địa chỉ" value={user?.diaChi} editable={isEditing} multiline inputValue={editData.diaChi} onChange={(v) => setEditData({ ...editData, diaChi: v })} />

              {isEditing && (
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Lưu thay đổi</Text>}
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Giữ nguyên Component Field và Styles
function Field({ icon, label, value, editable, inputValue, onChange, keyboardType, multiline }) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={22} color="#666" />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.label}>{label}</Text>
        {editable ? (
          <TextInput style={styles.input} value={inputValue} onChangeText={onChange} keyboardType={keyboardType} multiline={multiline} />
        ) : (
          <Text style={styles.value}>{value || "Chưa cập nhật"}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: { backgroundColor: "#fff", alignItems: "center", paddingVertical: 40, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, marginBottom: 20 },
  logoutBtn: { position: 'absolute', top: 10, right: 20, padding: 10 },
  avatarWrapper: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  avatarContainer: { width: 110, height: 110, borderRadius: 55, overflow: 'hidden', borderWidth: 3, borderColor: "#ff6600" },
  avatar: { width: '100%', height: '100%' },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  cameraBtn: { position: 'absolute', bottom: 0, right: 5, backgroundColor: '#ff6600', padding: 8, borderRadius: 20, borderWidth: 2, borderColor: '#fff', elevation: 5, zIndex: 10 },
  name: { fontSize: 20, fontWeight: "bold", marginTop: 15 },
  email: { color: "#777", marginTop: 4 },
  body: { paddingHorizontal: 20 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15, alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: "700" },
  edit: { color: "#ff6600", fontWeight: "600" },
  cancel: { color: "#999" },
  row: { flexDirection: "row", backgroundColor: "#fff", padding: 16, borderRadius: 16, marginBottom: 12 },
  label: { fontSize: 12, color: "#999" },
  value: { fontSize: 16, color: "#333", marginTop: 2 },
  input: { borderBottomWidth: 1, borderBottomColor: "#ff6600", fontSize: 16, paddingVertical: 2 },
  saveBtn: { backgroundColor: "#ff6600", borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 10, marginBottom: 20 },
  saveText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});