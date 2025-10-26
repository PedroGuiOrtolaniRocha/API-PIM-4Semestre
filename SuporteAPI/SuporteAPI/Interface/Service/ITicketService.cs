using SuporteAPI.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using SuporteAPI.DTO;

namespace SuporteAPI.Interface.Service
{
    public interface ITicketService
    {
        Task<Ticket> CreateTicket(TicketCreateDto ticket, int userId);
        Task<List<Ticket>> GetAllTicketsByUser(int userId);
        Task<List<Ticket>> GetAllTickets();
        Task<Ticket?> GetTicketById(int id);
        Task<Ticket> FinishTicket(int id, string resolution);
        Task<Ticket> ChangeTec(int ticketId, int newOwnerId);
        Task<bool> AddSpec(int ticketId, int specId);
        Task<bool> RemoveSpec(int ticketId, int specId);
        Task ValidateTecForTicket(int tecId, int ticketId);
        Task<List<Spec>> GetSpecsByTicketId(int ticketId);
        Task<bool> RouteTicket(int ticketId);
    }
}
