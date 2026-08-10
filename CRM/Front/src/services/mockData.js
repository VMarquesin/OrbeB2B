// ============================================================================
// 1. USUÁRIOS E CONTROLE DE ACESSO (Tabela: usuarios)
// ============================================================================
export const mockUsuarios = [
  {
    id: "usr-01",
    perfil_id: "perf-admin-01",
    nome: "Marcio Admin",
    email: "admin@acaseira.com.br",
    senha_hash: "admin123",
    esta_ativo: true,
    data_criacao: "2026-01-15T08:00:00Z",
    role: "Administrador",
    permissions: ["all"]
  },
  {
    id: "usr-02",
    perfil_id: "perf-operador-01",
    nome: "Jaqueline Silva",
    email: "vendas@acaseira.com.br",
    senha_hash: "vendas123",
    esta_ativo: true,
    data_criacao: "2026-02-10T09:00:00Z",
    role: "Operador",
    permissions: ["dashboard", "pedidos", "clientes", "produtos"]
  }
];

// ============================================================================
// 2. CLIENTES / CRM (Tabela: clientes)
// ============================================================================
export const mockClients = [
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    empresa_id: "emp-01",
    documento: "11.222.333/0001-44",
    nome_ou_razao_social: "Mercadinho da Praça Ltda",
    nome_fantasia: "Mercadinho da Praça",
    tipo_segmento: "B2B",
    cep: "17500-000",
    logradouro: "Rua das Flores",
    numero: "123",
    bairro: "Centro",
    status_cadastro: "ATIVO",
    data_cadastro: "2026-05-28T10:00:00Z",
    ultima_compra: "2026-07-15T10:00:00Z"
  },
  {
    id: "b2c3d4e5-f6a1-8901-bcde-f12345678901",
    empresa_id: "emp-01",
    documento: "55.666.777/0001-88",
    nome_ou_razao_social: "Distribuidora Doce Vida S.A.",
    nome_fantasia: "Doce Vida Atacado",
    tipo_segmento: "B2B",
    cep: "17500-100",
    logradouro: "Av. Brasil",
    numero: "1500",
    bairro: "Distrito Industrial",
    status_cadastro: "EM_RISCO",
    data_cadastro: "2026-06-02T14:30:00Z",
    ultima_compra: "2026-05-01T14:30:00Z"
  },
  {
    id: "c3d4e5f6-a1b2-9012-cdef-123456789012",
    empresa_id: "emp-01",
    documento: "33.444.555/0001-99",
    nome_ou_razao_social: "Supermercado Dois Irmãos ME",
    nome_fantasia: "Dois Irmãos",
    tipo_segmento: "B2B",
    cep: "17600-000",
    logradouro: "Rua Pernambuco",
    numero: "45",
    bairro: "Vila Operária",
    status_cadastro: "ATIVO",
    data_cadastro: "2026-06-10T09:15:00Z",
    ultima_compra: "2026-07-20T09:15:00Z"
  }
];

// ============================================================================
// 3. PRODUTOS (Tabela: produtos)
// ============================================================================
export const mockProducts = [
  {
    id: "p1a2b3c4-e5f6-7890-abcd-ef1234567890",
    empresa_id: "emp-01",
    codigo_comercial: "COD-040",
    descricao: "Paçoca Rolha (Balde 100un)",
    embalagem: "Balde 100un",
    fornecedor_origem: "Fabricação Interna",
    eh_fabricacao_propria: true,
    preco_atacado: 28.00,
    preco_lojista: 31.50,
    preco_varejo: 35.00,
    estoque: 150,
    esta_ativo: true
  },
  {
    id: "p2b3c4d5-f6a1-8901-bcde-f12345678901",
    empresa_id: "emp-01",
    codigo_comercial: "COD-041",
    descricao: "Doce de Leite (Caixa 20un)",
    embalagem: "Caixa 20un",
    fornecedor_origem: "Fabricação Interna",
    eh_fabricacao_propria: true,
    preco_atacado: 38.00,
    preco_lojista: 41.00,
    preco_varejo: 45.00,
    estoque: 80,
    esta_ativo: true
  },
  {
    id: "p3c4d5e6-a1b2-9012-cdef-123456789012",
    empresa_id: "emp-01",
    codigo_comercial: "COD-043",
    descricao: "Cocada Branca (Pote 20un)",
    embalagem: "Pote 20un",
    fornecedor_origem: "Fornecedor Terceirizado S.A.",
    eh_fabricacao_propria: false,
    preco_atacado: 32.00,
    preco_lojista: 36.00,
    preco_varejo: 40.00,
    estoque: 12,
    esta_ativo: true
  }
];

