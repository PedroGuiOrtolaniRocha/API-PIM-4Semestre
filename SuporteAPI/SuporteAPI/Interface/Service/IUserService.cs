using SuporteAPI.DTO;
using SuporteAPI.Models;

namespace SuporteAPI.Interface.Service;

public interface IUserService
{
    public Task VerifyValidity(User user);

    public Task<UserDTO> InsertUser(User user);
    
    public Task<UserDTO?> UpdateUser(User user);
    
    public Task<UserDTO?> GetUserById(int id);
    
    public Task<List<UserDTO>> GetUsers();
    
    public Task<bool> validateCredentials(string username, string password);
}