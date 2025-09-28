using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using SuporteAPI.Models;

namespace SuporteAPI.Repositorys;

public class UserRepository : IUserRepository
{
    private readonly DbEntity _context;

    public UserRepository(DbEntity context)
    {
        _context = context;
    }
    public List<User> GetUsers()
    {
        return _context.Users.ToList();
    }

    public User GetUserById(int id)
    {
        return new User();
    }
    
    public void UpdateUser(User user)
    {
        
    }
    
    public async Task<User> InsertUser(User user)
    {
        try
        {
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