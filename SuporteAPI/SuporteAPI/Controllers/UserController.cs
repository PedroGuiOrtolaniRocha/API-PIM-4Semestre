using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using SuporteAPI.Models;
using SuporteAPI.DTO;
using SuporteAPI.Interface;
using SuporteAPI.Utils;
using SuporteAPI.Repositorys;


namespace SuporteAPI.Controllers;

[ApiController]
[Route("[controller]")]
public class UserController : ControllerBase
{

    private readonly ILogger<MessageController> _logger;
    private readonly IUserRepository _userRepository;

    public UserController(ILogger<MessageController> logger, IUserRepository userRepository)
    {
        _logger = logger;
        _userRepository = userRepository;
    }

    [HttpPost(Name = "CreateUser")]
    public async Task<IActionResult> Post( User user)
    {
        user.Id = 0;
        User resp = await _userRepository.InsertUser(user);

        if (resp != null)
        {
            return Ok(new UserDTO(resp));
        }
        
        return BadRequest("Email e username devem ser únicos");
    }

    [HttpPatch(Name = "UpdateUser")]
    public async Task<IActionResult> Patch(User user)
    {
        User? oldUser = await _userRepository.GetUserById(user.Id);
        if (user != null)
        {
            if (user.PasswordHash != oldUser.PasswordHash)
            {
                user.PasswordHash = PasswordUtils.ToHash(user.PasswordHash);
            }
            
            var resp = await _userRepository.UpdateUser(user);

            if (resp != null)
            {
                return Ok(new UserDTO(user));
            }
        }
        
        return NotFound();
    }

    [HttpGet(Name = "GetUsers")]
    public async Task<IActionResult> GetUsers()
    {
        List<UserDTO> users = UserDTO.ToDTO(await _userRepository.GetUsers());
        return Ok(users);
    }

    [HttpGet("{id}", Name = "GetUserById")]
    public async Task<IActionResult> GetUserById(int id)
    {
        User? user = await _userRepository.GetUserById(id);
        if (user != null)
        {
            return Ok(new UserDTO(user));
        }
        return NotFound();

    }  
}