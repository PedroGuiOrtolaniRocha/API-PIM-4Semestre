using SuporteAPI.Models;

namespace SuporteAPI.Interface.Service;

public interface IMessageService
{
    public Task VerifyConditions(Message message);
    
    public Task<List<Message>?> GetMessagesByTicketId(int ticketId);

    public Task<Message?> SendMessage(Message message);
    
    public Task<User?> GetAuthor(Message message);
}