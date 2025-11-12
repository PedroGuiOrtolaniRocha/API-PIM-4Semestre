using SuporteAPI.Models;

namespace SuporteAPI.Interface.Repository;

public interface ITicketRepository
{
    public Task<Ticket?> GetTicketById(int id);
    public Task<List<Ticket>> GetAllTickets();
    public Task<List<Ticket>> GetAllTicketsByUser(int userId);
    public Task<Ticket?>  CreateTicket(Ticket ticket);
    public Task<Ticket?> UpdateTicket(Ticket ticket);
    public Task<List<Spec>> GetSpecsByTicketId(int ticketId);
    public Task<List<Ticket>> GetOpenTicketByTecId(int userId);


}