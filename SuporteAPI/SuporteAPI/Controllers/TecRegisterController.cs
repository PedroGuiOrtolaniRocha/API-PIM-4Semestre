using Microsoft.AspNetCore.Mvc;
using SuporteAPI.Models;
using SuporteAPI.Utils;

namespace SuporteAPI.Controllers;

[ApiController]
[Route("[controller]")]
public class TecRegisterController : ControllerBase
{
    [HttpPost]
    public IActionResult Post([FromBody] TecRegister tec)
    {
        return Ok(tec);
    }
}