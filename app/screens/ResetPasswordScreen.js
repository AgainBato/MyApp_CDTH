import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "../src/api/apiConfig";

export default function ResetPasswordScreen({ route, navigation }) {
  const { initialToken = "" } = route.params || {};

  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // 👉 DEV: hiện token
  useEffect(() => {
    if (initialToken) {
      setTimeout(() => {
        Alert.alert("DEV TOKEN", initialToken);
      }, 500);
    }
  }, [initialToken]);

  const handleReset = async () => {
    if (!token || !newPassword) {
      Alert.alert("Lỗi", "Vui lòng nhập token và mật khẩu mới!");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/Auth/reset-password", {
        token,
        newPassword,
      });

      Alert.alert("Thành công", "Đổi mật khẩu thành công!", [
        { text: "Đăng nhập", onPress: () => navigation.popToTop() },
      ]);
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        "Mã xác nhận không hợp lệ hoặc đã hết hạn!";
      Alert.alert("Thất bại", String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Đặt lại mật khẩu</Text>

          <TextInput
            style={styles.input}
            placeholder="Mã Token"
            value={token}
            onChangeText={setToken}
            keyboardType="number-pad"
          />

          <View style={styles.passwordBox}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Mật khẩu mới"
              secureTextEntry={!showPassword}
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={22}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleReset}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Xác nhận</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", padding: 24 },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 14,
    borderRadius: 8,
    marginTop: 20,
  },
  passwordBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginTop: 16,
  },
  passwordInput: { flex: 1, paddingVertical: 12 },
  button: {
    backgroundColor: "#ff6600",
    padding: 15,
    borderRadius: 8,
    marginTop: 24,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "bold" },
});
