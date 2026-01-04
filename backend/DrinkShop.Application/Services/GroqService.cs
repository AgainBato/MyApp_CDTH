using DrinkShop.Application.Interfaces;
using DrinkShop.Application.DTO;
using Newtonsoft.Json;
using System.Text;
using System.Net.Http.Headers;

namespace DrinkShop.Application.Services
{
    public class GroqService : IGroqService
    {
        private readonly string _apiKey;
        private readonly string _endpoint = "https://api.groq.com/openai/v1/chat/completions";

        public GroqService()
        {
            // Lấy Key từ biến môi trường (đã nạp từ .env trong Program.cs)
            _apiKey = Environment.GetEnvironmentVariable("GROQ_API_KEY") ?? "";
        }

        public async Task<string> GetAiResponseAsync(List<ChatMessageDto> history, string dbContext)
        {
            if (string.IsNullOrEmpty(_apiKey)) throw new Exception("GROQ_API_KEY chưa cấu hình.");

            try
            {
                using var client = new HttpClient();
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

                // NÂNG CẤP PROMPT: Phân chia rõ ràng các mục dữ liệu để AI dễ tra cứu
                var systemMessage = new { 
                    role = "system", 
                    content = $@"Bạn là trợ lý ảo thông minh của DrinkShop. 
                                Dưới đây là dữ liệu thực tế từ hệ thống:
                                {dbContext}
                                
                                HƯỚNG DẪN TRẢ LỜI:
                                1. Nếu khách hỏi về đơn hàng, hãy nhìn vào mục 'Lịch sử đơn hàng' trong dữ liệu.
                                2. Ưu tiên gợi ý các món có đánh giá sao cao nhất.
                                3. Nếu khách hỏi loại món, hãy dựa vào 'Danh mục' để giới thiệu.
                                4. Trả lời thân thiện, sử dụng icon phù hợp 🥤☕."
                };

                var messages = new List<object> { systemMessage };
                foreach (var msg in history)
                {
                    messages.Add(new { role = msg.Role.ToLower(), content = msg.Content });
                }

                var requestBody = new {
                    model = "llama-3.3-70b-versatile",
                    messages = messages,
                    temperature = 0.6 // Giảm nhiệt độ để AI trả lời chính xác dữ liệu hơn
                };

                var json = JsonConvert.SerializeObject(requestBody);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                var response = await client.PostAsync(_endpoint, content);
                var responseString = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode) return "Lỗi kết nối AI.";

                dynamic result = JsonConvert.DeserializeObject(responseString);
                return result.choices[0].message.content ?? "Tôi chưa hiểu ý bạn.";
            }
            catch (Exception ex) { return $"Lỗi hệ thống: {ex.Message}"; }
        }
    }
}