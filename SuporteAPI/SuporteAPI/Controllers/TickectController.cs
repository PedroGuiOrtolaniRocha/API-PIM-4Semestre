using Microsoft.AspNetCore.Mvc;
using SuporteAPI.Interface;
using SuporteAPI.Interface.Repository;
using SuporteAPI.Interface.Service;
using SuporteAPI.Models;
using SuporteAPI.Utils;

namespace SuporteAPI.Controllers;

[ApiController]
[Route("[controller]")]
public class TickectController: ControllerBase
{
    private readonly ITicketService _ticketService;
    public TickectController(ITicketService ticketService)
    {
        _ticketService = ticketService;
    }
    
    [HttpGet(Name = "GetTickects")]
    public async Task<IActionResult> GetAllTickects()
    {
        return Ok(await _ticketService.GetAllTickets());
    }

    [HttpGet("{id}", Name = "GetTickect")]
    public async  Task<IActionResult> GetTickect(int id)
    {
        return Ok(await _ticketService.GetTicketById(id));
    }

    [HttpPost(Name = "PostTicket")]
    public async Task<IActionResult> PostTickect([FromBody] Ticket ticket)
    {
        try
        {
            return Ok(await _ticketService.CreateTicket(ticket));
        }
        catch (Exception ex)
        {
            throw SuporteApiException.HigienizeException(ex);
        }
    }

    [HttpPatch("{id}/finish", Name = "FinishTicket")]
    public async Task<IActionResult> FinishTickect(int id)
    {
        return Ok(await _ticketService.FinishTicket(id));
    }
    
    [HttpPatch("{id}/changeTec", Name = "ChangeOwner")]
    public async Task<IActionResult> ChangeTec(int id, [FromBody] int newOwner)
    {
        return Ok(await _ticketService.ChangeTec(id, newOwner));
    }

    [HttpPatch("{id}/addSpec", Name = "AddSpecToTicket")]
    public async Task<IActionResult> AddSpec(int id, [FromBody] int specId)
    {
        return Ok(await _ticketService.AddSpec(id, specId));
    }

    [HttpPatch("{id}/removeSpec", Name = "RemoveSpecFromTicket")]
    public async Task<IActionResult> RemoveSpec(int id, [FromBody] int specId)
    {
        return Ok(await _ticketService.RemoveSpec(id, specId));
    }

    [HttpGet("{id}/specs", Name = "GetSpecsByTicketId")]
    public async Task<IActionResult> GetSpecsByTicketId(int id)
    {
        var specs = await _ticketService.GetSpecsByTicketId(id);
        return Ok(specs);
    }
}