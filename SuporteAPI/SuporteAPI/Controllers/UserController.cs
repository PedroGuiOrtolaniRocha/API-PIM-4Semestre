using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SuporteAPI.Models;
using SuporteAPI.DTO;
using SuporteAPI.Interface;
using SuporteAPI.Interface.Service;
using SuporteAPI.Utils;


namespace SuporteAPI.Controllers;

[ApiController]
[Route("[controller]")]
public class UserController : ControllerBase
{

    private readonly ILogger<MessageController> _logger;
    private readonly IUserService _userService;

    public UserController(ILogger<MessageController> logger, IUserService userService)
    {
        _logger = logger;
        _userService = userService;
    }

    [HttpPost(Name = "CreateUser")]
    public async Task<IActionResult> Post(User user)
    {
        user.Id = 0;
        try
        {
            var resp = await _userService.InsertUser(user);
            return Ok(resp);
        }
        catch (Exception ex)
        {
            throw SuporteApiException.HigienizeException(ex);
        }
    }

    [HttpPatch("{id}",Name = "UpdateUser")]
    [Authorize]
    public async Task<IActionResult> Patch(int id, User user)
    {
        try
        {
            user.Id = id;
            var resp = await _userService.UpdateUser(user);
            if (resp != null)
            {
                return Ok(resp);
            }

            throw new SuporteApiException("Usuário não encontrado", 404);
        }
        catch (Exception ex)
        {
            throw SuporteApiException.HigienizeException(ex);
        }
    }

    [HttpGet(Name = "GetUsers")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _userService.GetUsers();
        return Ok(users);
    }

    [HttpGet("{id}", Name = "GetUserById")]
    public async Task<IActionResult> GetUserById(int id)
    {
        var user = await _userService.GetUserById(id);
        if (user != null)
        {
            return Ok(user);
        }
        throw new SuporteApiException("Usuário não encontrado", 404);
    }

    [HttpGet("{id}/specs", Name = "GetSpecsByUserId")]
    public async Task<IActionResult> GetSpecsByUserId(int id)
    {
        var specs = await _userService.GetSpecsByUserId(id);
        return Ok(specs);
    }

    [HttpPost("validateCredentials", Name = "ValidateCredentials")]
    public async Task<IActionResult> ValidateCredentials([FromBody] CredentialDto credentials)
    {
        User user = await _userService.validateCredentials(credentials.Email, credentials.Password);
        string token = Auth.GenerateToken(user);
        return Ok(new { user = new UserDto(user), token });
    }
}