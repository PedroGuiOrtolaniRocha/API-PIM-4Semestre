using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SuporteAPI.Interface.Service;
using SuporteAPI.Models;
using SuporteAPI.Utils;

namespace SuporteAPI.Controllers;

[ApiController]
[Route("[controller]")]
public class SpecController : ControllerBase
{
    private readonly ISpecService _specService;

    public SpecController(ISpecService specService)
    {
        _specService = specService;
    }

    [HttpGet(Name = "GetSpecs")]
    public async Task<IActionResult> Get()
    {
        return Ok(await _specService.GetAllSpecs());
    }

    [HttpGet("{id}", Name = "GetSpecById")]
    public async Task<IActionResult> GetById(int id)
    {
        var spec = await _specService.GetSpecById(id);
        if (spec == null)
        {
            return NotFound();
        }

        return Ok(spec);
    }

    [HttpPost(Name = "CreateSpec")]
    [Authorize]
    public async Task<IActionResult> Post([FromBody] Spec spec)
    {
        spec.Id = 0;
        try
        {
            var resp = await _specService.CreateSpec(spec);
            return Ok(resp);
        }
        catch (Exception ex)
        {
            throw SuporteApiException.HigienizeException(ex);
        }
    }

    [HttpPatch(Name = "UpdateSpec")]
    [Authorize]
    public async Task<IActionResult> Patch([FromBody] Spec spec)
    {
        try
        {
            Spec? updated = await _specService.UpdateSpec(spec);
            if (updated == null)
            {
                return NotFound();
            }

            return Ok(updated);
        }
        catch (Exception ex)
        {
            throw SuporteApiException.HigienizeException(ex);
        }
    }

    [HttpDelete("{id}",Name = "DeleteSpec")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            bool deleted = await _specService.DeleteSpec(id);
            if (!deleted)
            {
                return NotFound();
            }

            return Ok(deleted);
        }
        catch (Exception ex)
        {
            throw SuporteApiException.HigienizeException(ex);
        }
    }
}