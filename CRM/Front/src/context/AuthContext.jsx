import { createContext, useState, useContext } from 'react';
import { mockUsuarios } from '../services/mockData';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Estado inicial nulo para exigir login ou simular sessão ativa se preferir
  const [user, setUser] = useState({
    name: "Marcio Admin",
    email: "admin@acaseira.com.br",
    role: "Administrador",
    avatar: 'https://ui-avatars.com/api/?name=Marcio+Admin&background=f59e0b&color=fff'
  });

  const login = (email, password) => {
    // Busca o usuário correspondente no mock de dados da empresa
    const usuarioEncontrado = mockUsuarios.find(
      u => u.email === email && u.senha_hash === password && u.esta_ativo
    );

    if (usuarioEncontrado) {
      setUser({
        name: usuarioEncontrado.nome,
        role: usuarioEncontrado.role,
        email: usuarioEncontrado.email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(usuarioEncontrado.nome)}&background=${usuarioEncontrado.role === 'Administrador' ? 'f59e0b' : '0ea5e9'}&color=fff`,
        permissions: usuarioEncontrado.permissions
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);