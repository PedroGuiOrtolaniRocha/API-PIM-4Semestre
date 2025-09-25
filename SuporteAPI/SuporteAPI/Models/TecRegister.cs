namespace SuporteAPI;

public class TecRegister
{
    public int Id { get; }
    public Spec Spec { get; }
    public User User { get; }
    
    public TecRegister(int id, Spec spec, User user)
    {
        Id = id;
        Spec = spec;
        User = user;
    }
}