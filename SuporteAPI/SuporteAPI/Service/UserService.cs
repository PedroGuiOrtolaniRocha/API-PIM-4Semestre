using System.ComponentModel.DataAnnotations;
using SuporteAPI.DTO;
using SuporteAPI.Interface;
using SuporteAPI.Interface.Repository;
using SuporteAPI.Interface.Service;
using SuporteAPI.Models;
using SuporteAPI.Utils;

namespace SuporteAPI.Service;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly ITecRegisterRepository _tecRegisterRepository;
    private readonly ISpecRepository _specRepository;

    public UserService(IUserRepository userRepository, ITecRegisterRepository tecRegisterRepository, ISpecRepository specRepository)
    {
        _userRepository = userRepository;
        _tecRegisterRepository = tecRegisterRepository;
        _specRepository = specRepository;
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

    public async Task<UserDto> InsertUser(User user)
    {
        await VerifyValidity(user);
        User? newUser = await _userRepository.InsertUser(user);
        return new UserDto(newUser);
    }

    public async Task<UserDto?> UpdateUser(User user)
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
            
        return new UserDto(user);

    }

    public async Task<UserDto?> GetUserById(int id)
    {
        User? user = await _userRepository.GetUserById(id);
        if (user == null)
        {
            return null;
        }
        return new UserDto(user);
    }

    public async Task<List<UserDto>> GetUsers()
    {
        List<UserDto> users = UserDto.ToDto(await _userRepository.GetUsers());
        return users;
    }

    public async Task<User> validateCredentials(string email, string password)
    {
        User? user = await _userRepository.GetUserByEmail(email);
        
        if (user == null || user.PasswordHash != PasswordUtils.ToHash(password))
        {
            throw new SuporteApiException("Email ou senha incorreta");
        }
        
        return user;
    }

    public async Task<List<Spec>> GetSpecsByUserId(int userId)
    {
        var tecRegisters = await _tecRegisterRepository.GetByUserId(userId);
        var specIds = tecRegisters.Select(tr => tr.SpecId).Distinct().ToList();
        var specs = new List<Spec>();
        foreach (var specId in specIds)
        {
            var spec = await _specRepository.GetSpecById(specId);
            if (spec != null)
                specs.Add(spec);
        }
        return specs;
    }
}