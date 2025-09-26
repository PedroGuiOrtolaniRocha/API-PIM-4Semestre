namespace SuporteAPI.Models;

public class TicketSpecRelation
{
    public int? Id { get; }
    public Spec Spec { get; }
    public Ticket Ticket { get; }
    
    public TicketSpecRelation(Spec spec, Ticket ticket)
        {
            
            Spec = spec;
            Ticket = ticket;
        }
}