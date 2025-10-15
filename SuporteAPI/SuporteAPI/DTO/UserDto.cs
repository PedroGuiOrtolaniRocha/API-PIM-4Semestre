using SuporteAPI.Models;

namespace SuporteAPI.DTO;

public class UserDto
{
    public string Username { get; }
    public string Email { get; }
    public string Role { get; }

    public UserDto(User user)
    {
        Username = user.Username;
        Email = user.Email;
        Role = user.Role;
    }

    public static List<UserDto> ToDto(List<User> users)
    {
        return users.Select(user => new UserDto(user)).ToList();
    }
}