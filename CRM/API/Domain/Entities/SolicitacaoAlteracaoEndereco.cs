using OrbeB2B.Crm.Domain.Enums;

namespace OrbeB2B.Crm.Domain.Entities;

public class SolicitacaoAlteracaoEndereco
{
    public Guid Id { get; private set; }
    public Guid ClienteId { get; private set; }
    public string Cep { get; private set; }
    public string Uf { get; private set; }
    public string Cidade { get; private set; }
    public string Bairro { get; private set; }
    public string Logradouro { get; private set; }
    public string Numero { get; private set; }
    public string? Complemento { get; private set; }
    public string Motivo { get; private set; }
    public StatusSolicitacao Status { get; private set; }
    public DateTime DataSolicitacao { get; private set; }
    public DateTime? DataAnalise { get; private set; }

    protected SolicitacaoAlteracaoEndereco() { }

    public SolicitacaoAlteracaoEndereco(Guid clienteId, string cep, string uf, string cidade,
                                         string bairro, string logradouro, string numero,
                                         string? complemento, string motivo)
    {
        Id = Guid.NewGuid();
        ClienteId = clienteId;
        Cep = cep;
        Uf = uf;
        Cidade = cidade;
        Bairro = bairro;
        Logradouro = logradouro;
        Numero = numero;
        Complemento = complemento;
        Motivo = motivo;

        Status = StatusSolicitacao.Pendente;
        DataSolicitacao = DateTime.UtcNow;
    }

    public void Aprovar()
    {
        Status = StatusSolicitacao.Aprovada;
        DataAnalise = DateTime.UtcNow;
    }

    public void Recusar()
    {
        Status = StatusSolicitacao.Recusada;
        DataAnalise = DateTime.UtcNow;
    }
}
