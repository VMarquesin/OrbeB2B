using System;
using OrbeB2B.Crm.Domain.Enums;

namespace OrbeB2B.Crm.Domain.Entities;

public class Cliente
{
    public Guid Id { get; private set; }
    public Guid EmpresaId { get; private set; }
    public Guid CidadeId { get; private set; }
    public string Documento { get; private set; }
    public string NomeOuRazaoSocial { get; private set; }
    public string NomeFantasia { get; private set; }
    public TipoSegmentoCliente TipoSegmento { get; private set; }
    public string Cep { get; private set; }
    public string Logradouro { get; private set; }
    public string Numero { get; private set; }
    public string Bairro { get; private set; }
    public StatusCadastroCliente StatusCadastro { get; private set; }
    public DateTime DataCadastro { get; private set; }

    protected Cliente() { }

    public Cliente(Guid empresaId, Guid cidadeId, string documento, string nomeOuRazaoSocial, string nomeFantasia, TipoSegmentoCliente tipoSegmento, string cep, string logradouro, string numero, string bairro)
    {
        Id = Guid.NewGuid();
        EmpresaId = empresaId;
        CidadeId = cidadeId;
        Documento = documento;
        NomeOuRazaoSocial = nomeOuRazaoSocial;
        NomeFantasia = nomeFantasia;
        TipoSegmento = tipoSegmento;
        Cep = cep;
        Logradouro = logradouro;
        Numero = numero;
        Bairro = bairro;
        
        StatusCadastro = StatusCadastroCliente.Pendente;
        DataCadastro = DateTime.UtcNow;
    }
}
