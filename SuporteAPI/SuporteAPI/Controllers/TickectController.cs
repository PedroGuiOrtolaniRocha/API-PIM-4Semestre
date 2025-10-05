using Microsoft.AspNetCore.Mvc;
using SuporteAPI.Interface;
using SuporteAPI.Interface.Repository;
using SuporteAPI.Models;
using SuporteAPI.Utils;

namespace SuporteAPI.Controllers;

[ApiController]
[Route("[controller]")]
public class TickectController: ControllerBase
{
    private readonly ITicketRepository _ticketRepository;
    public TickectController(ITicketRepository ticketRepository)
    {
        _ticketRepository = ticketRepository;
    }
    
    [HttpGet(Name = "GetTickects")]
    public async Task<IActionResult> GetAllTickects()
    {
        return Ok(await _ticketRepository.GetAllTickets());
    }

    [HttpGet("{id}", Name = "GetTickect")]
    public async  Task<IActionResult> GetTickect(int id)
    {
        return Ok(await _ticketRepository.GetTicketById(id));
    }

    [HttpPost(Name = "PostTicket")]
    public async Task<IActionResult> PostTickect([FromBody] Ticket ticket)
    {
        ticket.Id = 0;
        try
        {
            return Ok(await _ticketRepository.CreateTicket(ticket));
        }
        catch (Exception ex)
        {
            throw SuporteApiException.HigienizeException(ex);
        }
    }

    [HttpPatch("{id}/finish", Name = "FinishTicket")]
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