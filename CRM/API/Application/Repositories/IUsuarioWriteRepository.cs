using OrbeB2B.Crm.Domain.Entities;

namespace OrbeB2B.Crm.Application.Repositories;

public interface IUsuarioWriteRepository
{
    Task<bool> EmailJaCadastradoAsync(string email);

    Task CadastrarUsuarioDaEmpresaAsync(Usuario usuario, EmpresaFuncionario vinculo);
}