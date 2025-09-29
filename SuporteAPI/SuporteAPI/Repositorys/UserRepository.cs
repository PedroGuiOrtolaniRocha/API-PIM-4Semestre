using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using SuporteAPI.Interface;
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
    
    public async Task<User?> UpdateUser(User user)
    {
        if (_context.Users.Any(u => u.Id == user.Id))
        {
            var resp = _context.Users.Update(user);
            await _context.SaveChangesAsync();
            return resp.Entity;
        }
        return null;
    }
    
    public async Task<User?> InsertUser(User user)
    {
        try
        {
            if (_context.Users.Any(u => u.Email == user.Email) || _context.Users.Any(u => u.Username == user.Username))
            {
                return null;
            }
            user.PasswordHash = Utils.PasswordUtils.ToHash(user.PasswordHash);
            var resp = await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
            return resp.Entity;
        }
        catch (DbUpdateException ex)
        {
            var sqlException = ex.InnerException;
            throw;
        }

    }
}