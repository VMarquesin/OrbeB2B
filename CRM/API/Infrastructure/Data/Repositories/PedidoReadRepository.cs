using Dapper;
using OrbeB2B.Crm.Application.Data;
using OrbeB2B.Crm.Application.DTOs;
using OrbeB2B.Crm.Application.Repositories;

namespace OrbeB2B.Crm.Infrastructure.Data.Repositories;

public class PedidoReadRepository : IPedidoReadRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public PedidoReadRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<PedidoResumoListResponse>> ObterTodosPorEmpresaAsync(Guid empresaId)
    {
        var sql = @"
            SELECT p.id
                  ,p.cliente_id  
                  ,p.codigo_pedido_formatado
                  ,COALESCE(c.nome_ou_razao_social, 'Consumidor Final') AS nome_cliente
                  ,p.valor_total_pedido
                  ,p.status_logistica                                   AS status_logistica_int
                  ,p.origem
                  ,p.data_criacao
            FROM pedidos p
            LEFT JOIN clientes c
                ON p.cliente_id = c.id
            WHERE p.empresa_id = @EmpresaId
            ORDER BY p.data_criacao DESC";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<PedidoResumoListResponse>(sql, new { EmpresaId = empresaId });
    }

    public async Task<PedidoDetalheResponse?> ObterDetalhePorIdAsync(Guid id, Guid empresaId)
    {
        // Consulta 1: cabeçalho do pedido + dados da empresa + dados do cliente + cidade/UF
        var sqlCabecalho = @"
            SELECT p.id
                ,p.cliente_id
                ,p.codigo_pedido_formatado

                ,COALESCE(c.nome_ou_razao_social, 'Consumidor Final') AS nome_cliente
                ,COALESCE(c.nome_fantasia, '') AS nome_fantasia_cliente
                ,COALESCE(c.documento, '') AS documento_cliente
                ,COALESCE(c.cep, '') AS cep_cliente
                ,COALESCE(c.logradouro, '') AS logradouro_cliente
                ,COALESCE(c.numero, '') AS numero_cliente
                ,COALESCE(c.bairro, '') AS bairro_cliente
                ,COALESCE(cidade_cliente.nome, '') AS cidade_cliente
                ,COALESCE(estado_cliente.sigla, '') AS uf_cliente

                ,COALESCE(e.razao_social, '') AS razao_social_empresa
                ,COALESCE(e.nome_fantasia, '') AS nome_fantasia_empresa
                ,COALESCE(e.cnpj, '') AS cnpj_empresa
                ,COALESCE(e.cep, '') AS cep_empresa
                ,COALESCE(e.logradouro, '') AS logradouro_empresa
                ,COALESCE(e.numero, '') AS numero_empresa
                ,COALESCE(e.bairro, '') AS bairro_empresa
                ,COALESCE(cidade_empresa.nome, '') AS cidade_empresa
                ,COALESCE(estado_empresa.sigla, '') AS uf_empresa

                ,p.origem
                ,p.observacao_negociacao
                ,p.valor_total_pedido
                ,p.status_logistica AS status_logistica_int
                ,p.data_criacao

            FROM pedidos p

            LEFT JOIN clientes c
                ON p.cliente_id = c.id

            LEFT JOIN cidades cidade_cliente
                ON c.cidade_id = cidade_cliente.id

            LEFT JOIN estados estado_cliente
                ON cidade_cliente.estado_id = estado_cliente.id

            LEFT JOIN empresas e
                ON p.empresa_id = e.id

            LEFT JOIN cidades cidade_empresa
                ON e.cidade_id = cidade_empresa.id

            LEFT JOIN estados estado_empresa
                ON cidade_empresa.estado_id = estado_empresa.id

            WHERE p.id = @Id
            AND p.empresa_id = @EmpresaId";

        // Consulta 2: itens do pedido + dados do produto
        var sqlItens = @"
            SELECT pi.id
                ,pi.produto_id
                ,COALESCE(pr.descricao, 'Produto Desconhecido') AS nome_produto
                ,COALESCE(pr.codigo_comercial, '') AS codigo_comercial
                ,COALESCE(pr.embalagem, '') AS embalagem
                ,pi.quantidade_solicitada AS quantidade
                ,pi.preco_unitario_aplicado AS preco_unitario
                ,pi.eh_fabricacao_propria_snapshot AS eh_fabricacao_propria

            FROM pedido_itens pi

            LEFT JOIN produtos pr
                ON pi.produto_id = pr.id

            WHERE pi.pedido_id = @Id";

        using var connection = _connectionFactory.CreateConnection();

        var pedido = await connection.QueryFirstOrDefaultAsync<PedidoDetalheResponse>(
            sqlCabecalho,
            new
            {
                Id = id,
                EmpresaId = empresaId
            });

        if (pedido is null)
            return null;

        var itens = await connection.QueryAsync<PedidoItemDetalheResponse>(
            sqlItens,
            new { Id = id });

        pedido.Itens.AddRange(itens);

        return pedido;
        }
    }