namespace SuporteAPI.DTO;

public class TicketCreateDto
{
    public string Description { get; set; }
    public string Title { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}