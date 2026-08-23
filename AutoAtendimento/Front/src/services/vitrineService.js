/**
 * vitrineService.js — Catálogo de produtos da Vitrine B2B
 *
 * Rotas consumidas:
 *   GET /api/vitrine/produtos
 *     ← List<ProdutoVitrineResponse>:
 *         { id, codigoComercial, descricao, embalagem, preco }
 *
 *   GET /api/vitrine/produtos-publicos
 *     ← List<ProdutoVitrineResponse>:
 *         { id, codigoComercial, descricao, embalagem, preco }
 *
 *   GET /api/vitrine/produtos/:id
 *     ← ProdutoVitrineResponse (item único)
 *
 * TenantId e EmpresaId são extraídos do JWT pelo back-end quando autenticado.
 * Para rotas públicas (AllowAnonymous), aceita opcionalmente empresaId como query parameter.
 */

import api from './api';

/**
 * Retorna os produtos ativos da vitrine do comprador logado (JWT obrigatório).
 *
 * @returns {Promise<Array<{ id, codigoComercial, descricao, embalagem, preco }>>}
 */
export async function obterProdutos() {
  const { data } = await api.get('/api/vitrine/produtos');
  return data;
}

/**
 * Retorna produtos para exibição pública (sem JWT / AllowAnonymous).
 * Usado pela landing page, carrossel e catálogo público.
 *
 * @param {string|null} empresaId - Opcional. ID da empresa caso deseje filtrar por tenant específico.
 * @returns {Promise<Array<{ id, codigoComercial, descricao, embalagem, preco }>>}
 */
export async function obterProdutosPublicos(empresaId = null) {
  const { data } = await api.get('/api/vitrine/produtos-publicos', {
    params: empresaId ? { empresaId } : {}
  });
  return data;
}

/**
 * Retorna um produto pelo seu UUID.
 * Usado pela página de Detalhe do Produto (B2B e público).
 *
 * @param {string} id — UUID do produto
 * @returns {Promise<{ id, codigoComercial, descricao, embalagem, preco }>}
 */
export async function obterProdutoPorId(id) {
  const { data } = await api.get(`/api/vitrine/produtos/${id}`);
  return data;
}
