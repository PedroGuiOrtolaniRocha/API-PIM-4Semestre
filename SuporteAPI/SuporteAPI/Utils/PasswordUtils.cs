using System.Security.Cryptography;
using System.Text;

namespace SuporteAPI.Utils;

public class PasswordUtils
{
    public static string ToHash(string password)
    {
        using (SHA3_256  sha256Hash = SHA3_256.Create())
        {
            byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(password));

            StringBuilder builder = new StringBuilder();
            for (int i = 0; i < bytes.Length; i++)
            {
                builder.Append(bytes[i].ToString("x2"));
            }
            return builder.ToString();
        }
    }
}