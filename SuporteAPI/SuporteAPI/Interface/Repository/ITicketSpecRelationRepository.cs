using SuporteAPI.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SuporteAPI.Interface.Repository
{
    public interface ITicketSpecRelationRepository
    {
        public Task<List<TicketSpecRelation>> GetByTicketId(int ticketId);
        public Task<TicketSpecRelation?> AddRelation(TicketSpecRelation ticketSpecRelation);
        public Task<bool> DeleteRelation(int id);
        public Task<List<TicketSpecRelation>> GetBySpecId(int specId);
    }
}

