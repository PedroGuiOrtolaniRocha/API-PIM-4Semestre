using SuporteAPI.Interfaces;
using SuporteAPI.Models;

namespace SuporteAPI.Interface;

public interface IMessageService
{
    public Task<bool> VerifyConditions(Message message);

    public Task<List<Message>> GetChatHistory(Message message);
    public Task<Message?> SendMessage(Message message);
    
    public Task<User?> GetAuthor(Message message);
}