using SuporteAPI.Interface.Repository;
using SuporteAPI.Interface.Service;
using SuporteAPI.Models;
using SuporteAPI.Utils;

namespace SuporteAPI.Service;

public class TicketService : ITicketService
{
    private readonly IUserRepository _userRepository;
    private readonly ITicketRepository _ticketRepository;
    private readonly ITecRegisterRepository _registerRepository;
    private readonly ITicketSpecRelationRepository _ticketSpecRelationRepository;

    public TicketService(IUserRepository userRepository, ITicketRepository ticketRepository, 
        ITecRegisterRepository registerRepository, ITicketSpecRelationRepository ticketSpecRelationRepository)
    {
        _ticketRepository = ticketRepository;
        _userRepository = userRepository;
        _ticketSpecRelationRepository = ticketSpecRelationRepository;
        _registerRepository = registerRepository;
    }
    
    public async Task<Ticket> CreateTicket(Ticket ticket)
    {
        if (await _userRepository.GetUserById(ticket.UserId) == null)
        {
            throw new SuporteApiException("Usuário não encontrado", 404);
        }
        
        ticket.Status = TicketStatus.Aberto.ToString();
        ticket.CreatedAt = DateTime.Now;
        var resp = await _ticketRepository.CreateTicket(ticket);
        
        if (resp == null)
        {
            throw new SuporteApiException("Erro ao criar ticket");
        }
        return resp;
    }
    
    public async Task<List<Ticket>> GetAllTicketsByUser(int userId)
    {
        if (await _userRepository.GetUserById(userId) == null)
        {
            throw new SuporteApiException("Usuário não encontrado", 404);
        }
        
        return await _ticketRepository.GetAllTicketsByUser(userId);
    }
    
    public async Task<List<Ticket>> GetAllTickets()
    {
        return await _ticketRepository.GetAllTickets();
    }
    
    public async Task<Ticket?> GetTicketById(int id)
    {
        return await _ticketRepository.GetTicketById(id);
    }
    
    public async Task<Ticket> FinishTicket(int id)
    {
        Ticket? ticket = await _ticketRepository.GetTicketById(id);
        
        if (ticket == null)
        {
            throw new SuporteApiException("Ticket não encontrado", 404);
        }

        if (ticket.Status == TicketStatus.Fechado.ToString())
        {
            throw new SuporteApiException("Ticket já está encerrado");
        }
        
        ticket.Status = TicketStatus.Fechado.ToString();
        ticket.UpdatedAt = DateTime.Now;
        
        var resp = await _ticketRepository.UpdateTicket(ticket);
        
        if (resp == null)
        {
            throw new SuporteApiException("Erro ao encerrar ticket");
        }
        
        return resp;
    }

    public async Task<Ticket> ChangeTec(int ticketId, int newOwnerId)
    {
        await ValidateTecForTicket(newOwnerId, ticketId);
        Ticket? ticket = await _ticketRepository.GetTicketById(ticketId);
        ticket.TecUserId = newOwnerId;
        var resp = await _ticketRepository.UpdateTicket(ticket);
        return resp;
    }
    
    public async Task<bool> AddSpec(int ticketId, int specId)
    {
        List<TicketSpecRelation> specs = await _ticketSpecRelationRepository.GetByTicketId(ticketId);

        if (specs.Any(x => x.SpecId == specId))
        {
            throw new SuporteApiException("Especialidade já adicionada ao ticket");
        }
        
        TicketSpecRelation relation = new TicketSpecRelation
        {
            TicketId = ticketId,
            SpecId = specId
        };
        var resp = await _ticketSpecRelationRepository.AddRelation(relation);
        return resp != null;
    }
    
    public async Task<bool> RemoveSpec(int ticketId, int specId)
    {
        List<TicketSpecRelation> specs = await _ticketSpecRelationRepository.GetByTicketId(ticketId);
        TicketSpecRelation? relation = specs.FirstOrDefault(x => x.SpecId == specId);

        if (relation == null)
        {
            throw new SuporteApiException("Especialidade não encontrada no ticket");
        }
        
        return await _ticketSpecRelationRepository.DeleteRelation(relation.Id);
    }
    
    public async Task ValidateTecForTicket(int tecId, int ticketId)
    {
        if (await _userRepository.GetUserById(tecId) == null)
        {
            throw new SuporteApiException("Novo técnico não encontrado", 404);
        }

        if (await _ticketRepository.GetTicketById(ticketId) == null)
        {
            throw new SuporteApiException("Ticket não encontrado", 404);
        }
        
        List<TecRegister> tecs = await _registerRepository.GetByUserId(tecId);
        List<TicketSpecRelation> specs = await _ticketSpecRelationRepository.GetByTicketId(ticketId);
        bool hasMatch = false;
        
        if (tecs.Count == 0)
        {
            throw new SuporteApiException("Usuário não é um técnico", 400);
        }
        
        if (specs.Count == 0)
        {
            throw new SuporteApiException("Ticket não possui especialidades", 400);
        }

        foreach (TecRegister tec in tecs)
        {
            if (specs.Any(x => x.SpecId == tec.SpecId))
            {
                hasMatch = true;
                break;
            }
        }

        if (!hasMatch)
        {
            throw new SuporteApiException("Técnico não possui as especialidades necessárias para o ticket", 400);
        }
    }

    public async Task<List<Spec>> GetSpecsByTicketId(int ticketId)
    {
        return await _ticketRepository.GetSpecsByTicketId(ticketId);
    }
}