using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SuporteAPI.Models;

[Table("Spec")]
public class Spec
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
}