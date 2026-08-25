import api from './api';

/**
 * Normaliza o erro do Axios para um formato consistente.
 * A API CRM pode retornar RFC 7807 (detail) ou { mensagem }.
 */
function normalizarErro(error) {
  const data = error?.response?.data;
  const mensagem =
    data?.detail ||
    data?.mensagem ||
    data?.title ||
    error?.message ||
    'Ocorreu um erro inesperado.';
  const err = new Error(mensagem);
  err.status = error?.response?.status;
  err.mensagemNormalizada = mensagem;
  return err;
}

// ─── Listagem ────────────────────────────────────────────────────────────────

/**
 * GET /api/pedidos
 * Retorna todos os pedidos da empresa do usuário logado (extraído do JWT no back-end).
 * @returns {Promise<Array>}
 */
export async function listarPedidosCRM() {
  try {
    const { data } = await api.get('/api/pedidos');
    return data;
  } catch (error) {
    throw normalizarErro(error);
  }
}

// ─── Criação Manual ───────────────────────────────────────────────────────────

/**
 * POST /api/pedidos
 * Cria um pedido manual no CRM.
 *
 * Payload esperado pelo C#:
 * {
 *   clienteId: "guid",
 *   observacaoNegociacao: "string",
 *   itens: [
 *     {
 *       produtoId: "guid",
 *       quantidade: number,
 *       precoUnitario: number,
 *       ehFabricacaoPropriaSnapshot: boolean
 *     }
 *   ]
 * }
 *
 * @param {Object} payload
 * @returns {Promise<{ mensagem: string, id: string, codigo: string, valorTotal: number }>}
 */
export async function criarPedidoManualCRM(payload) {
  try {
    const { data } = await api.post('/api/pedidos', payload);
    return data;
  } catch (error) {
    throw normalizarErro(error);
  }
}

// ─── Detalhe de um pedido (para modal de Triagem) ─────────────────────────────

/**
 * GET /api/pedidos/{id}
 * Retorna os detalhes completos de um pedido (cabeçalho + itens com nome do produto).
 * @param {string} id - UUID do pedido
 * @returns {Promise<Object>}
 */
export async function obterDetalhePedidoCRM(id) {
  try {
    const { data } = await api.get(`/api/pedidos/${id}`);
    return data;
  } catch (error) {
    throw normalizarErro(error);
  }
}

/**
 * PATCH /api/pedidos/{id}/status-logistica
 * Atualiza o status logístico do pedido (ex: Aprovar/Enviar para Preparação).
 * @param {string} id - UUID do pedido
 * @param {number|string} status - O novo status logístico (ex: 2 para EmSeparacao/Preparação)
 * @returns {Promise<Object>}
 */
export async function atualizarStatusPedidoLogistica(id, status) {
  try {
    const { data } = await api.patch(`/api/pedidos/${id}/status-logistica`, { status });
    return data;
  } catch (error) {
    throw normalizarErro(error);
  }
}

