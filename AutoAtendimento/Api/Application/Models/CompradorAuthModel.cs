namespace OrbeB2B.AutoAtendimento.Application.Models;

public class CompradorAuthModel
{
    public Guid Id { get; init; }
    public string Nome { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string SenhaHash { get; init; } = string.Empty;
    public bool EstaAtivo { get; init; }
    public Guid ClienteId { get; init; }
    public Guid EmpresaId { get; init; }
    public string NomeCliente { get; init; } = string.Empty;
}
