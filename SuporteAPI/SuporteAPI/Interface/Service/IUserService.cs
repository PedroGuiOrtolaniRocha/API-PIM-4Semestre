using SuporteAPI.DTO;
using SuporteAPI.Models;

namespace SuporteAPI.Interface.Service;

public interface IUserService
{
    public Task VerifyValidity(User user);

    public Task<UserDto> InsertUser(User user);
    
    public Task<UserDto?> UpdateUser(User user);
    
    public Task<UserDto?> GetUserById(int id);
    
    public Task<List<UserDto>> GetUsers();
    
    public Task<User> validateCredentials(string username, string password);

    public Task<List<Spec>> GetSpecsByUserId(int userId);
}