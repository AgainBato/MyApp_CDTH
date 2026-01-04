import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../src/api/apiConfig";

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendEmail = async () => {
    if (!email.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập Email!");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/Auth/forgot-password", {
        email: email.trim(),
      });

      // 👉 DEV: BE trả token
      navigation.navigate("ResetPasswordScreen", {
        initialToken: String(res.data?.token || ""),
        email: email.trim(),
      });

    } catch (error) {
      const msg =
        error.response?.data?.message ||
        "Có lỗi xảy ra, vui lòng thử lại!";
      Alert.alert("Thất bại", String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.inner}>
            <Image
              source={require("../assets/forgot-password.jpg")}
              style={styles.image}
            />

            <Text style={styles.title}>Quên mật khẩu</Text>
            <Text style={styles.subtitle}>
              Nhập email để nhận mã xác nhận
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Email tài khoản"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <TouchableOpacity
              style={styles.button}
              onPress={handleSendEmail}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Lấy mã Token</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ marginTop: 24 }}
            >
              <Text style={{ color: "#ff6600", fontWeight: "bold" }}>
                Quay lại đăng nhập
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scroll: { flexGrow: 1, justifyContent: "center" },
  inner: { padding: 24, alignItems: "center" },
  image: { width: 100, height: 100, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  subtitle: { color: "#666", marginBottom: 24, textAlign: "center" },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
  button: {
    width: "100%",
    backgroundColor: "#ff6600",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
