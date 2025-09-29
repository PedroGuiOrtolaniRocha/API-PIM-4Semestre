using SuporteAPI.Models;

namespace SuporteAPI.Interface;

public interface IUserRepository
{
    public Task<List<User>> GetUsers();
    public Task<User?> GetUserById(int id);
    public Task<User?> UpdateUser(User user);
    public Task<User?> InsertUser(User user);
}