using OrbeB2B.Crm.Domain.Entities;

namespace OrbeB2B.Crm.Application.Repositories;

public interface IUsuarioWriteRepository
{
    Task<bool> EmailJaCadastradoAsync(string email);
    Task CadastrarUsuarioDaEmpresaAsync(Usuario usuario, EmpresaFuncionario vinculo);
    Task<(Usuario? usuario, EmpresaFuncionario? funcionario)> ObterColaboradorPorIdEEmpresaAsync(Guid usuarioId, Guid empresaId);
    Task AtualizarColaboradorAsync(Usuario usuario, EmpresaFuncionario funcionario);
}