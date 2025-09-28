using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.AI;
using SuporteAPI.Models;
using SuporteAPI.Utils;
using SuporteAPI.Interfaces;

namespace SuporteAPI.Controllers;

[ApiController]
[Route("[controller]")]
public class MessageController : ControllerBase
{
    private readonly ILogger<MessageController> _logger;
    private readonly IChatGenerator _chatGenerator;

    public MessageController(ILogger<MessageController> logger, IChatGenerator chatGenerator)
    {
        _chatGenerator = chatGenerator;
        _logger = logger;
    }

    [HttpPost(Name = "SendMessage")]
    public async Task<IActionResult> SendMessage(Message recivied)
    {
        _logger.LogInformation($"""
                                Informações mensagem recebida:
                                \nData/Hora: {recivied.Time} 
                                \nAutor: {recivied.AuthorId}
                                \nMensagem: {recivied.UserText}
                                """);

        User author = MockUtils.MockUser;
        
        return Ok( await _chatGenerator.GenerateChatResponseAsync(recivied.UserText, author.Username));
    }
}