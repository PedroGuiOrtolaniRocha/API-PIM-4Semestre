using SuporteAPI.Models;

namespace SuporteAPI.DTO;

public class MessageDTO
{
    public int Id { get; set; }
    public DateTime Time { get; set; }
    public string UserText { get; set; }
    public string BotText { get; set; }
    public int TiketId { get; set; }
    public int AuthorId { get; set; }
    public string AuthorName { get; set; }

    public MessageDTO(Message message, User author)
    {
        Id = message.Id;
        Time = message.Time;
        UserText = message.UserText;
        BotText = message.BotText;
        TiketId = message.TiketId;
        AuthorId = message.AuthorId;
        AuthorName = author.Username;
    }
}