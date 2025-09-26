using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using SuporteAPI.Models;
using SuporteAPI.Utils;


namespace SuporteAPI.Controllers;

[ApiController]
[Route("[controller]")]
public class UserController : ControllerBase
{

    private readonly ILogger<MessageController> _logger;

    public UserController(ILogger<MessageController> logger)
    {
        _logger = logger;
    }

    [HttpPost(Name = "CreateUser")]
    public IActionResult Post( User user)
    {
        return Ok();
    }

    [HttpPatch(Name = "UpdateUser")]
    public IActionResult Patch(User user)
    {
        return Ok();
    }

    [HttpGet("{id}" ,Name = "GetUser")]
    public IActionResult GetUsers()
    {
        return Ok(new List<User>()
        {
            MockUtils.MockUser, 
            MockUtils.MockUser
        });
    }

    [HttpGet(Name = "GetUserById")]
    public IActionResult GetUserById(int id)
    {
        return Ok(MockUtils.MockUser);

    }  
}