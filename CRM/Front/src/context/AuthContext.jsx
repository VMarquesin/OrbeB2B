import { createContext, useState, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Estado inicial nulo para exigir login ou simular sessão ativa se preferir
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('caseira_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (email, senha) => {
    try {
      // 1. Envia os dados para a rota de autenticação do seu C#
      // Altere '/api/auth/login' para a rota exata criada no seu Controller
      const resposta = await api.post('/api/auth/login', { 
        email: email, 
        senha: senha 
      });

      // 2. Extrai o token e os dados (tenta 'token' ou 'accessToken' dependendo do C#)
      const token = resposta.data.token || resposta.data.accessToken || resposta.data;
      // Se a API não retornar um objeto "usuario", podemos criar um genérico para o state
      const usuario = resposta.data.usuario || { email: email, role: 'Administrador' };

      // 3. Salva o Token no navegador para o Axios usar nas próximas requisições
      if (token && typeof token === 'string') {
        localStorage.setItem('caseira_token', token);
      } else {
        localStorage.setItem('caseira_token', token.token || token.accessToken);
      }
      
      localStorage.setItem('caseira_user', JSON.stringify(usuario));
      
      // 4. Atualiza o estado
      setUser(usuario);
      
      // 5. Redirecionamento Imperativo para a Home
      window.location.href = '/';
      
      return true; // Sucesso!
    } catch (erro) {
      console.error("Erro na autenticação:", erro);
      const msgErro = erro.response?.data?.mensagem || erro.response?.data?.errors || "Falha de comunicação com a API. Verifique o console.";
      alert(typeof msgErro === 'object' ? JSON.stringify(msgErro) : msgErro);
      return false; // Senha errada ou erro no servidor
    }
  };

  const logout = () => {
    localStorage.removeItem('caseira_token');
    localStorage.removeItem('caseira_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);