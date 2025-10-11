using Microsoft.EntityFrameworkCore;
using SuporteAPI.Interface.Repository;
using SuporteAPI.Interface.Service;
using SuporteAPI.Interface.Utils;
using SuporteAPI.Repositorys;
using SuporteAPI.Service;
using SuporteAPI.Utils;

namespace SuporteAPI;

public class Program
{
    public static void Main(string[] args)

    {
        
        
        var builder = WebApplication.CreateBuilder(args);
        
        Environment.SetEnvironmentVariable("AI_URI",builder.Configuration.GetValue<string>( "AI_URI"));
        Environment.SetEnvironmentVariable("AI_API_KEY", builder.Configuration.GetValue<string>( "AI_API_KEY"));
        
        Console.WriteLine(builder.Configuration.GetValue<string>( "Teste"));

        // Add services to the container.

        builder.Services.AddControllers();
        // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        builder.Services.AddDbContext<DbEntity>(options => options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
        
        builder.Services.AddScoped<IUserRepository, UserRepository>();
        builder.Services.AddScoped<IMessageRepository, MessageRepository>();
        builder.Services.AddScoped<ITicketRepository, TicketRepository>();
        builder.Services.AddScoped<ISpecRepository, SpecRepository>();
        builder.Services.AddScoped<ITicketSpecRelationRepository, TicketSpecRelationRepository>();
        builder.Services.AddScoped<ITecRegisterRepository, TecRegisterRepository>();
        
        builder.Services.AddScoped<IMessageService, MessageService>();
        builder.Services.AddScoped<IUserService, UserService>();
        builder.Services.AddScoped<ISpecService, SpecService>();
        builder.Services.AddScoped<ITicketService, TicketService>();
        
        builder.Services.AddScoped<IChatGenerator, OpenAiChatGenerator>();
        
        var app = builder.Build();

        app.UseMiddleware<Middleware.ExceptionMiddleware>();

        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment())
        {
        }
        app.UseHttpsRedirection();
        app.UseSwagger();
        app.UseSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/swagger/v1/swagger.json", "API do PIM v1");
            c.RoutePrefix = "";
        });

        app.UseAuthorization();

        app.MapControllers();

        app.Run();
        
        
    }
}