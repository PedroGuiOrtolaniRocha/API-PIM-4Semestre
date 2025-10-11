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
    public async Task<IActionResult> SendMessage(Message recivied)
    {
        Message updateMsg = await _messageService.SendMessage(recivied) ?? new Message
        {
            UserId = recivied.UserId,
            Time = recivied.Time,
            BotText = "Algo deu errado, tente novamente mais tarde",
            UserText = recivied.UserText,
            TicketId = recivied.TicketId
        };
        
        MessageDTO response = new MessageDTO(updateMsg, await _messageService.GetAuthor(updateMsg));
        return Ok(response);
    }
}