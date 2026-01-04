import React, { useState, useRef } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  FlatList, StyleSheet, SafeAreaView, ActivityIndicator, KeyboardAvoidingView, Platform 
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import api from "../src/api/apiConfig"; // Sử dụng cấu hình Axios hiện tại của bạn

const ChatScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Chào bạn! DrinkShop có thể giúp gì cho bạn hôm nay?" }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef();

  const sendMessage = async () => {
    if (!inputText.trim() || loading) return;

    // 1. Tạo tin nhắn của người dùng
    const userMsg = { role: "user", content: inputText };
    const newMessages = [...messages, userMsg];
    
    setMessages(newMessages);
    setInputText('');
    setLoading(true);

    try {
      // 2. Gọi API Backend (Sử dụng cấu trúc ChatRequest: { messages: [...] })
      // Backend của bạn sẽ nhận mảng này và nhồi thêm dữ liệu DB vào Groq
      const response = await api.post("/api/Chat", { 
        messages: newMessages.slice(-6) // Gửi 6 tin nhắn gần nhất để làm lịch sử chat (context)
      });

      // 3. Lấy câu trả lời từ trường 'answer' mà Backend trả về
      const aiAnswer = response.data.answer;
      
      setMessages(prev => [...prev, { role: "assistant", content: aiAnswer }]);
    } catch (error) {
      console.error("Lỗi Chat:", error.response?.data || error.message);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Xin lỗi, hệ thống tư vấn đang bận. Bạn vui lòng thử lại sau nhé!" 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.msg, item.role === 'user' ? styles.userMsg : styles.botMsg]}>
      <Text style={item.role === 'user' ? styles.userText : styles.botText}>{item.content}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header đơn giản */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trợ lý DrinkShop</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{ flex: 1 }}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 10 }}
          onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
        />
        
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#ff6600" />
            <Text style={styles.loadingText}>Đang suy nghĩ...</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Hỏi về món ăn, giá cả..."
            placeholderTextColor="#999"
            multiline
          />
          <TouchableOpacity 
            style={[styles.btn, !inputText.trim() && { backgroundColor: '#ccc' }]} 
            onPress={sendMessage}
            disabled={!inputText.trim() || loading}
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' 
  },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#333' },
  msg: { padding: 12, borderRadius: 18, marginHorizontal: 12, marginVertical: 5, maxWidth: '85%' },
  userMsg: { 
    alignSelf: 'flex-end', backgroundColor: '#ff6600', 
    borderBottomRightRadius: 2 
  },
  botMsg: { 
    alignSelf: 'flex-start', backgroundColor: '#fff', 
    borderBottomLeftRadius: 2, elevation: 1, shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1 
  },
  userText: { color: '#fff', fontSize: 15 },
  botText: { color: '#333', fontSize: 15, lineHeight: 20 },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', marginLeft: 20, marginBottom: 10 },
  loadingText: { fontSize: 12, color: '#999', marginLeft: 5 },
  inputContainer: { 
    flexDirection: 'row', padding: 12, backgroundColor: '#fff', 
    alignItems: 'center', borderTopWidth: 1, borderTopColor: '#eee' 
  },
  input: { 
    flex: 1, backgroundColor: '#f0f2f5', borderRadius: 20, 
    paddingHorizontal: 15, paddingVertical: 8, marginRight: 10, 
    maxHeight: 100, color: '#333' 
  },
  btn: { 
    backgroundColor: '#ff6600', width: 40, height: 40, 
    borderRadius: 20, justifyContent: 'center', alignItems: 'center' 
  }
});

export default ChatScreen;