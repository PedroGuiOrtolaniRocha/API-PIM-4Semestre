using SuporteAPI.Models;

namespace SuporteAPI.Utils;

public class MockUtils
{
    public static User MockUser = new User(0, "teste", "contact@invalid", "senha123");

    public static Message MockMessage = new Message(0, MockUser, "teste");
}