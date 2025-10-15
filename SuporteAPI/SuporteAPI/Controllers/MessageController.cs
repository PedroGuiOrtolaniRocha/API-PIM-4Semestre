using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.AI;
using SuporteAPI.DTO;
using SuporteAPI.Interface;
using SuporteAPI.Interface.Repository;
using SuporteAPI.Interface.Service;
using SuporteAPI.Interface.Utils;
using SuporteAPI.Models;
using SuporteAPI.Service;
using SuporteAPI.Utils;

namespace SuporteAPI.Controllers;

[ApiController]
[Route("[controller]")]
public class MessageController : ControllerBase
{
    private readonly ILogger<MessageController> _logger;
    private readonly IChatGenerator _chatGenerator;
    private readonly IMessageRepository _messageRepository;
    private readonly IMessageService _messageService;

    public MessageController(ILogger<MessageController> logger, IChatGenerator chatGenerator, 
        IMessageRepository messageRepository, IMessageService messageService)
    {
        _messageService = messageService;
        _messageRepository  = messageRepository;
        _chatGenerator = chatGenerator;
        _logger = logger;
    }

    [HttpPost(Name = "SendMessage")]
    [Authorize]
    public async Task<IActionResult> SendMessage(MessageDto recivied)
    {
        var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "UserId");
        
        foreach (var claim in HttpContext.User.Claims)
        {
            Console.WriteLine(claim.Type + ": " + claim.Value);
        }
        Message message = new Message()
        {
            UserId = int.Parse(userIdClaim?.Value ?? throw new SuporteApiException("Usuário não autenticado", 401)),
            Time = DateTime.Now,
            BotText = "",
            UserText = recivied.Text,
            TicketId = recivied.TiketId
        };
            
        Message updateMsg = await _messageService.SendMessage(message) ?? new Message
        {
            UserId = message.UserId,
            Time = message.Time,
            BotText = "Algo deu errado, tente novamente mais tarde",
            UserText = message.UserText,
            TicketId = message.TicketId
        };
        
        MessageDto response = new MessageDto(updateMsg, await _messageService.GetAuthor(updateMsg));
        return Ok(response.Text);
    }
}