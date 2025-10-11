using Microsoft.AspNetCore.Mvc;
using SuporteAPI.Interface.Service;
using SuporteAPI.Models;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace SuporteAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class TecRegisterController : ControllerBase
    {
        private readonly ITecRegisterService _tecRegisterService;
        public TecRegisterController(ITecRegisterService tecRegisterService)
        {
            _tecRegisterService = tecRegisterService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _tecRegisterService.GetById(id);
            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _tecRegisterService.GetAll();
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> AddTecRegister([FromBody] TecRegister entity)
        {
            var result = await _tecRegisterService.AddTecRegister(entity);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTecRegister(int id)
        {
            var result = await _tecRegisterService.DeleteTecRegister(id);
            return Ok(result);
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetByUserId(int userId)
        {
            var result = await _tecRegisterService.GetByUserId(userId);
            return Ok(result);
        }
    }
}

