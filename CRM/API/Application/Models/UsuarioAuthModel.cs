namespace OrbeB2B.Crm.Application.Models;

public class UsuarioAuthModel
{
    public Guid Id { get; init; }
    public string Nome { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string SenhaHash { get; init; } = string.Empty;
    public bool EstaAtivo { get; init; }
    public Guid EmpresaId { get; init; }
    public string NomePerfil { get; init; } = string.Empty;
}
