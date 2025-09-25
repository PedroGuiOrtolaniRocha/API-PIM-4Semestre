namespace SuporteAPI;

public class Spec
{
    int Id { get; }
    string Name { get; }
    string Description { get; }

    public Spec(int id, string name, string description)
    {
        Id = id;
        Name = name;
        Description = description;
    }
}