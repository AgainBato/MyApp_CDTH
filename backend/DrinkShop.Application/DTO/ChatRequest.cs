using System.Collections.Generic;
using System;
namespace DrinkShop.Application.DTO
{ 
    public class ChatRequest
    {
        public List<ChatMessageDto> Messages { get; set; } = new List<ChatMessageDto>();
    }
}