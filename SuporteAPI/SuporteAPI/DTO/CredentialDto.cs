using System.ComponentModel.DataAnnotations;

namespace SuporteAPI.DTO;

public class CredentialDto
{
    public required string Email { get; set; }
    public required string Password { get; set; }
}