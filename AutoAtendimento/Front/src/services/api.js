/**
 * api.js — Cliente HTTP central do AutoAtendimento
 *
 * Responsabilidades:
 *  - Instância Axios configurada com baseURL do .env
 *  - Request Interceptor: injeta o JWT em todo header Authorization
 *  - Response Interceptor: trata 401 (logout) e normaliza erros ProblemDetails (RFC 7807)
 */

import axios from 'axios';

// ============================================================
// Constantes de armazenamento (single source of truth)
// ============================================================
export const TOKEN_KEY = '@orbeb2b:token';
export const USER_KEY  = '@orbeb2b:user';

// ============================================================
// Instância configurada
// ============================================================
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Timeout razoável para evitar requests pendurados
  timeout: 15000,
});

// ============================================================
// REQUEST INTERCEPTOR — Injeta o token JWT se disponível
// ============================================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================
// RESPONSE INTERCEPTOR — Trata 401 e normaliza erros
// ============================================================
api.interceptors.response.use(
  // Resposta bem-sucedida: repassa sem alteração
  (response) => response,

  // Erro: normaliza antes de rejeitar
  (error) => {
    const status = error.response?.status;

    // 401 Unauthorized — token expirado ou inválido
    if (status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);

      // Redireciona para o login sem criar loop de history
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Normaliza o erro para o padrão ProblemDetails (RFC 7807)
    // O GlobalExceptionMiddleware do back-end sempre devolve:
    //   { title, detail, status, type, instance }
    const data = error.response?.data;

    const mensagem =
      data?.detail ||          // ProblemDetails.detail (exceção não tratada)
      data?.mensagem ||         // Retorno explícito dos controllers (ex: { mensagem: "..." })
      data?.title ||            // ProblemDetails.title
      error.message ||          // Erro de rede (ex: timeout)
      'Erro desconhecido. Tente novamente.';

    // Enriquece o objeto de erro com mensagem normalizada
    // Os serviços podem usar: error.mensagemNormalizada
    error.mensagemNormalizada = mensagem;

    return Promise.reject(error);
  }
);

export default api;
