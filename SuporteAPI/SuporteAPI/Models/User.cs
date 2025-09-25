using System.Text.Json.Serialization;

namespace SuporteAPI;

public class User
{
    public int? Id { get; }
    public string Username { get; }
    public string Email { get; }
    public string PasswordHash { get; }
    
    public User(int?  id, string username, string email, string passwordHash)
    {
        Id = id;
        Username = username;
        Email = email;
        PasswordHash = passwordHash;
    }
}