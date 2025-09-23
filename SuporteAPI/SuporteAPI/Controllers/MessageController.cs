using Microsoft.AspNetCore.Mvc;

namespace SuporteAPI.Controllers;

[ApiController]
[Route("[controller]")]
public class MessageController : ControllerBase
{
    private readonly ILogger<MessageController> _logger;

    public MessageController(ILogger<MessageController> logger)
    {
        _logger = logger;
    }

    [HttpPost(Name = "SendMessage")]
    public Message SendMessage(Message recivied)
    {
        return new Message("bot", $"respondendo para {recivied.Author}");
    }
}