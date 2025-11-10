using SuporteAPI.Models;

namespace SuporteAPI.Interface.Repository;

public interface ISpecRepository
{
    public Task<List<Spec>> GetAllSpecs();
    public Task<Spec?> GetSpecById(int id);
    public Task<Spec?> GetSpecByName(string name);
    public Task<Spec?> CreateSpec(Spec spec);
    public Task<Spec?> UpdateSpec(Spec spec);
    public Task<bool> DeleteSpec(int id);
}