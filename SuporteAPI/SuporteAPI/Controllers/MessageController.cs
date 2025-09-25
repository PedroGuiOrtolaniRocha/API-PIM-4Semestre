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
        _logger.LogInformation($"""
                                Informações mensagem recebida:
                                \nData/Hora: {recivied.Time} 
                                \nAutor: {recivied.Author}
                                \nMensagem: {recivied.MessageText}
                                """);
        
        return new Message(null,
            new User(null, "bot", "contact@invalid", "senha123"), 
            $"respondendo para {recivied.Author}"
            );
    }
}