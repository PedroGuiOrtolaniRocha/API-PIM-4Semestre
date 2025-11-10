using SuporteAPI.Models;

namespace SuporteAPI.DTO;

public class UserDto
{
    public int Id { get; set; }
    public string Username { get; set; }
    public string Email { get; set; }
    public string Role { get; set; }

    public UserDto(User user)
    {
        Username = user.Username;
        Email = user.Email;
        Role = user.Role;
        Id = user.Id;
    }

    public UserDto()
    {
    }
    
    public static List<UserDto> ToDto(List<User> users)
    {
        return users.Select(user => new UserDto(user)).ToList();
    }
}