using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SuporteAPI.Utils;

namespace SuporteAPI.Models;

[Table("Ticket")]
public class Ticket
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int? TecUserId { get; set; }
    public string Description { get; set; }
    public string? Resolution { get; set; }
    public string Title { get; set; }
    public string Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}