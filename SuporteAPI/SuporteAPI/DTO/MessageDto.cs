using SuporteAPI.Models;

namespace SuporteAPI.DTO;

public class MessageDto
{
    public DateTime Time { get; set; }
    public string Text { get; set; }
    public int TiketId { get; set; }
    public string AuthorName { get; set; }

    public MessageDto()
    {
    }
    public MessageDto(Message message, User author)
    {
        Time = message.Time;
        if (message.BotText != null)
        {
            Text = message.BotText;
        }
        else
        {
            Text = message.UserText;
        }
        TiketId = message.TicketId;
        AuthorName = author.Username;
    }
}