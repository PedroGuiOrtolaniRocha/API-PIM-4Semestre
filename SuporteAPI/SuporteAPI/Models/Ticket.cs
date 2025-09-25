namespace SuporteAPI;

public class Ticket
{
    public int? Id { get; }
    public User RequestingUser { get; }
    public TecRegister TecRegister { get; }
    public bool Active { get; }
    public DateTime CreatedAt { get; }
    public DateTime? UpdatedAt { get; }
    public DateTime? FinishedAt { get; }

    public Ticket(int id, User user, TecRegister tecRegister, 
        bool active, DateTime createdAt, DateTime? updatedAt,
        DateTime? finishedAt)
    {
        Id = id;
        RequestingUser = user;
        TecRegister = tecRegister;
        Active = active;
        CreatedAt = createdAt;
        UpdatedAt = updatedAt;
        FinishedAt = finishedAt;
    }
}