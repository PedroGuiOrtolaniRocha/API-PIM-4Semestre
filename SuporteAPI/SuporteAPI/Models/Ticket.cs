using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SuporteAPI.Models;

[Table("Ticket")]
public class Ticket
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int TecUserId { get; set; }
    public string Description { get; set; }
    public string Title { get; set; }
    public String Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}