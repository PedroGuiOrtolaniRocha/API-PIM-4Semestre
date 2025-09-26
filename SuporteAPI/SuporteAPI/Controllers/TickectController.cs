using Microsoft.AspNetCore.Mvc;
using SuporteAPI.Models;
using SuporteAPI.Utils;

namespace SuporteAPI.Controllers;

[ApiController]
[Route("[controller]")]
public class TickectController: ControllerBase
{
    [HttpGet(Name = "GetTickects")]
    public IActionResult GetAllTickects()
    {
        return Ok();
    }

    [HttpGet("{id}", Name = "GetTickect")]
    public IActionResult GetTickect(int id)
    {
        return Ok();
    }

    [HttpPost(Name = "PostTickect")]
    public IActionResult PostTickect([FromBody] Ticket ticket)
    {
        return Ok();
    }

    [HttpPatch("{id}/finish", Name = "FinishTickect")]
    public IActionResult FinishTickect(int id)
    {
        return Ok();
    }
    
    [HttpPatch("{id}/changeOwner", Name = "ChangeOwner")]
    public IActionResult ChangeOwner(int id,[FromBody] int newOwner)
    {
        return Ok();
    }
}