// ============================================================================
// 4. PEDIDOS E ITENS (Tabelas: pedidos e pedido_itens)
// ============================================================================
export const mockOrders = [
  {
    id: "ord-01",
    empresa_id: "emp-01",
    cliente_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    codigo_pedido_formatado: "APP-5512",
    origem: "LandingPage",
    status_logistica: "aguardando_validacao",
    status_erp: "pendente",
    status: "aguardando_validacao", // Estado auxiliar para a UI
    valor_total_pedido: 344.00,
    observacao_negociacao: "Pedido gerado via Landing Page B2B.",
    data_criacao: "2026-07-25T10:00:00Z",
    clienteNome: "Mercadinho da Praça", 
    resumo: "10x Paçoca Rolha, 2x Cocada Branca", 
    itemsDetalhados: [
      { produtoId: "p1a2b3c4-e5f6-7890-abcd-ef1234567890", nome: "Paçoca Rolha (Balde 100un)", quantidade: 10, precoUnitario: 28.00, origem: "proprio", eh_fabricacao_propria: true },
      { produtoId: "p3c4d5e6-a1b2-9012-cdef-123456789012", nome: "Cocada Branca (Pote 20un)", quantidade: 2, precoUnitario: 32.00, origem: "terceiro", eh_fabricacao_propria: false }
    ]
  },
  {
    id: "ord-02",
    empresa_id: "emp-01",
    cliente_id: "c3d4e5f6-a1b2-9012-cdef-123456789012",
    codigo_pedido_formatado: "PED-2041",
    origem: "Manual",
    status_logistica: "preparando",
    status_erp: "aprovado",
    status: "preparando", // Estado auxiliar para a UI
    valor_total_pedido: 384.00,
    observacao_negociacao: "Lançamento manual para lojista.",
    data_criacao: "2026-07-24T14:30:00Z",
    clienteNome: "Supermercado Dois Irmãos", 
    resumo: "12x Cocada Branca", 
    itemsDetalhados: [
      { produtoId: "p3c4d5e6-a1b2-9012-cdef-123456789012", nome: "Cocada Branca (Pote 20un)", quantidade: 12, precoUnitario: 32.00, origem: "terceiro", eh_fabricacao_propria: false }
    ]
  },
  {
    id: "ord-03",
    empresa_id: "emp-01",
    cliente_id: "b2c3d4e5-f6a1-8901-bcde-f12345678901",
    codigo_pedido_formatado: "APP-1204",
    origem: "LandingPage",
    status_logistica: "entregue",
    status_erp: "concluido",
    status: "concluido", // Estado auxiliar para a UI
    valor_total_pedido: 1450.00,
    observacao_negociacao: "Pedido concluído e entregue.",
    data_criacao: "2026-06-18T09:30:00Z",
    clienteNome: "Doce Vida Atacado", 
    resumo: "20x Paçoca Rolha, 15x Doce de Leite", 
    itemsDetalhados: [
      { produtoId: "p1a2b3c4-e5f6-7890-abcd-ef1234567890", nome: "Paçoca Rolha (Balde 100un)", quantidade: 20, precoUnitario: 50.00, origem: "proprio", eh_fabricacao_propria: true },
      { produtoId: "p2b3c4d5-f6a1-8901-bcde-f12345678901", nome: "Doce de Leite (Caixa 20un)", quantidade: 15, precoUnitario: 30.00, origem: "proprio", eh_fabricacao_propria: true }
    ]
  }
];