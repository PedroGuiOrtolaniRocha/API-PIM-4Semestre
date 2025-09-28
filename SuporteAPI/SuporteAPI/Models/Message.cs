using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SuporteAPI.Models;

[Table("Message")]
public class Message
{   
    [Key]
    public int Id { get; set; }
    public DateTime Time { get; set; }
    public string UserText { get; set; }
    public string BotText { get; set; }

    public int AuthorId { get; set; }
}