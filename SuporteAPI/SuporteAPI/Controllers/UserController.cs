using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using SuporteAPI.Models;
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
        return Ok(resp);
    }

    [HttpPatch(Name = "UpdateUser")]
    public IActionResult Patch(User user)
    {
        return Ok();
    }

    [HttpGet(Name = "GetUsers")]
    public IActionResult GetUsers()
    {
        return Ok(_userRepository.GetUsers());
    }

    [HttpGet("{id}", Name = "GetUserById")]
    public IActionResult GetUserById(int id)
    {
        return Ok(MockUtils.MockUser);

    }  
}