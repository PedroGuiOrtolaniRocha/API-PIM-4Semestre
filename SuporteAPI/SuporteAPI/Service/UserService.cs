using System.ComponentModel.DataAnnotations;
using SuporteAPI.DTO;
using SuporteAPI.Interface;
using SuporteAPI.Models;
using SuporteAPI.Utils;

namespace SuporteAPI.Service;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;

    
    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task VerifyValidity(User user)
    {
        bool uniqueEmail = await _userRepository.UniqueEmail(user.Email);
        if (!uniqueEmail)
        {
            throw new SuporteApiException("Email já cadastrado");
        }
        if (user.PasswordHash.Length < 6)
        {
            throw new SuporteApiException("A senha deve ter pelo menos 6 caracteres");
        }
    }

    public async Task<UserDTO> InsertUser(User user)
    {
        await VerifyValidity(user);
        User? newUser = await _userRepository.InsertUser(user);
        return new UserDTO(newUser);
    }

    public async Task<UserDTO?> UpdateUser(User user)
    {
        User? oldUser = await _userRepository.GetUserById(user.Id);
        VerifyValidity(user);
        
        if (! await _userRepository.UniqueEmail(user.Email, user.Id))
        {
            throw new SuporteApiException("Email já cadastrado");
        }
        
        if (user.PasswordHash != oldUser.PasswordHash)
        {
            user.PasswordHash = PasswordUtils.ToHash(user.PasswordHash);
        }
        
        var resp = await _userRepository.UpdateUser(user);
        
        if (resp == null)
        {
            return null;
        }
            
        return new UserDTO(user);

    }

    public async Task<UserDTO?> GetUserById(int id)
    {
        User? user = await _userRepository.GetUserById(id);
        if (user == null)
        {
            return null;
        }
        return new UserDTO(user);
    }

    public async Task<List<UserDTO>> GetUsers()
    {
        List<UserDTO> users = UserDTO.ToDTO(await _userRepository.GetUsers());
        return users;
    }

    public async Task<bool> validateCredentials(string email, string password)
    {
        User? user = await _userRepository.GetUserByEmail(email);
        
        if (user == null || user.PasswordHash != PasswordUtils.ToHash(password))
        {
            throw new SuporteApiException("Email ou senha incorreta");
        }
        
        return true;
    }
}