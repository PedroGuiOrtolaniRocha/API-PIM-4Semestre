using SuporteAPI.Interface.Repository;
using SuporteAPI.Interface.Service;
using SuporteAPI.Models;
using SuporteAPI.Utils;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SuporteAPI.Service
{
    public class TecRegisterService : ITecRegisterService
    {
        private readonly ITecRegisterRepository _tecRegisterRepository;
        private readonly IUserRepository _userRepository;
        private readonly ISpecRepository _specRepository;
        public TecRegisterService(ITecRegisterRepository tecRegisterRepository, IUserRepository userRepository, ISpecRepository specRepository)
        {
            _tecRegisterRepository = tecRegisterRepository;
            _userRepository = userRepository;
            _specRepository = specRepository;
        }

        public async Task<TecRegister?> GetById(int id)
        {
            return await _tecRegisterRepository.GetById(id);
        }

        public async Task<List<TecRegister>> GetAll()
        {
            return await _tecRegisterRepository.GetAll();
        }

        public async Task<TecRegister?> AddTecRegister(TecRegister entity)
        {
            var user = await _userRepository.GetUserById(entity.UserId);
            if (user == null)
            {
                throw new SuporteApiException($"Usuário com Id {entity.UserId} não existe.", 404);
            }
            var spec = await _specRepository.GetSpecById(entity.SpecId);
            if (spec == null)
            {
                throw new SuporteApiException($"Especialidade com Id {entity.SpecId} não existe.", 404);
            }
            return await _tecRegisterRepository.AddTecRegister(entity);
        }

        public async Task<bool> DeleteTecRegister(int id)
        {
            return await _tecRegisterRepository.DeleteTecRegister(id);
        }

        public async Task<List<TecRegister>> GetByUserId(int userId)
        {
            return await _tecRegisterRepository.GetByUserId(userId);
        }
    }
}
