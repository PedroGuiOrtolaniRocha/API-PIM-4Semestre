using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SuporteAPI.Models;

[Table("TecResgister")]
public class TecRegister
{
    [Key]
    public int Id { get; set; }
    public int SpecId { get; set; }
    public int UserId { get; set; }
}