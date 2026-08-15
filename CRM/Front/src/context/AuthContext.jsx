import { createContext, useState, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Estado inicial nulo para exigir login ou simular sessão ativa se preferir
  const [user, setUser] = useState(null);

  const login = async (email, senha) => {
    try {
      // 1. Envia os dados para a rota de autenticação do seu C#
      // Altere '/api/auth/login' para a rota exata criada no seu Controller
      const resposta = await api.post('/api/auth/login', { 
        email: email, 
        senha: senha 
      });

      // 2. Se o C# aprovar, ele vai devolver o JWT (Token)
      const { token, usuario } = resposta.data;

      // 3. Salva o Token no navegador para o Axios usar nas próximas requisições
      localStorage.setItem('caseira_token', token);
      
      // 4. Salva os dados do usuário para mostrar na tela (nome, perfil, etc)
      setUser(usuario);
      
      return true; // Sucesso!
    } catch (erro) {
      console.error("Erro na autenticação:", erro);
      return false; // Senha errada ou erro no servidor
    }
  };

  const logout = () => {
    localStorage.removeItem('caseira_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);