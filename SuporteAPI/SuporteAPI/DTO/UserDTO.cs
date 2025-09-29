using SuporteAPI.Models;

namespace SuporteAPI.DTO;

public class UserDTO
{
    public string Username { get; }
    public string Email { get; }
    public string Role { get; }

    public UserDTO(User user)
    {
        Username = user.Username;
        Email = user.Email;
        Role = user.Role;
    }

    public static List<UserDTO> ToDTO(List<User> users)
    {
        return users.Select(user => new UserDTO(user)).ToList();
    }
}