using Microsoft.Extensions.AI;
using OpenAI;
using System.ClientModel;
using SuporteAPI.Interface.Service;
using SuporteAPI.Interface.Utils;
using SuporteAPI.Models;



namespace SuporteAPI.Utils
{
    public class OpenAiChatGenerator : IChatGenerator
    {
        private readonly IChatClient _chatClient;
        private readonly ITicketService _ticketService;
        
        public OpenAiChatGenerator(ITicketService ticketService)
        {
            _ticketService = ticketService;
            
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

        public async Task<string> GenerateChatResponseAsync(string message, int ticketId,string ticketDescription, string name, List<Message>? messagesHistory = null)
        {
            ChatOptions chatOptions = new ChatOptions
            {
                Tools =
                [
                    AIFunctionFactory.Create(async (string resolution) =>
                        {
                            Console.WriteLine($"Finalizando ticket {ticketId} com resolução: {resolution}");
                            return await _ticketService.FinishTicket(ticketId, resolution);
                        },
                        "FinishTicket",
                        """
                        Só utilize esta função se o usuário confirmar explicitamente que o problema foi resolvido e está satisfeito com a solução. Pergunte ao usuário antes de chamar esta função e só execute após uma resposta afirmativa. Passe uma descrição detalhada contendo palavras-chave para facilitar futuras pesquisas.
                        """)
                ]
            };



            List<ChatMessage> chatHistory =
            [
                new ChatMessage(ChatRole.System, $"""
                você é um assistente de suporte técnico especializado em resolver problemas relacionados a software e hardware.
                Seu objetivo é ajudar os usuários a solucionar problemas técnicos de forma eficiente e clara.
                Você deve fornecer instruções passo a passo, sugestões de solução de problemas e recomendações de melhores práticas.
                Sempre que possível, forneça links para recursos adicionais ou documentação relevante.
                Seja paciente e compreensivo, adaptando suas respostas ao nível de conhecimento técnico do usuário.
                O nome do usuário é {name} e a descrição do problema é: {ticketDescription}
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
