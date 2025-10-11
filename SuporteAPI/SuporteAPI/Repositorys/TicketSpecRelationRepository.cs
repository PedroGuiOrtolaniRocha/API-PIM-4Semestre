using SuporteAPI.Interface.Repository;
using SuporteAPI.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SuporteAPI.Repositorys
{
    public class TicketSpecRelationRepository : ITicketSpecRelationRepository
    {
        private readonly DbEntity _context;
        public TicketSpecRelationRepository(DbEntity context)
        {
            _context = context;
        }

        public async Task<TicketSpecRelation?> GetById(int id)
        {
            return await _context.TicketSpecRelations.FindAsync(id);
        }

        public async Task<List<TicketSpecRelation>> GetAll()
        {
            return await _context.TicketSpecRelations.ToListAsync();
        }

        public async Task<List<TicketSpecRelation>> GetByTicketId(int ticketId)
        {
            return await _context.TicketSpecRelations
                .Where(x => x.TicketId == ticketId)
                .ToListAsync();
        }

        public async Task<TicketSpecRelation?> AddRelation(TicketSpecRelation entity)
        {
            var result = await _context.TicketSpecRelations.AddAsync(entity);
            await _context.SaveChangesAsync();
            return result.Entity;
        }

        public async Task<bool> DeleteRelation(int id)
        {
            var entity = await _context.TicketSpecRelations.FindAsync(id);
            if (entity == null) return false;
            _context.TicketSpecRelations.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<TicketSpecRelation>> GetBySpecId(int specId)
        {
            return await _context.TicketSpecRelations
                .Where(x => x.SpecId == specId)
                .ToListAsync();
        }
    }
}

