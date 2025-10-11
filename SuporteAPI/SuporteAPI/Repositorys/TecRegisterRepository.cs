using SuporteAPI.Interface.Repository;
using SuporteAPI.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SuporteAPI.Repositorys
{
    public class TecRegisterRepository : ITecRegisterRepository
    {
        private readonly DbEntity _context;
        public TecRegisterRepository(DbEntity context)
        {
            _context = context;
        }

        public async Task<TecRegister?> GetById(int id)
        {
            return await _context.TecRegisters.FindAsync(id);
        }

        public async Task<List<TecRegister>> GetAll()
        {
            return await _context.TecRegisters.ToListAsync();
        }

        public async Task<TecRegister?> AddTecRegister(TecRegister entity)
        {
            var result = await _context.TecRegisters.AddAsync(entity);
            await _context.SaveChangesAsync();
            return result.Entity;
        }

        public async Task<bool> DeleteTecRegister(int id)
        {
            var entity = await _context.TecRegisters.FindAsync(id);
            if (entity == null)
            {
                return false;
            }
            _context.TecRegisters.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }
        
        public async Task<List<TecRegister>> GetByUserId(int userId)
        {
            return await _context.TecRegisters.Where(x => x.UserId == userId).ToListAsync();
        }
    }
}

