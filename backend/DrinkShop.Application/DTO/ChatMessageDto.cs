using System.Collections.Generic;
using System;

namespace DrinkShop.Application.DTO
{
    

    public class ChatMessageDto {
        public string Role { get; set; } = string.Empty; // "user" hoặc "assistant"
        public string Content { get; set; } = string.Empty;
    }


}