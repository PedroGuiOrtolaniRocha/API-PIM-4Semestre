namespace SuporteAPI;

public class User
{
    public int Id { get; }
    public string Username { get; }
    public string Email { get; }
    public string PasswordHash { get; }

    public User(int  id, string username, string email, string password)
    {
        Id = id;
        Username = username;
        Email = email;
        PasswordHash = password;
    }
}