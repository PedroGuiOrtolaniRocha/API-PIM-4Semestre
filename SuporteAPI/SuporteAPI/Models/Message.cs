namespace SuporteAPI;

public class Message
{
    public int? Id { get; }
    public DateTime Time { get; }
    public string MessageText { get; }
    public User Author { get; }

    public Message(int? id, User author, string messageText)
    {
        Id = id;
        Author = author;
        MessageText = messageText;
        Time = DateTime.Now;
    }
}