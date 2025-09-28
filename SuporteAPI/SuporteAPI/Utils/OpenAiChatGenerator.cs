using Microsoft.Extensions.AI;
using OpenAI;
using System.ClientModel;
using SuporteAPI.Interfaces;
using SuporteAPI.Models;



namespace SuporteAPI.Utils
{
    public class OpenAiChatGenerator : IChatGenerator
    {
        private readonly IChatClient _chatClient;
        
        public OpenAiChatGenerator()
        {
    
            OpenAIClientOptions options = new OpenAIClientOptions();
            options.Endpoint = new Uri(Environment.GetEnvironmentVariable("AI_URI"));
            
            _chatClient = new ChatClientBuilder(
                new OpenAIClient(
                    new ApiKeyCredential(
                        Environment.GetEnvironmentVariable("AI_API_KEY")
                        ), 
                    options)
                    .GetChatClient("meta-llama/llama-4-maverick-17b-128e-instruct").AsIChatClient())
                .UseFunctionInvocation()
                .Build();
        }

        public async Task<string> GenerateChatResponseAsync(string message, string name, List<Message>? messagesHistory = null)
        {
            ChatOptions chatOptions = new ChatOptions
            {
                Tools =
                [
                    
                ]
            };



            List<ChatMessage> chatHistory =
            [
                new ChatMessage(ChatRole.System, $"""
                responde qualquer coisa, mas seja bem criativo
                """)
            ];

            if (messagesHistory != null)
            {
                foreach (Message msg in messagesHistory)
                {
                    chatHistory.Add(new ChatMessage(ChatRole.User, msg.UserText));
                    chatHistory.Add(new ChatMessage(ChatRole.Assistant, msg.BotText));
                }
            }

            chatHistory.Add(new ChatMessage(ChatRole.User, message));

            string response = "";
            
            await foreach (ChatResponseUpdate item in
            _chatClient.GetStreamingResponseAsync(chatHistory, chatOptions))
            {
                response += item.Text;
            }
            chatHistory.Add(new ChatMessage(ChatRole.Assistant, response));

            return response.Trim();
        }
    }
}
