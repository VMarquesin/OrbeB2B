using System;

namespace OrbeB2B.Crm.Domain.Entities;

public class Usuario
{
    public Guid Id { get; private set; }
    public Guid PerfilId { get; private set; }
    public string Nome { get; private set; }
    public string Email { get; private set; }
    public string SenhaHash { get; private set; }
    public bool EstaAtivo { get; private set; }
    public DateTime DataCriacao { get; private set; }
    public Guid? ClienteId { get; private set; }

    protected Usuario() { }

    public Usuario(Guid perfilId, string nome, string email, string senhaHash, Guid? clienteId = null)
    {
        Id = Guid.NewGuid();
        PerfilId = perfilId;
        Nome = nome;
        Email = email;
        SenhaHash = senhaHash;
        ClienteId = clienteId;
        
        EstaAtivo = true;
        DataCriacao = DateTime.UtcNow;
    }

    public void Inativar()
    {
        EstaAtivo = false;
    }

    public void Ativar()
    {
        EstaAtivo = true;
    }
}
