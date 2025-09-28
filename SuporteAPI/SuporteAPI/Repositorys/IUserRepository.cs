using SuporteAPI.Models;

namespace SuporteAPI.Repositorys;

public interface IUserRepository
{
    public List<User> GetUsers();
    public User GetUserById(int id);
    public void UpdateUser(User user);
    public Task<User> InsertUser(User user);
}