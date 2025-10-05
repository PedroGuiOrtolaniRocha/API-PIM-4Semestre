namespace SuporteAPI.Utils;

public class SuporteApiException : Exception
{
    public int StatusCode { get; set; }

    public SuporteApiException(string message, int statusCode = 400) : base(message)
    {
        StatusCode = statusCode;
    }

    public static SuporteApiException HigienizeException(Exception ex)
    {
        if (ex.GetType() == typeof(SuporteApiException))
        {
            return new SuporteApiException(ex.Message);
        }
        return new SuporteApiException("Ocorreu um erro inesperado no servidor.", 500);
    }
    
}