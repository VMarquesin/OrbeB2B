using System;

namespace OrbeB2B.Crm.Domain.Entities;

public class Empresa
{
    // Propriedades com Private Set (Blindagem de estado)
    public Guid Id { get; private set; }
    public Guid CidadeId { get; private set; }
    public string Cnpj { get; private set; }
    public string RazaoSocial { get; private set; }
    public string NomeFantasia { get; private set; }
    public string Cep { get; private set; }
    public string Logradouro { get; private set; }
    public string Numero { get; private set; }
    public string Bairro { get; private set; }
    public bool EstaAtiva { get; private set; }
    
    // timestamptz no Postgres = DateTime no C# (Sempre UTC)
    public DateTime DataCadastro { get; private set; } 

    // Construtor vazio exigido pelo Entity Framework Core (Protected para ninguém usar fora do EF)
    protected Empresa() { }

    // Construtor Rico (Obrigatório passar os dados vitais na criação)
    public Empresa(Guid cidadeId, string cnpj, string razaoSocial, string nomeFantasia, string cep, string logradouro, string numero, string bairro)
    {
        Id = Guid.NewGuid(); // Gera o UUID nativamente no código
        CidadeId = cidadeId;
        Cnpj = cnpj;
        RazaoSocial = razaoSocial;
        NomeFantasia = nomeFantasia;
        Cep = cep;
        Logradouro = logradouro;
        Numero = numero;
        Bairro = bairro;
        
        EstaAtiva = true; // Regra de negócio: toda empresa nasce ativa
        DataCadastro = DateTime.UtcNow; // Salva no fuso horário universal (combina com o timestamptz)
    }

    // Comportamentos do Domínio (Métodos de alteração controlada)
    public void Inativar()
    {
        EstaAtiva = false;
    }

    public void AtualizarEndereco(Guid novaCidadeId, string cep, string logradouro, string numero, string bairro)
    {
        // Aqui poderiam entrar regras de validação (ex: CEP não pode ser vazio)
        CidadeId = novaCidadeId;
        Cep = cep;
        Logradouro = logradouro;
        Numero = numero;
        Bairro = bairro;
    }
}