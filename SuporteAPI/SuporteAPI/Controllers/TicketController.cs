using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SuporteAPI.DTO;
using SuporteAPI.Interface;
using SuporteAPI.Interface.Repository;
using SuporteAPI.Interface.Service;
using SuporteAPI.Models;
using SuporteAPI.Utils;

namespace SuporteAPI.Controllers;

[ApiController]
[Route("[controller]")]
public class TicketController: ControllerBase
{
    private readonly ITicketService _ticketService;
    public TicketController(ITicketService ticketService)
    {
        _ticketService = ticketService;
    }
    
    [HttpGet(Name = "GetTickets")]
    public async Task<IActionResult> GetAllTickects()
    {
        return Ok(await _ticketService.GetAllTickets());
    }

    [HttpGet("{id}", Name = "GetTicket")]
    [Authorize]
    public async  Task<IActionResult> GetTickect(int id)
    {
        return Ok(await _ticketService.GetTicketById(id));
    }

    [HttpPost(Name = "PostTicket")]
    [Authorize]
    public async Task<IActionResult> PostTickect([FromBody] TicketCreateDto ticket)
    {
        try
        {
            return Ok(await _ticketService.CreateTicket(ticket, int.Parse(HttpContext.User.Claims
                .FirstOrDefault(c => c.Type == "UserId").Value)));
        }
        catch (Exception ex)
        {
            throw SuporteApiException.HigienizeException(ex);
        }
    }

    [HttpPatch("{id}/finish", Name = "FinishTicket")]
    public async Task<IActionResult> FinishTickect(int id, [FromBody] string solution)
    {
        return Ok(await _ticketService.FinishTicket(id, solution));
    }
    
    [HttpPatch("{id}/changeTec", Name = "ChangeTec")]
    [Authorize]
    public async Task<IActionResult> ChangeTec(int id, [FromBody] int newOwner)
    {
        return Ok(await _ticketService.ChangeTec(id, newOwner));
    }

    [HttpPatch("{id}/addSpec", Name = "AddSpecToTicket")]
    [Authorize]
    public async Task<IActionResult> AddSpec(int id, [FromBody] int specId)
    {
        return Ok(await _ticketService.AddSpec(id, specId));
    }

    [HttpPatch("{id}/removeSpec", Name = "RemoveSpecFromTicket")]
    [Authorize]
    public async Task<IActionResult> RemoveSpec(int id, [FromBody] int specId)
    {
        return Ok(await _ticketService.RemoveSpec(id, specId));
    }
    
    [HttpPatch("{id}/routeTicket", Name = "RouteTicket")]
    [Authorize]
    public async Task<IActionResult> RouteTicket(int id)
    {
        return Ok(await _ticketService.RouteTicket(id));
    }
    
    [HttpGet("{id}/specs", Name = "GetSpecsByTicketId")]
    public async Task<IActionResult> GetSpecsByTicketId(int id)
    {
        var specs = await _ticketService.GetSpecsByTicketId(id);
        return Ok(specs);
    }

    [HttpGet("user/{userId}", Name = "GetTicketsByUserId")]
    [Authorize]
    public async Task<IActionResult> GetTicketsByUserId(int userId)
    {
        var tickets = await _ticketService.GetAllTicketsByUser(userId);
        return Ok(tickets);
    }
}