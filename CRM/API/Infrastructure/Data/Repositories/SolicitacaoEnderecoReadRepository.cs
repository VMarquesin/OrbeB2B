using Dapper;
using OrbeB2B.Crm.Application.DTOs;
using OrbeB2B.Crm.Application.Data;
using OrbeB2B.Crm.Application.Repositories;
using OrbeB2B.Crm.Domain.Enums;

namespace OrbeB2B.Crm.Infrastructure.Data.Repositories;

public class SolicitacaoEnderecoReadRepository : ISolicitacaoEnderecoReadRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public SolicitacaoEnderecoReadRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<SolicitacaoEnderecoListResponse>> ObterPorStatusAsync(Guid empresaId, StatusSolicitacao? status)
    {
        var sql = @"
            SELECT solicitacoes_alteracao_endereco.id
                  ,solicitacoes_alteracao_endereco.cliente_id
                  ,clientes.nome_fantasia
                  ,solicitacoes_alteracao_endereco.cep
                  ,solicitacoes_alteracao_endereco.uf
                  ,solicitacoes_alteracao_endereco.cidade
                  ,solicitacoes_alteracao_endereco.bairro
                  ,solicitacoes_alteracao_endereco.logradouro
                  ,solicitacoes_alteracao_endereco.numero
                  ,solicitacoes_alteracao_endereco.complemento
                  ,solicitacoes_alteracao_endereco.motivo
                  ,solicitacoes_alteracao_endereco.status
                  ,solicitacoes_alteracao_endereco.data_solicitacao
                  ,solicitacoes_alteracao_endereco.data_analise
            FROM solicitacoes_alteracao_endereco
            INNER JOIN clientes
                ON solicitacoes_alteracao_endereco.cliente_id = clientes.id
            WHERE clientes.empresa_id = @EmpresaId
              AND (@Status IS NULL OR solicitacoes_alteracao_endereco.status = @Status)
            ORDER BY solicitacoes_alteracao_endereco.data_solicitacao DESC";

        using var connection = _connectionFactory.CreateConnection();

        return await connection.QueryAsync<SolicitacaoEnderecoListResponse>(
            sql,
            new { EmpresaId = empresaId, Status = (int?)status }
        );
    }
}
