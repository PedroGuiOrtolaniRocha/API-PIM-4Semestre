using SuporteAPI.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SuporteAPI.Interface.Repository
{
    public interface ITecRegisterRepository
    {
        public Task<TecRegister?> GetById(int id);
        public Task<List<TecRegister>> GetAll();
        public Task<TecRegister?> AddTecRegister(TecRegister tecRegister);
        public  Task<bool> DeleteTecRegister(int id);
        public Task<List<TecRegister>> GetByUserId(int userId);
        public Task<List<TecRegister>> GetBySpecListId(List<int> specs);
    }
}

