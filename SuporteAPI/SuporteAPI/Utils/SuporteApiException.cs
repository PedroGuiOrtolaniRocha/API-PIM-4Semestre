namespace SuporteAPI.Utils;

public class SuporteApiException : Exception
{
    public int StatusCode { get; set; }

    public SuporteApiException(string message, int statusCode = 400) : base(message)
    {
        StatusCode = statusCode;
    }
    
}