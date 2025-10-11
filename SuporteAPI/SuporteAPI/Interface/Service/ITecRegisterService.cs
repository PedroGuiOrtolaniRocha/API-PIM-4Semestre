using SuporteAPI.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SuporteAPI.Interface.Service
{
    public interface ITecRegisterService
    {
        Task<TecRegister?> GetById(int id);
        Task<List<TecRegister>> GetAll();
        Task<TecRegister?> AddTecRegister(TecRegister entity);
        Task<bool> DeleteTecRegister(int id);
        Task<List<TecRegister>> GetByUserId(int userId);
    }
}

