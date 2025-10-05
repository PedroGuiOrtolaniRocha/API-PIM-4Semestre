using System.ComponentModel.DataAnnotations;
using SuporteAPI.Interface;
using SuporteAPI.Interfaces;
using SuporteAPI.Models;
using SuporteAPI.Repositorys;
using SuporteAPI.Utils;

namespace SuporteAPI.Service;

public class MessageService : IMessageService
{
    private readonly IUserRepository _userRepository;
    private readonly IMessageRepository _messageRepository;
    private readonly ITicketRepository _ticketRepository;
    private readonly IChatGenerator _chatGenerator;

    
    public MessageService(IMessageRepository messageRepository, IUserRepository userRepository, 
        ITicketRepository ticketRepository, IChatGenerator chatGenerator)
    {
        _ticketRepository = ticketRepository;
        _messageRepository = messageRepository;
        _userRepository = userRepository;
        _chatGenerator = chatGenerator;
    }
    public async Task VerifyConditions(Message message)
    {
        Ticket? ticket = await _ticketRepository.GetTicketById(message.TicketId);
        User? user = await _userRepository.GetUserById(message.UserId);
        
        if (user != null && 
            ticket.UserId == message.UserId)
        {
            throw new SuporteApiException("Usuário inválido para este ticket");
        }

        if (ticket != null &&
            ticket.Status == "Aberto")
        {
            throw new SuporteApiException("Usuário inválido para este ticket");
        }
    }

    public async Task<User?> GetAuthor(Message message)
    {
        return await _userRepository.GetUserById(message.UserId);
    }

    public async Task<Message?> SendMessage(Message message)
    {
        await VerifyConditions(message);

        User? author = await GetAuthor(message);
        
        List<Message> history = await _messageRepository.GetMessagesByTicketId(message.TicketId);
        string botResponse = await _chatGenerator.GenerateChatResponseAsync(message.UserText, author.Username, history);
        message.BotText = botResponse;
        
        Message messageResp = await _messageRepository.InsertMessage(message);
        return messageResp;
    }
    
}