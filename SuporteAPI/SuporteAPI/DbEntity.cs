using Microsoft.EntityFrameworkCore;
using SuporteAPI.Models;

namespace SuporteAPI;

public class DbEntity : DbContext 
{
    public DbSet<User> Users {get; set;}
    public DbSet<Message> Messages {get; set;}
    public DbSet<Spec> Specs {get; set;}
    public DbSet<TecRegister> TecRegisters {get; set;}
    public DbSet<Ticket> Tickets {get; set;}
    public DbSet<TicketSpecRelation> TicketSpecRelations {get; set;}

    public DbEntity(DbContextOptions<DbEntity> options) : base(options)
    {
        
    }
}