using SuporteAPI.Models;

namespace SuporteAPI.Interface.Utils
{
    public interface IChatGenerator
    {
        public Task<string> GenerateChatResponseAsync(string message, string name, List<Message>? messagesHistory = null);

    }
}
