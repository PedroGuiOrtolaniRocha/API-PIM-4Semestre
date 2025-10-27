using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
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
        
        string? secretKey = builder.Configuration.GetValue<string?>("JWT:SECRET_KEY");
        string? issuer = builder.Configuration.GetValue<string?>("JWT:Issuer");
        string? audience = builder.Configuration.GetValue<string?>("JWT:Audience");

        
        Environment.SetEnvironmentVariable("JWT_SECRET_KEY", secretKey);
        Environment.SetEnvironmentVariable("JWT_ISSUER", issuer);
        Environment.SetEnvironmentVariable("JWT_AUDIENCE", audience);
        Environment.SetEnvironmentVariable("AI_URI",builder.Configuration.GetValue<string>( "AI_URI"));
        Environment.SetEnvironmentVariable("AI_API_KEY", builder.Configuration.GetValue<string>( "AI_API_KEY"));
        
        // Add services to the container.

        builder.Services.AddControllers();
        // Add CORS policy to allow requests from any origin (used for local/dev and containers)
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowAll", policy =>
            {
                policy.AllowAnyOrigin()
                      .AllowAnyMethod()
                      .AllowAnyHeader();
            });
        });
        // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen(options =>
        {
            options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
                    Scheme = "Bearer",
                    BearerFormat = "JWT",
                    In = Microsoft.OpenApi.Models.ParameterLocation.Header,
                    Description = "JWT Authorization header using the Bearer scheme. \r\n\r\n Enter 'Bearer' [space] and then your token in the text input below.\r\n\r\nExample: \"Bearer 12345abcdef\""
                }
            );
            options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
            {
                {
                    new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                    {
                        Reference = new Microsoft.OpenApi.Models.OpenApiReference
                        {
                            Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                    new string[] {}
                }
            });
        });

        
        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateLifetime = true,
                    ValidateAudience = true,
                    ValidateIssuerSigningKey = true,
                    ValidAudience = audience,
                    ValidIssuer = issuer,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey ?? throw new Exception("JWT secret key not configured")))
                };
            });
        
       
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
        builder.Services.AddScoped<ITecRegisterService, TecRegisterService>();
        
        builder.Services.AddScoped<IChatGenerator, OpenAiChatGenerator>();
        
        var app = builder.Build();

        app.UseMiddleware<Middleware.ExceptionMiddleware>();

        // Enable CORS (must be before authentication/authorization and before MapControllers)
        app.UseCors("AllowAll");

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

        app.UseAuthentication();
        app.UseAuthorization();
        
        app.MapControllers();

        app.Run();
        
        
    }
}