using SuporteAPI.Interface;

namespace SuporteAPI.Service;

public class UserService
{
    private readonly IUserRepository _userRepository;

    
    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }
    
    
}