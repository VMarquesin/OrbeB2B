namespace OrbeB2B.AutoAtendimento.Application.DTOs;

public record LoginClienteResponse(
    string Token,
    Guid UsuarioId,
    string Nome,
    Guid ClienteId,
    string NomeCliente,
    Guid EmpresaId
);
