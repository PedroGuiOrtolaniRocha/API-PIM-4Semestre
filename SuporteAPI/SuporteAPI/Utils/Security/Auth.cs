using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using SuporteAPI.Models;

namespace SuporteAPI.Utils;

public class Auth
{
    public static string GenerateToken(User user)
    {
        var generator = new JwtSecurityTokenHandler();
        var descriptor = new SecurityTokenDescriptor
        {
            Subject = new System.Security.Claims.ClaimsIdentity(new[]
            {
                new System.Security.Claims.Claim("UserId", user.Id.ToString()),
                new System.Security.Claims.Claim("Email", user.Email),
                new System.Security.Claims.Claim("Role", user.Role)
            }),
            Issuer = Environment.GetEnvironmentVariable("JWT_ISSUER"),
            Audience = Environment.GetEnvironmentVariable("JWT_AUDIENCE"),
            Expires = DateTime.UtcNow.AddHours(2),
            SigningCredentials = new Microsoft.IdentityModel.Tokens.SigningCredentials(
                new SymmetricSecurityKey(
                    System.Text.Encoding.UTF8.GetBytes(
                        Environment.GetEnvironmentVariable("JWT_SECRET_KEY") ?? throw new Exception("JWT secret key not configured"))), 
                SecurityAlgorithms.HmacSha256Signature)
        };
        return generator.WriteToken(generator.CreateToken(descriptor));
    }
}