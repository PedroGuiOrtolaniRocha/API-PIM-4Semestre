using Microsoft.AspNetCore.Http;
using System.Net;
using System.Text.Json;
using SuporteAPI.Utils;
using System.Threading.Tasks;

namespace SuporteAPI.Middleware
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;

        public ExceptionMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (SuporteApiException ex)
            {
                context.Response.ContentType = "application/json";
                context.Response.StatusCode = ex.StatusCode > 0 ? ex.StatusCode : (int)HttpStatusCode.BadRequest;
                var result = JsonSerializer.Serialize(new { message = ex.Message, code = context.Response.StatusCode });
                await context.Response.WriteAsync(result);
            }
            catch (Exception ex)
            {
                context.Response.ContentType = "application/json";
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                var result = JsonSerializer.Serialize(new { message = "Erro interno do servidor"});
                await context.Response.WriteAsync(result);
            }
        }
    }
}

