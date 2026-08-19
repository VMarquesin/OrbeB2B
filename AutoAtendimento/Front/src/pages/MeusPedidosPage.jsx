import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, CheckCircle2, Truck, FileText, ChevronLeft, ChevronRight, ArrowUpDown, Loader2, AlertCircle } from 'lucide-react';
import { obterMeusPedidos } from '../services/pedidosService';

// Mapeamento dos enum values do back-end para labels legíveis
const STATUS_LOGISTICA_LABEL = {
  0: 'Aguardando Validação',
  1: 'Faturado',
  2: 'Em Separação',
  3: 'Enviado',
  4: 'Entregue',
  5: 'Cancelado',
};

const STATUS_CONFIG = {
  'Entregue': { icon: CheckCircle2, className: 'bg-stone-50 text-stone-600 border border-stone-300' },
  'Em Separação': { icon: Truck, className: 'bg-orange-50 text-orange-600 border border-orange-200' },
  'Faturado': { icon: FileText, className: 'bg-sky-50 text-sky-600 border border-sky-200' },
  'Enviado': { icon: Truck, className: 'bg-blue-50 text-blue-600 border border-blue-200' },
  'Cancelado': { icon: FileText, className: 'bg-red-50 text-red-500 border border-red-200' },
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? { icon: FileText, className: 'bg-stone-50 text-stone-500 border border-stone-200' };
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.className}`}>
      <Icon className="w-3.5 h-3.5" strokeWidth={2} />
      {status}
    </span>
  );
}

const PAGE_SIZE = 10;

export default function MeusPedidosPage() {
  const [pedidos, setPedidos]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [erro, setErro]             = useState(null);
  const [query, setQuery]           = useState('');
  const [page, setPage]             = useState(1);
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [order, setOrder]           = useState('desc');

  useEffect(() => {
    let cancelado = false;
    async function carregar() {
      setLoading(true);
      setErro(null);
      try {
        const data = await obterMeusPedidos();
        if (!cancelado) {
          // Normaliza os dados da API para o shape da UI
          const normalizados = data.map((p) => ({
            id:     p.id,
            codigo: p.codigoPedidoFormatado,
            data:   new Date(p.dataCriacao).toLocaleDateString('pt-BR'),
            valor:  `R$ ${Number(p.valorTotalPedido).toFixed(2)}`,
            status: STATUS_LOGISTICA_LABEL[p.statusLogistica] ?? String(p.statusLogistica),
          }));
          setPedidos(normalizados);
        }
      } catch (err) {
        if (!cancelado) setErro(err.mensagemNormalizada ?? 'Não foi possível carregar os pedidos.');
      } finally {
        if (!cancelado) setLoading(false);
      }
    }
    carregar();
    return () => { cancelado = true; };
  }, []);

  const filtered = pedidos
    .filter((p) => {
      const search = query.replace('#', '').trim().toLowerCase();
      const matchesSearch = p.codigo.toLowerCase().includes(search) || p.status.toLowerCase().includes(search);
      const matchesStatus = statusFilter === 'Todos' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => order === 'asc' ? a.codigo.localeCompare(b.codigo) : b.codigo.localeCompare(a.codigo));


  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSearch(e) {
    setQuery(e.target.value);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-24 gap-3 text-stone-400">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-sm">Carregando pedidos...</span>
        </div>
      )}

      {/* Erro */}
      {!loading && erro && (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-red-500">
          <AlertCircle className="w-8 h-8" />
          <p className="text-sm font-medium">{erro}</p>
          <button onClick={() => window.location.reload()} className="text-xs text-primary underline">Tentar novamente</button>
        </div>
      )}

      {!loading && !erro && (
      <>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">
            Histórico de Pedidos
          </h1>
          <p className="text-sm text-stone-500 mt-0.5">
            Acompanhe e gerencie seus pedidos recentes.
          </p>
        </div>

        {/* Search + filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" strokeWidth={1.75} />
            <input
              type="text"
              value={query}
              onChange={handleSearch}
              placeholder="Buscar pedido..."
              className="pl-9 pr-4 py-2 text-sm border border-stone-200 rounded-lg bg-white
                text-stone-800 placeholder-stone-300
                focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition
                w-52"
            />
          </div>
         <select
                  
          value={statusFilter}
          onChange={(e)=> {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="
          bg-white
          border border-stone-200
          rounded-lg
          px-3 py-2
          text-sm
          text-stone-600
          "
          >

          <option value="Todos">
          Todos
          </option>

          <option value="Em Separação">
          Em Separação
          </option>

          <option value="Faturado">
          Faturado
          </option>

          <option value="Entregue">
          Entregue
          </option>

          </select>
          <button
          onClick={() =>
          setOrder(order === 'asc' ? 'desc' : 'asc')
          }
          className="
          p-2
          border
          border-stone-200
          rounded-lg
          bg-white
          text-stone-500
          hover:bg-stone-50
          transition
          "
          >

          <ArrowUpDown 
          className="w-4 h-4"
          />

          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-[1fr_1fr_1fr_1.4fr_auto] gap-4 px-6 py-3 border-b border-stone-100 bg-stone-50">
          {['NÚMERO DO PEDIDO', 'DATA', 'VALOR TOTAL', 'STATUS', 'AÇÕES'].map((h) => (
            <span key={h} className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
              {h}
            </span>
          ))}
        </div>

        {/* Data rows */}
        {paginated.length === 0 ? (
          <div className="py-14 text-center text-sm text-stone-400">
            Nenhum pedido encontrado.
          </div>
        ) : (
          paginated.map((pedido, idx) => (
            <div
              key={pedido.id}
              className={`grid grid-cols-[1fr_1fr_1fr_1.4fr_auto] gap-4 items-center px-6 py-4 ${
                idx !== paginated.length - 1 ? 'border-b border-stone-100' : ''
              }`}
            >
              <span className="text-sm font-semibold text-stone-800">
                #{pedido.codigo}
              </span>
              <span className="text-sm text-stone-600">{pedido.data}</span>
              <span className="text-sm font-semibold text-stone-900">
                {pedido.valor}
              </span>
              <StatusBadge status={pedido.status} />
              <Link
                to={`/portal/pedidos/${pedido.id}`}
                className="text-xs font-semibold px-4 py-2 border border-stone-300
                  text-stone-700 rounded-lg hover:bg-stone-50 hover:border-stone-400
                  transition whitespace-nowrap"
              >
                Ver Detalhes
              </Link>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="p-1.5 rounded-lg border border-stone-200 text-stone-500
            hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          aria-label="Página anterior"
        >
          <ChevronLeft className="w-4 h-4" strokeWidth={2} />
        </button>
        <span className="text-sm text-stone-600 px-2">
          Página {page} de {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="p-1.5 rounded-lg border border-stone-200 text-stone-500
            hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          aria-label="Próxima página"
        >
          <ChevronRight className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>
      </>
      )}
    </div>
  );
}
