using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using SuporteAPI.Interface;
using SuporteAPI.Interface.Repository;
using SuporteAPI.Models;

namespace SuporteAPI.Repositorys;

public class UserRepository : IUserRepository
{
    private readonly DbEntity _context;

    public UserRepository(DbEntity context)
    {
        _context = context;
    }
    public async Task<List<User>> GetUsers()
    {
        return await _context.Users.ToListAsync();
    }

    public async Task<User?> GetUserById(int id)
    {
        User? user = await _context.Users.FindAsync(id);
        return user;
    }
    
    public async Task<User?> GetUserByEmail(string email)
    {
        User? user = await _context.Users
                .Where(u => u.Email == email)
                .FirstOrDefaultAsync();
        
        return user;
    }
    
    public async Task<User?> UpdateUser(User user)
    {
        User? toUpdate = await _context.Users.FindAsync(user.Id);
        if (toUpdate != null)
        {
            toUpdate.Email = user.Email;
            toUpdate.Username = user.Username;
            toUpdate.Role = user.Role;
            
            var resp = _context.Users.Update(toUpdate);
            await _context.SaveChangesAsync();
            return resp.Entity;
        }
        return null;
    }
    
    public async Task<User?> InsertUser(User user)
    {
        try
        {
            user.PasswordHash = Utils.PasswordUtils.ToHash(user.PasswordHash);
            var resp = await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
            return resp.Entity;
        }
        catch (DbUpdateException ex)
        {
            var sqlException = ex.InnerException;
            throw sqlException;
        }
    }
    public async Task<bool> UniqueEmail(string email, int? id = null)
    {
        return !await _context.Users.AnyAsync(u => u.Email == email && u.Id != id);
    }

    public async Task<User?> GetMostAvaliableUserBySpecs(List<int> specIds)
    {
        List<int> userIds =  _context.TecRegisters
            .Where(tr => specIds.Contains(tr.SpecId))
            .Select(tr => tr.UserId)
            .Distinct()
            .ToList();
        
        var usersWithTicketCounts = await _context.Users
            .Where(u => userIds.Contains(u.Id))
            .Select(u => new
            {
                User = u,
                TicketCount = _context.Tickets.Count(t => t.TecUserId == u.Id && t.Status != "Fechado")
            })
            .OrderBy(ut => ut.TicketCount)
            .ToListAsync();     
        
        var mostAvaliableUser = usersWithTicketCounts.FirstOrDefault()?.User;
        return mostAvaliableUser;
    }
}