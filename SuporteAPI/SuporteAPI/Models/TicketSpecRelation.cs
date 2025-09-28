using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SuporteAPI.Models;

[Table("TicketSpecRelation")]
public class TicketSpecRelation
{
    [Key]
    public int Id { get; set; }
    public int SpecId { get; set; }
    public int TicketId { get; set; }
    
}