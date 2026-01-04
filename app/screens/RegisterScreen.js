// screens/RegisterScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons"; // Đảm bảo bạn đã cài expo/vector-icons

import api from "../src/api/apiConfig";

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  
  const [loading, setLoading] = useState(false);

  // State cho việc ẩn/hiện mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleRegister = async () => {
    if (!username || !email || !password || !confirm) {
      Alert.alert("⚠️ Thông báo", "Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    if (password !== confirm) {
      Alert.alert("❌ Lỗi", "Mật khẩu nhập lại không khớp!");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/Auth/register", {
        hoTen: username,
        email: email,
        matKhau: password,
        nhapLaiMatKhau: confirm,
      });

      Alert.alert("✅ Thành công", "Đăng ký tài khoản thành công!", [
        { text: "Về đăng nhập", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      const msg = err.response?.data?.message || "Đăng ký thất bại, vui lòng thử lại!";
      Alert.alert("❌ Đăng ký thất bại", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Image
              source={require("../assets/login-banner.jpg")}
              style={styles.image}
            />
            <Text style={styles.title}>Tạo tài khoản mới</Text>
            <Text style={styles.subtitle}>
              Điền thông tin để bắt đầu hành trình của bạn!
            </Text>

            {/* Input Họ Tên */}
            <TextInput
              style={styles.input}
              placeholder="Họ và tên"
              value={username}
              onChangeText={setUsername}
              editable={!loading}
            />

            {/* Input Email */}
            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              editable={!loading}
            />

            {/* Input Mật khẩu có mắt ẩn hiện */}
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Mật khẩu"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                editable={!loading}
              />
              <TouchableOpacity 
                style={styles.eyeIcon} 
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? "eye" : "eye-off"} 
                  size={22} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>

            {/* Input Nhập lại mật khẩu có mắt ẩn hiện */}
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Nhập lại mật khẩu"
                secureTextEntry={!showConfirm}
                value={confirm}
                onChangeText={setConfirm}
                editable={!loading}
              />
              <TouchableOpacity 
                style={styles.eyeIcon} 
                onPress={() => setShowConfirm(!showConfirm)}
              >
                <Ionicons 
                  name={showConfirm ? "eye" : "eye-off"} 
                  size={22} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Đăng ký</Text>
              )}
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Đã có tài khoản?</Text>
              <TouchableOpacity onPress={() => navigation.goBack()} disabled={loading}>
                <Text style={styles.loginLink}> Đăng nhập</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fd",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 20, // Để tránh bị che khi cuộn xuống cuối
  },
  image: {
    width: "100%",
    height: 160,
    marginBottom: 10,
    borderRadius: 30,
    resizeMode: 'cover',
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    color: "#333",
  },
  subtitle: {
    textAlign: "center",
    color: "#777",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    color: "#333",
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  passwordInput: {
    flex: 1,
    padding: 14,
    color: "#333",
  },
  eyeIcon: {
    paddingHorizontal: 14,
  },
  button: {
    backgroundColor: "#ff6600",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2, // Thêm chút bóng cho nút
  },
  buttonDisabled: {
    backgroundColor: "#ffaa77",
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  loginText: {
    color: "#555",
  },
  loginLink: {
    color: "#ff6600",
    fontWeight: "600",
  },
});