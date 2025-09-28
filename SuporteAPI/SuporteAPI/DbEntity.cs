using Microsoft.EntityFrameworkCore;
using SuporteAPI.Models;

namespace SuporteAPI;

public class DbEntity : DbContext
{
    public DbSet<User> Users;
    public DbSet<Message> Messages;
    public DbSet<Spec> Specs; 
    public DbSet<TecRegister> TecRegisters;
    public DbSet<Ticket> Tickets;
    public DbSet<TicketSpecRelation> TicketSpecRelations;
    
}