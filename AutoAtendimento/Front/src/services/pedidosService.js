/**
 * pedidosService.js — Criação de pedidos e histórico "Meus Pedidos"
 *
 * Rotas consumidas:
 *   POST /api/pedidos-cliente
 *   GET  /api/meus-pedidos
 *   GET  /api/meus-pedidos/{id}
 *   GET  /api/meus-pedidos/{id}/recompra
 *
 * Regra de ouro: NUNCA enviar clienteId ou tenantId nos payloads.
 */

import api from './api';

// ============================================================
// Criação de pedido (Checkout)
// ============================================================

/**
 * Envia um novo pedido ao back-end.
 * ClienteId e TenantId são extraídos do JWT pelo servidor.
 *
 * @param {{ observacaoNegociacao?: string, itens: Array<{ produtoId, quantidade, precoUnitario }> }} pedido
 * @returns {Promise<{ mensagem, id, codigo, valorTotal }>}
 */
export async function criarPedido(pedido) {
  const payload = {
    observacaoNegociacao: pedido.observacaoNegociacao ?? '',
    itens: pedido.itens.map((item) => ({
      produtoId:      item.produtoId,
      quantidade:     item.quantidade,
      precoUnitario:  item.precoUnitario,
      // clienteId: NUNCA enviado
    })),
  };

  const { data } = await api.post('/api/pedidos-cliente', payload);
  return data;
}

// ============================================================
// Histórico — Meus Pedidos
// ============================================================

/**
 * Retorna o histórico de pedidos do comprador logado.
 * ClienteId é extraído do JWT pelo back-end (prevenção de BOLA/IDOR).
 *
 * @returns {Promise<Array<MeuPedidoResumoResponse>>}
 */
export async function obterMeusPedidos() {
  const { data } = await api.get('/api/meus-pedidos');
  return data;
}

/**
 * Retorna os detalhes completos de um pedido específico.
 *
 * @param {string} id - UUID do pedido
 * @returns {Promise<MeuPedidoDetalheResponse>}
 */
export async function obterDetalhePedido(id) {
  const { data } = await api.get(`/api/meus-pedidos/${id}`);
  return data;
}

/**
 * Retorna a simulação de recompra baseada em um pedido histórico.
 * O back-end valida preços atuais e disponibilidade dos produtos.
 *
 * @param {string} id - UUID do pedido de origem
 * @returns {Promise<Array<SimulacaoRecompraItemResponse>>}
 */
export async function obterSimulacaoRecompra(id) {
  const { data } = await api.get(`/api/meus-pedidos/${id}/recompra`);
  return data;
}
