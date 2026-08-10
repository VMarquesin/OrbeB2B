import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Financial from './pages/Financial';
import Products from './pages/Products';
import Clients from './pages/Clients';
import Settings from './pages/Settings';
import Orders from './pages/Orders';
import Reports from './pages/Reports';
import Login from './pages/Login';
import GestaoUsuarios from './pages/Users';
import CadastroEmpresa from './pages/Register';

// Componente Layout para envelopar as rotas privadas com a Sidebar
function PrivateLayout({ children }) {
  const { user } = useAuth();

  // Trava de segurança real: se tentar acessar página interna sem login, volta pro /login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    // 1. 'h-screen' + 'overflow-hidden' impedem que a página inteira role e crie a tarja branca
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors">
      <Sidebar />
      
      {/* 2. 'h-full' + 'overflow-y-auto' garante que APENAS esta área direita tenha rolagem */}
      <div className="flex-1 h-full overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* ========================================== */}
      {/* ROTAS PÚBLICAS (Fora do Sistema/Sidebar)   */}
      {/* ========================================== */}
      
      {/* Se já estiver logado e tentar ir pro login, é redirecionado pra Home */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
      <Route path="/cadastro" element={!user ? <CadastroEmpresa /> : <Navigate to="/" replace />} />


      {/* ========================================== */}
      {/* ROTAS PRIVADAS (Dentro do Sistema/Sidebar) */}
      {/* ========================================== */}
      
      <Route path="/" element={<PrivateLayout><Dashboard /></PrivateLayout>} />
      <Route path="/pedidos" element={<PrivateLayout><Orders /></PrivateLayout>} />
      <Route path="/produtos" element={<PrivateLayout><Products /></PrivateLayout>} />
      <Route path="/clientes" element={<PrivateLayout><Clients /></PrivateLayout>} />
      <Route path="/usuarios" element={<PrivateLayout><GestaoUsuarios /></PrivateLayout>} />

      {/* Rotas Privadas e Exclusivas do Administrador */}
      <Route path="/financeiro" element={
        <PrivateLayout>
          {user?.role === 'Administrador' ? <Financial /> : <Navigate to="/" replace />}
        </PrivateLayout>
      } />
      
      <Route path="/relatorios" element={
        <PrivateLayout>
          {user?.role === 'Administrador' ? <Reports /> : <Navigate to="/" replace />}
        </PrivateLayout>
      } />
      
      <Route path="/configuracoes" element={
        <PrivateLayout>
          {user?.role === 'Administrador' ? <Settings /> : <Navigate to="/" replace />}
        </PrivateLayout>
      } />

      {/* Rota de fallback: Digitou algo que não existe? */}
      <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <AppRoutes />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;