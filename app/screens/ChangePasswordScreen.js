// screens/ChangePasswordScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator, // Thêm cái này để xoay xoay
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 👇 Import api client của bạn (đường dẫn tùy project)
import api from "../src/api/apiConfig"; 

const ChangePasswordScreen = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // State để quản lý hiệu ứng loading
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    // 1. Validate Client
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("⚠️ Thông báo", "Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("❌ Lỗi", "Mật khẩu xác nhận không khớp");
      return;
    }
    if (newPassword.length < 6) { // Thêm validate độ dài nếu cần
       Alert.alert("⚠️ Thông báo", "Mật khẩu mới phải có ít nhất 6 ký tự");
       return;
    }

    setLoading(true);

    try {
      // 2. Gọi API (Backend của bạn có thể là /api/Auth/change-password)
      // 👇 Hãy thay đường dẫn API thực tế của bạn vào đây
      const endpoint = "/api/Auth/change-password"; 

      const res = await api.post(endpoint, {
        matKhauCu: currentPassword,         // Map đúng key backend yêu cầu
        matKhauMoi: newPassword,
        nhapLaiMatKhauMoi: confirmPassword
      });

      console.log("Change pass success:", res.data);

      // 3. Thành công
      Alert.alert("✅ Thành công", "Mật khẩu đã được thay đổi! Vui lòng đăng nhập lại.", [
        { 
          text: "OK", 
          onPress: () => {
             // Tùy logic app, thường đổi pass xong sẽ đá văng ra Login
             // Hoặc chỉ cần goBack()
             navigation.goBack(); 
          } 
        }
      ]);

    } catch (error) {
      console.log("Change pass error:", error);
      
      // 4. Xử lý lỗi từ Server
      const msg = error.response?.data?.message || 
                  (typeof error.response?.data === 'string' ? error.response?.data : "") ||
                  "Đổi mật khẩu thất bại. Kiểm tra lại mật khẩu cũ!";
                  
      Alert.alert("❌ Thất bại", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          
          <Text style={styles.headerTitle}>Đổi Mật Khẩu</Text>

          <Text style={styles.label}>Mật khẩu hiện tại</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            placeholder="Nhập mật khẩu hiện tại"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            editable={!loading} // Khóa khi đang loading
          />

          <Text style={styles.label}>Mật khẩu mới</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            placeholder="Nhập mật khẩu mới"
            value={newPassword}
            onChangeText={setNewPassword}
            editable={!loading}
          />

          <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            placeholder="Nhập lại mật khẩu mới"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.disabledButton]}
            onPress={handleChangePassword}
            disabled={loading}
          >
            {loading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={styles.buttonText}>Lưu thay đổi</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChangePasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#333',
      textAlign: 'center',
      marginBottom: 30,
      marginTop: 10
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 16,
    color: "#555",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#f9f9f9'
  },
  button: {
    backgroundColor: "#ff6600",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 40,
    shadowColor: "#ff6600",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  disabledButton: {
      backgroundColor: "#ffaa77",
      elevation: 0
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});