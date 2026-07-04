using System;

namespace OrbeB2B.Crm.Domain.Entities;

public class EmpresaFuncionario
{
    public Guid Id { get; private set; }
    public Guid EmpresaId { get; private set; }
    public Guid UsuarioId { get; private set; }
    public string Cargo { get; private set; }
    public string Departamento { get; private set; }
    public DateTime DataAdmissao { get; private set; }

    protected EmpresaFuncionario() { }

    public EmpresaFuncionario(Guid empresaId, Guid usuarioId, string cargo, string departamento)
    {
        Id = Guid.NewGuid();
        EmpresaId = empresaId;
        UsuarioId = usuarioId;
        Cargo = cargo;
        Departamento = departamento;
        
        DataAdmissao = DateTime.UtcNow;
    }
}
