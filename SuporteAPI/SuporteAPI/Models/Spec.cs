using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SuporteAPI.Models;

[Table("Spec")]
public class Spec
{
    [Key]
    int Id { get; set; }
    string Name { get; set; }
    string Description { get; set; }
}