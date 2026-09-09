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

// Componente para controlar o acesso às rotas de acordo com o perfil
function RoleRoute({ children, roles }) {
  const { user } = useAuth();

  // Se não estiver logado, volta pro /login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se o perfil não tiver permissão para a rota, volta para o Dashboard
  if (!roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
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
      
      {/* Dashboard — Administrador e Vendedor */}
      <Route path="/" element={
        <PrivateLayout>
          <RoleRoute roles={['AdminMaster', 'Vendedor']}>
            <Dashboard />
          </RoleRoute>
        </PrivateLayout>
      } />

      {/* Gestão Orçamentária — Administrador e Vendedor */}
      <Route path="/pedidos" element={
        <PrivateLayout>
          <RoleRoute roles={['AdminMaster', 'Vendedor']}>
            <Orders />
          </RoleRoute>
        </PrivateLayout>
      } />

      {/* Produtos — somente Administrador */}
      <Route path="/produtos" element={
        <PrivateLayout>
          <RoleRoute roles={['AdminMaster', 'Vendedor']}>
            <Products />
          </RoleRoute>
        </PrivateLayout>
      } />

      {/* Clientes — Administrador e Vendedor */}
      <Route path="/clientes" element={
        <PrivateLayout>
          <RoleRoute roles={['AdminMaster', 'Vendedor']}>
            <Clients />
          </RoleRoute>
        </PrivateLayout>
      } />

      {/* Colaboradores — somente Administrador */}
      <Route path="/usuarios" element={
        <PrivateLayout>
          <RoleRoute roles={['AdminMaster']}>
            <GestaoUsuarios />
          </RoleRoute>
        </PrivateLayout>
      } />

      {/* Rotas Privadas e Exclusivas do Administrador */}
      <Route path="/financeiro" element={
        <PrivateLayout>
          <RoleRoute roles={['AdminMaster']}>
            <Financial />
          </RoleRoute>
        </PrivateLayout>
      } />
      
      <Route path="/relatorios" element={
        <PrivateLayout>
          <RoleRoute roles={['AdminMaster']}>
            <Reports />
          </RoleRoute>
        </PrivateLayout>
      } />
      
      <Route path="/configuracoes" element={
        <PrivateLayout>
          <RoleRoute roles={['AdminMaster']}>
            <Settings />
          </RoleRoute>
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