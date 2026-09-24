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
function PermissionRoute({ children, permissao }) {
  const { user } = useAuth();

  // Se não estiver logado, volta pro /login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se o perfil não tiver permissão para a rota, volta para o Dashboard
  if (!user.permissoes?.includes(permissao)) {
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
          <PermissionRoute permissao="Dashboard">
            <Dashboard />
          </PermissionRoute>
        </PrivateLayout>
      } />

      {/* Gestão Orçamentária — Administrador e Vendedor */}
      <Route path="/pedidos" element={
        <PrivateLayout>
          <PermissionRoute permissao="Gestão Orçamentária">
            <Orders />
          </PermissionRoute>
        </PrivateLayout>
      } />

      {/* Produtos — somente Administrador */}
      <Route path="/produtos" element={
        <PrivateLayout>
          <PermissionRoute permissao="Produtos">
            <Products />
          </PermissionRoute>
        </PrivateLayout>
      } />

      {/* Clientes — Administrador e Vendedor */}
      <Route path="/clientes" element={
        <PrivateLayout>
          <PermissionRoute permissao="Clientes">
            <Clients />
          </PermissionRoute>
        </PrivateLayout>
      } />

      {/* Colaboradores — somente Administrador */}
      <Route path="/usuarios" element={
        <PrivateLayout>
          <PermissionRoute permissao="Colaboradores">
            <GestaoUsuarios />
          </PermissionRoute>
        </PrivateLayout>
      } />

      {/* Rotas Privadas e Exclusivas do Administrador */}
      <Route path="/financeiro" element={
        <PrivateLayout>
          <PermissionRoute permissao="Financeiro">
            <Financial />
          </PermissionRoute>
        </PrivateLayout>
      } />
      
      <Route path="/relatorios" element={
        <PrivateLayout>
          <PermissionRoute permissao="Relatórios">
            <Reports />
          </PermissionRoute>
        </PrivateLayout>
      } />
      
      <Route path="/configuracoes" element={
        <PrivateLayout>
          <PermissionRoute permissao="Configurações">
            <Settings />
          </PermissionRoute>
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