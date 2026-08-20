import { useState } from 'react';
import { Link,useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, CheckCircle2, Truck, FileText, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { pedidosMock } from '../data/pedidosMock';
import { useCart } from '../contexts/CartContext';

const STATUS_CONFIG = {
  Entregue: {
    icon: CheckCircle2,
    className: 'bg-stone-50 text-stone-600 border border-stone-300',
  },
  'Em Separação': {
    icon: Truck,
    className: 'bg-orange-50 text-orange-600 border border-orange-200',
  },
  Faturado: {
    icon: FileText,
    className: 'bg-sky-50 text-sky-600 border border-sky-200',
  },
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? {
    icon: FileText,
    className: 'bg-stone-50 text-stone-500 border border-stone-200',
  };
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.className}`}
    >
      <Icon className="w-3.5 h-3.5" strokeWidth={2} />
      {status}
    </span>
  );
}

const PAGE_SIZE = 10;

export default function MeusPedidosPage() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [order, setOrder] = useState('desc');
  const { addItem } = useCart();
  const navigate = useNavigate();

  const pedidos = JSON.parse(localStorage.getItem('caseira_orders') || '[]');
  //const filtered = pedidos
  const filtered = pedidosMock
  .filter((p) => {
    const search = query.replace('#', '').trim().toLowerCase();

    const matchesSearch =
      p.id.includes(search) ||
      p.status.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === 'Todos' ||
      p.status === statusFilter;

    return matchesSearch && matchesStatus;
  })
  .sort((a, b) => {

    if(order === 'asc'){
      return a.id.localeCompare(b.id);
    }

    return b.id.localeCompare(a.id);

  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSearch(e) {
    setQuery(e.target.value);
    setPage(1);
  }

  function repetirPedido(pedido) {
  if (!pedido.itens || pedido.itens.length === 0) {
    alert('Não foi possível repetir este pedido porque ele não possui itens.');
    return;
  }

  pedido.itens.forEach((item) => {
    addItem({
      id: item.id,
      guid: item.guid,
      name: item.name,
      image: item.image,
      qty: item.quantidade ?? item.qty ?? 1,
      price: item.price,
      packaging: item.packaging
        ? {
            id: item.packaging.id,
            name: item.packaging.name,
            units: item.packaging.units,
            price: item.packaging.price,
          }
        : undefined,
    });
  });

  navigate('/portal/carrinho');
}

  return (
    <div className="space-y-6">
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
                #{pedido.id}
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

              <button
                onClick={() => repetirPedido(pedido)}
                className="text-xs font-semibold px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition"
              >
                Repetir
              </button>
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
    </div>
  );
}
