using Microsoft.AspNetCore.Mvc;

namespace SuporteAPI.Controllers;

[ApiController]
[Route("[controller]")]
public class UserController
{

    private readonly ILogger<MessageController> _logger;

    public UserController(ILogger<MessageController> logger)
    {
        _logger = logger;
    }

    [HttpPost(Name = "CreateUser")]
    public User Post( User user)
    {
        return new User(user.Id, user.Username,  user.Email, user.PasswordHash);
    }
    
}