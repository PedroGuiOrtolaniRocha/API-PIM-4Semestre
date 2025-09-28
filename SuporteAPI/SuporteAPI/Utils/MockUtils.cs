using SuporteAPI.Models;

namespace SuporteAPI.Utils;

public class MockUtils
{
    public static User MockUser = new()
    {
        Email = "teste@teste",
        PasswordHash = "123",
        Id = 0,
        Username = "teste"
    };

    public static Message MockMessage = new()
    {
        AuthorId = 0,
        Id = 0,
        UserText = "testando testando 123",
        BotText = "Resposta teste",
        Time = DateTime.Now
    };
}