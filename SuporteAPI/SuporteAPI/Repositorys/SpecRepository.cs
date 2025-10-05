using Microsoft.EntityFrameworkCore;
using SuporteAPI.Interface.Repository;
using SuporteAPI.Models;

namespace SuporteAPI.Repositorys;

public class SpecRepository : ISpecRepository
{
    private readonly DbEntity _context;
    
    public SpecRepository(DbEntity context)
    {
        _context = context;
    }
    
    
    public async Task<List<Spec>> GetAllSpecs()
    {
        return await _context.Specs.ToListAsync();
    }

    public async Task<Spec?> GetSpecById(int id)
    {
        return await _context.Specs.FindAsync(id);
    }
    
    public async Task<Spec?> GetSpecByName(string name)
    {
        return await _context.Specs.FirstOrDefaultAsync(x => x.Name == name);
    }

    public async Task<Spec?> CreateSpec(Spec spec)
    {
        var resp = await _context.Specs.AddAsync(spec);
        await _context.SaveChangesAsync();
        
        return resp.Entity;
    }

    public async Task<Spec?> UpdateSpec(Spec spec)
    {
        var existingSpec = await _context.Specs.FindAsync(spec.Id);
        if (existingSpec == null)
        {
            return null;
        }

        existingSpec.Name = spec.Name;
        existingSpec.Description = spec.Description;

        await _context.SaveChangesAsync();
        
        return existingSpec;
    }
}