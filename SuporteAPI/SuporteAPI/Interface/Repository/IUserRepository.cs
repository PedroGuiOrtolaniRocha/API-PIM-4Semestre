using SuporteAPI.Models;

namespace SuporteAPI.Interface.Repository;

public interface IUserRepository
{
    public Task<List<User>> GetUsers();
    public Task<User?> GetUserById(int id);
    public Task<User?> GetUserByEmail(string email);
    public Task<User?> UpdateUser(User user);
    public Task<User?> InsertUser(User user);
    public Task<bool> UniqueEmail(string email, int? id = null);
}