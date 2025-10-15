using SuporteAPI.Models;

namespace SuporteAPI.Interface.Utils
{
    public interface IChatGenerator
    {
        public Task<string> GenerateChatResponseAsync(string message, int ticketId, string ticketDescription, string name, List<Message>? messagesHistory = null);

    }
}
