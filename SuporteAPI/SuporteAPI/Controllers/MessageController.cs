using Microsoft.AspNetCore.Mvc;
using SuporteAPI.Models;
using SuporteAPI.Utils;

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
    public IActionResult SendMessage(Message recivied)
    {
        _logger.LogInformation($"""
                                Informações mensagem recebida:
                                \nData/Hora: {recivied.Time} 
                                \nAutor: {recivied.Author}
                                \nMensagem: {recivied.MessageText}
                                """);
        
        return Ok(MockUtils.MockMessage);
    }
}