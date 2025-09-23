namespace SuporteAPI;

public class Message
{
    public DateTime Time { get; }

    public string MessageText { get; }

    public string Author { get; }

    public Message(string author, string messageText)
    {
        Author = author;
        MessageText = messageText;
        Time = DateTime.Now;
    }
}