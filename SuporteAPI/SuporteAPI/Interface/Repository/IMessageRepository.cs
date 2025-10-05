using SuporteAPI.Models;

namespace SuporteAPI.Interface.Repository;

public interface IMessageRepository
{
    public Task<List<Message>> GetMessagesByUserId(int userId);
    public Task<List<Message>> GetMessagesByTicketId(int ticketId);
    public Task<Message?> InsertMessage(Message message);
}