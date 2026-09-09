import axios from 'axios';

/**
 * api.js — Cliente HTTP central do CRM
 *
 * Em desenvolvimento: aponta para .env → VITE_API_URL=http://localhost:5291
 * Em produção (Vercel): aponta para .env.production → VITE_API_URL=https://orbeb2b-api.onrender.com
 */

export const TOKEN_KEY  = 'caseira_token';
export const USER_KEY   = 'caseira_user';

// ============================================================
// Instância configurada com variável de ambiente
// ============================================================
const api = axios.create({
  // O Vite substitui import.meta.env.VITE_API_URL em build time.
  // .env (dev)        → http://localhost:5291
  // .env.production   → https://orbeb2b-api.onrender.com
  baseURL: import.meta.env.VITE_API_URL ?? 'https://orbeb2b-api.onrender.com',
  timeout: 10000,

  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
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
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Normaliza o erro para o padrão ProblemDetails (RFC 7807)
    const data = error.response?.data;
    const mensagem =
      data?.detail    ||
      data?.mensagem  ||
      data?.title     ||
      error.message   ||
      'Erro desconhecido. Tente novamente.';

    error.mensagemNormalizada = mensagem;
    return Promise.reject(error);
  }
);

export default api;