/**
 * authService.js — Autenticação do Comprador B2B
 *
 * Rotas consumidas:
 *   POST /api/auth-cliente/login  → LoginClienteRequest { email, senha }
 *                                 ← LoginClienteResponse { token, usuarioId, nome, clienteId, nomeCliente, empresaId }
 *
 * Regra de ouro: NUNCA enviar tenantId/empresaId/clienteId
 * no payload. O back-end extrai essas informações do JWT.
 */

import api, { TOKEN_KEY, USER_KEY } from './api';

// ============================================================
// Login
// ============================================================

/**
 * Autentica o comprador e persiste o token + dados básicos.
 *
 * @param {string} email
 * @param {string} senha
 * @returns {Promise<{ token, usuarioId, nome, clienteId, nomeCliente, empresaId }>}
 * @throws {Error} com .mensagemNormalizada quando a API retorna erro
 */
export async function login(cnpj, senha) {
  // Zero Trust: payload mínimo — apenas credenciais
  const { data } = await api.post('/api/auth-cliente/login', { cnpj, senha });

  // Persiste o token para o interceptor injetar em requests futuros
  localStorage.setItem(TOKEN_KEY, data.token);

  // Persiste dados do usuário para o contexto React usar sem nova requisição
  localStorage.setItem(
    USER_KEY,
    JSON.stringify({
      usuarioId:  data.usuarioId,
      nome:       data.nome,
      clienteId:  data.clienteId,
      nomeCliente: data.nomeCliente,
      // empresaId NÃO é armazenado — o back-end o extrai do token
    })
  );

  return data;
}

// ============================================================
// Logout
// ============================================================

/**
 * Encerra a sessão limpando o storage e redirecionando para o login.
 */
export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.location.href = '/login';
}

// ============================================================
// Utilitários de sessão (sem requisição HTTP)
// ============================================================

/**
 * Retorna os dados do usuário logado a partir do storage.
 * Retorna null se não houver sessão ativa.
 *
 * @returns {{ usuarioId, nome, clienteId, nomeCliente } | null}
 */
export function obterUsuarioLogado() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Verifica se o usuário tem uma sessão ativa (token presente no storage).
 *
 * @returns {boolean}
 */
export function estaAutenticado() {
  return Boolean(localStorage.getItem(TOKEN_KEY));
}
