using Microsoft.EntityFrameworkCore;
using SuporteAPI.Interface;
using SuporteAPI.Models;

namespace SuporteAPI.Repositorys;

public class MessageRepository : IMessageRepository
{
    private readonly DbEntity _context;
    public MessageRepository(DbEntity context)
    {
        _context = context;
    }
    public async Task<List<Message>> GetMessagesByUserId(int userId)
    {
        
        return await _context.Messages
            .Where(x => x.UserId == userId)
            .ToListAsync<Message>();
        
    }

    public async Task<List<Message>> GetMessagesByTicketId(int ticketId)
    {
        return await _context.Messages
            .Where(x => x.TicketId == ticketId)
            .ToListAsync<Message>();    
    }

    public async Task<Message?> InsertMessage(Message message)
    {
        User? author = await _context.Users.FirstOrDefaultAsync(x => x.Id == message.UserId);
        if (author == null)
        {
            return null;
        }

        var resp = await _context.Messages.AddAsync(message);
        await _context.SaveChangesAsync();
        
        return resp.Entity;
    }
}