// screens/LoginScreen.js
import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
  Image, KeyboardAvoidingView, Platform, ActivityIndicator,
  ScrollView, TouchableWithoutFeedback, Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import api from "../src/api/apiConfig";

// Google + Firebase
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { auth } from "../src/api/firebase";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: "576154742174-kkrai2ojafmr1h366uvn274m8m8jvk5r.apps.googleusercontent.com",
  });

  useEffect(() => {
    if (response?.type === "success") {
      handleGoogleLogin(response.authentication?.idToken);
    }
  }, [response]);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("⚠️", "Vui lòng nhập đủ thông tin!");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/api/Auth/login", { taiKhoan: username, matKhau: password });
      const token = res.data.token || res.data.accessToken || (res.data.data && res.data.data.token);
      if (token) {
        await AsyncStorage.setItem("accessToken", token);
        navigation.replace("Main");
      }
    } catch (err) {
      Alert.alert("❌ Thất bại", "Sai tài khoản hoặc mật khẩu!");
    } finally { setLoading(false); }
  };

  const handleGoogleLogin = async (idToken) => {
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      const firebaseToken = await userCredential.user.getIdToken();
      await AsyncStorage.setItem("accessToken", firebaseToken);
      navigation.replace("Main");
    } catch (err) { Alert.alert("Lỗi", "Đăng nhập Google thất bại"); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            
            <Image source={require("../assets/login-banner.jpg")} style={styles.image} />
            <Text style={styles.title}>Drink Shop 👋</Text>
            <Text style={styles.subtitle}>Đăng nhập để tiếp tục</Text>

            {/* INPUTS */}
            <TextInput style={styles.input} placeholder="Tên đăng nhập" value={username} onChangeText={setUsername} autoCapitalize="none" />
            
            <View style={styles.passwordBox}>
              <TextInput style={styles.passwordInput} placeholder="Mật khẩu" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#666" />
              </TouchableOpacity>
            </View>

            {/* QUÊN MẬT KHẨU - ĐÃ CĂN GIỮA DƯỚI Ô MẬT KHẨU */}
            <TouchableOpacity 
              style={styles.forgotBtn} 
              onPress={() => navigation.navigate("ForgotPasswordScreen")}
            >
              <Text style={styles.forgotText}>Quên mật khẩu?</Text>
            </TouchableOpacity>

            {/* NÚT ĐĂNG NHẬP */}
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginText}>Đăng nhập</Text>}
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} /><Text style={styles.orText}>HOẶC</Text><View style={styles.divider} />
            </View>

            {/* GOOGLE */}
            <TouchableOpacity style={styles.googleButton} onPress={() => promptAsync()}>
              <Ionicons name="logo-google" size={20} color="#DB4437" style={{ marginRight: 10 }} />
              <Text style={styles.googleText}>Đăng nhập Google</Text>
            </TouchableOpacity>

            {/* ĐĂNG KÝ */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Chưa có tài khoản? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("RegisterScreen")}>
                <Text style={styles.signupLink}>Đăng ký ngay</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fd" },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 40, justifyContent: 'center' },
  image: { width: "100%", height: 160, borderRadius: 30, marginBottom: 15 },
  title: { fontSize: 28, fontWeight: "800", textAlign: "center", color: "#ff6600" },
  subtitle: { textAlign: "center", color: "#777", marginBottom: 25, fontSize: 16 },
  input: { backgroundColor: "#fff", borderRadius: 12, padding: 15, borderWidth: 1, borderColor: "#ddd", marginBottom: 15 },
  passwordBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 15, borderWidth: 1, borderColor: "#ddd" },
  passwordInput: { flex: 1, paddingVertical: 15 },
  
  // FIXED: CĂN GIỮA QUÊN MẬT KHẨU
  forgotBtn: {
    width: '100%',
    alignItems: 'center', // Căn giữa theo chiều ngang
    marginVertical: 15,    // Khoảng cách trên dưới cho thoáng
  },
  forgotText: { color: "#ff6600", fontWeight: "600", fontSize: 14 },

  loginButton: { backgroundColor: "#ff6600", paddingVertical: 15, borderRadius: 12, alignItems: "center" },
  loginText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  dividerContainer: { flexDirection: "row", alignItems: "center", marginVertical: 20 },
  divider: { flex: 1, height: 1, backgroundColor: "#ddd" },
  orText: { marginHorizontal: 10, color: "#888", fontSize: 12 },
  googleButton: { flexDirection: "row", backgroundColor: "#fff", borderWidth: 1, borderColor: "#ddd", paddingVertical: 14, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  googleText: { fontWeight: "700" },
  signupContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 25 },
  signupText: { color: '#666' },
  signupLink: { color: '#ff6600', fontWeight: 'bold' },
});