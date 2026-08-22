import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CircleDollarSign, 
  Package, 
  Users, 
  Settings, 
  LogOut, 
  ShoppingCart, 
  FileText,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();

  // Função auxiliar para gerar as iniciais do nome do usuário (ex: "Marcio Admin" -> "MA")
  const getIniciais = (nome) => {
    if (!nome) return 'AD';
    const partes = nome.trim().split(' ');
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  };

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['Administrador', 'Operador'] },
    { name: 'Gestão Orçamentária', path: '/pedidos', icon: ShoppingCart, roles: ['Administrador', 'Operador'] },
    { name: 'Financeiro', path: '/financeiro', icon: CircleDollarSign, roles: ['Administrador'] },
    { name: 'Produtos', path: '/produtos', icon: Package, roles: ['Administrador', 'Operador'] },
    { name: 'Clientes', path: '/clientes', icon: Users, roles: ['Administrador', 'Operador'] },
    { name: 'Colaboradores', path: '/usuarios', icon: ShieldAlert, roles: ['Administrador'] },
    { name: 'Relatórios', path: '/relatorios', icon: FileText, roles: ['Administrador'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role || 'Administrador'));

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen transition-colors border-r border-slate-800 shrink-0">
      
      {/* Logo */}
      <div className="p-6 shrink-0">
        <h2 className="text-xl font-bold text-white tracking-wider">
          EMPRESA <span className="text-amber-500">A CASEIRA</span>
        </h2>
      </div>

      {/* Navegação Dinâmica */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {filteredMenu.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-500 font-semibold border border-amber-500/20'
                    : 'hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon size={20} />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* Rodapé: Configurações, Perfil e Logout */}
      <div className="p-4 border-t border-slate-800 space-y-2 shrink-0">
        
        {user?.role === 'Administrador' && (
          <NavLink
            to="/configuracoes"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-amber-500/10 text-amber-500 font-semibold border border-amber-500/20'
                  : 'hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Settings size={20} />
            Configurações
          </NavLink>
        )}
        
        {/* Box com Foto/Iniciais e Nome Real do Usuário Logado */}
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
          {user?.avatar ? (
            <img 
              src={user.avatar} 
              alt="Foto de Perfil" 
              className="w-10 h-10 rounded-full border border-slate-600 object-cover" 
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-900 font-black flex items-center justify-center text-sm border border-amber-400 shrink-0">
              {getIniciais(user?.nome || user?.name || 'Usuário')}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{user?.nome || user?.name || 'Usuário'}</p>
            <p className="text-xs text-slate-400 truncate">{user?.perfil || user?.role || 'Administrador'}</p>
          </div>
        </div>

        {/* Botão Sair */}
        <button 
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 text-left text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all cursor-pointer"
        >
          <LogOut size={20} />
          Sair do Sistema
        </button>

      </div>
    </aside>
  );
}