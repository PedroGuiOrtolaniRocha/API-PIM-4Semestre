using SuporteAPI.Interface;
using SuporteAPI.Interfaces;
using SuporteAPI.Models;
using SuporteAPI.Repositorys;

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
    public async Task<bool> VerifyConditions(Message message)
    {
        Ticket? ticket = await _ticketRepository.GetTicketById(message.TicketId);
        User? user = await _userRepository.GetUserById(message.UserId);
        
        if (user != null && 
            ticket != null &&
            ticket.UserId == message.UserId &&
            ticket.Status == "Aberto")
        {
            return true;
        }
        return false;
    }

    public async Task<User?> GetAuthor(Message message)
    {
        return await _userRepository.GetUserById(message.UserId);
    }

    public async Task<Message?> SendMessage(Message message)
    {
        if (!await VerifyConditions(message))
        {
            return null;
        }
        User? author = await GetAuthor(message);
        
        List<Message> history = await _messageRepository.GetMessagesByTicketId(message.TicketId);
        string botResponse = await _chatGenerator.GenerateChatResponseAsync(message.UserText, author.Username, history);
        message.BotText = botResponse;
        
        Message messageResp = await _messageRepository.InsertMessage(message);
        return messageResp;
    }
    
}