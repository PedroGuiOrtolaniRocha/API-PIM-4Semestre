using SuporteAPI.Interface.Repository;
using SuporteAPI.Interface.Service;
using SuporteAPI.Models;
using SuporteAPI.Utils;

namespace SuporteAPI.Service;

public class SpecService : ISpecService
{
    private readonly ISpecRepository _specRepository;
    
    public SpecService(ISpecRepository specRepository)
    {
        _specRepository = specRepository;
    }
    
    public async Task ValidateSpec(Spec spec)
    {
        if (string.IsNullOrEmpty(spec.Name) || 
            string.IsNullOrEmpty(spec.Description))
        {
            throw new SuporteApiException("Nome da especificação e descrição são obrigatórios.");
        }
        
        var existingSpec = await _specRepository.GetSpecByName(spec.Name);
        
        if (existingSpec != null && existingSpec.Id != spec.Id)
        {
            throw new SuporteApiException("Já existe uma especificação com esse nome.");
        }
    }
    
    public async Task<List<Spec>> GetAllSpecs()
    {
        return await _specRepository.GetAllSpecs();
    }
    public async Task<Spec?> GetSpecById(int id)
    {
        return await _specRepository.GetSpecById(id);
    }
    
    public async Task<Spec?> GetSpecByName(string name)
    {
        return await _specRepository.GetSpecByName(name);
    }

    public async Task<Spec?> CreateSpec(Spec spec)
    {
        await ValidateSpec(spec);
        return await _specRepository.CreateSpec(spec);
    }
    
    public async Task<Spec?> UpdateSpec(Spec spec)
    {
        return await _specRepository.UpdateSpec(spec);
    }
    
    public async Task<bool> DeleteSpec(int id)
    {
        return await _specRepository.DeleteSpec(id);
    }
}