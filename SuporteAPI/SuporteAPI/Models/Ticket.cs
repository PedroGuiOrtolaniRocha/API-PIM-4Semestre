using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SuporteAPI.Models;

[Table("Ticket")]
public class Ticket
{
    [Key]
    public int Id { get; set; }
    public int UserId { get; set; }
    public int TecRegisterId { get; set; }
    public bool Active { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? FinishedAt { get; set; }
}