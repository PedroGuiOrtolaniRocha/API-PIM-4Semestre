using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SuporteAPI.Models;

[Table("TecRegister")]
public class TecRegister
{
    public int Id { get; set; }
    public int SpecId { get; set; }
    public int UserId { get; set; }
}