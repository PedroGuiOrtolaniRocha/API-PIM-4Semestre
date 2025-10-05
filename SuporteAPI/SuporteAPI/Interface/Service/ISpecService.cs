using SuporteAPI.Models;

namespace SuporteAPI.Interface.Service;

public interface ISpecService
{
    public Task ValidateSpec(Spec spec);
    public Task<List<Spec>> GetAllSpecs();
    public Task<Spec?> GetSpecById(int id);
    public Task<Spec?> GetSpecByName(string name);
    public Task<Spec?> CreateSpec(Spec spec);
    public Task<Spec?> UpdateSpec(Spec spec);
}