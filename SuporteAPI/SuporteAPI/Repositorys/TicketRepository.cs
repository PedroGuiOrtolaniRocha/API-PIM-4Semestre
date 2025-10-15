using Microsoft.EntityFrameworkCore;
using SuporteAPI.Interface;
using SuporteAPI.Interface.Repository;
using SuporteAPI.Models;

namespace SuporteAPI.Repositorys;

public class TicketRepository :  ITicketRepository
{
    private readonly DbEntity _context;
    
    public TicketRepository(DbEntity context)
    {
        _context = context;
    }

    public async Task<Ticket?> GetTicketById(int id)
    {
        return await _context.Tickets.FindAsync(id);
    }

    public async Task<List<Ticket>> GetAllTickets()
    {
        return await _context.Tickets.ToListAsync();
    }

    public async Task<List<Ticket>> GetAllTicketsByUser(int userId)
    {
        return await _context.Tickets.Where(x => x.UserId == userId).ToListAsync();
    }

    public async Task<Ticket?> CreateTicket(Ticket ticket)
    {
        if (_context.Users.Any(x => x.Id == ticket.UserId))
        {
            ticket.CreatedAt = DateTime.Now;
            var resp = await _context.Tickets.AddAsync(ticket);
            await _context.SaveChangesAsync();
            
            return resp.Entity;
        }

        return null;
    }
    public async Task<Ticket?> UpdateTicket(Ticket ticket)
    {
        var existingTicket = await _context.Tickets.FindAsync(ticket.Id);
        if (existingTicket == null)
        {
            return null;
        }

        existingTicket.Title = ticket.Title;
        existingTicket.Description = ticket.Description;
        existingTicket.Status = ticket.Status;
        existingTicket.UpdatedAt = DateTime.Now;
        existingTicket.TecUserId = ticket.TecUserId;

        await _context.SaveChangesAsync();
        
        return existingTicket;
    }
    public async Task<List<Spec>> GetSpecsByTicketId(int ticketId)
    {
        return await _context.TicketSpecRelations
            .Where(rel => rel.TicketId == ticketId)
            .Join(_context.Specs,
                  rel => rel.SpecId,
                  spec => spec.Id,
                  (rel, spec) => spec)
            .ToListAsync();
    }
}