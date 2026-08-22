import axios from 'axios';

// Cria a instância do Axios apontando para a variável de ambiente
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 10000, // Cancela a requisição se demorar mais de 10 segundos
  headers: {
    'Content-Type': 'application/json',
  }
});

// INTERCEPTOR DE REQUISIÇÃO: Antes de enviar qualquer dado pro Back-end...
api.interceptors.request.use(
  (config) => {
    // Busca o token de segurança salvo no navegador (quando o usuário loga)
    const token = localStorage.getItem('caseira_token');
    
    // Se existir token, injeta no cabeçalho de autorização (Padrão Bearer JWT)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// INTERCEPTOR DE RESPOSTA: Quando o Back-end responde...
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Se o back-end disser que o token expirou (Erro 401 Não Autorizado)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('caseira_token');
      localStorage.removeItem('caseira_user');
      // Força a pessoa a ir para a tela de login
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default api;