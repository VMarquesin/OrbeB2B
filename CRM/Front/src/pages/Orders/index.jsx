import { useState, useMemo, useEffect } from 'react';
import { 
  Search, Calendar, Eye, X, Printer, CheckCircle2, 
  ShoppingCart, ArrowUpDown, Plus, Factory, Store,
  Trash2, AlertCircle, RefreshCw
} from 'lucide-react';
import api from '../../services/api';

export default function GestaoOrcamentaria() {
  // =========================================================================
  // 1. AS GAVETAS VAZIAS PARA O BANCO DE DADOS
  // =========================================================================
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);

  // =========================================================================
  // 2. BUSCA SIMULTÂNEA NO BACKEND
  // =========================================================================
  useEffect(() => {
    async function carregarDadosOrcamentarios() {
      try {
        // Dispara as três buscas ao mesmo tempo
        const [resPedidos, resClientes, resProdutos] = await Promise.all([
          api.get('/api/pedidos'),
          api.get('/api/clientes'),
          api.get('/api/produtos')
        ]);
        
        setPedidos(resPedidos.data);
        setClientes(resClientes.data);
        setProdutos(resProdutos.data);
      } catch (erro) {
        console.error("Erro ao carregar dados da Gestão Orçamentária:", erro);
      }
    }

    carregarDadosOrcamentarios();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'data_criacao', direction: 'desc' });

  const [isTriagemOpen, setIsTriagemOpen] = useState(false);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [activeTabTriagem, setActiveTabTriagem] = useState('comercial'); 

  const [isManualOpen, setIsManualOpen] = useState(false);
  const [buscaCliente, setBuscaCliente] = useState('');
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [showClienteDropdown, setShowClienteDropdown] = useState(false);
  
  const [buscaProduto, setBuscaProduto] = useState('');
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [showProdutoDropdown, setShowProdutoDropdown] = useState(false);
  
  const [tabelaPreco, setTabelaPreco] = useState('atacado'); 
  const [qtdProduto, setQtdProduto] = useState(1);
  const [precoEditavel, setPrecoEditavel] = useState(''); 
  const [itensManuais, setItensManuais] = useState([]);

  // =========================================================================
  // RECUPERAÇÃO DO CÁLCULO DE FÁBRICA (PCP)
  // =========================================================================
  const [configPcp, setConfigPcp] = useState({
    mesasFisicas: 8,
    bandejasPorMesa: 2,
    capacidadeBandeja: 208
  });

  useEffect(() => {
    const dadosSalvos = localStorage.getItem('caseira_pcp_settings');
    if (dadosSalvos) {
      const config = JSON.parse(dadosSalvos);
      setConfigPcp({
        mesasFisicas: Number(config.mesasFisicas || 8),
        bandejasPorMesa: Number(config.bandejasPorMesa || 2),
        capacidadeBandeja: Number(config.capacidadeBandeja || 208)
      });
    }
  }, []);

  const capacidadePorMesa = configPcp.bandejasPorMesa * configPcp.capacidadeBandeja;

  // Função auxiliar para calcular "Caixas a Fechar" baseado no nome do produto
  const calcularCaixas = (nome, quantidade) => {
    let divisor = 1;
    if (nome.includes('100un')) divisor = 100;
    else if (nome.includes('20un')) divisor = 20;
    else if (nome.includes('30un')) divisor = 30;
    else if (nome.includes('50un')) divisor = 50;
    return Math.ceil(quantidade / divisor);
  };

  useEffect(() => {
    if (produtoSelecionado) {
      if (tabelaPreco === 'atacado') setPrecoEditavel(produtoSelecionado.preco_atacado);
      else if (tabelaPreco === 'lojista') setPrecoEditavel(produtoSelecionado.preco_lojista);
      else setPrecoEditavel(produtoSelecionado.preco_varejo);
    } else {
      setPrecoEditavel('');
    }
  }, [produtoSelecionado, tabelaPreco]);

  const formatCurrency = (val) => Number(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  
  const formatDate = (isoString) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return date.toLocaleDateString('pt-BR');
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const processedOrders = useMemo(() => {
    let filtered = pedidos.filter(o => {
      const termo = (searchTerm || '').toLowerCase();
      const clienteNome = (o.clienteNome || '').toLowerCase();
      const codigo = (o.codigo_pedido_formatado || '').toLowerCase();
      const dataOrigem = o.data_criacao;
      const dataFormatada = dataOrigem ? new Date(dataOrigem).toLocaleDateString('pt-BR') : '';

      const matchesSearch = clienteNome.includes(termo) || codigo.includes(termo) || dataFormatada.includes(termo);

      let matchesStatus = true;
      if (statusFilter === 'AGUARDANDO') matchesStatus = o.status === 'aguardando_validacao';
      if (statusFilter === 'PREPARACAO') matchesStatus = o.status === 'preparando';
      if (statusFilter === 'CONCLUIDO') matchesStatus = o.status === 'concluido' || o.status === 'entregue';

      const dataRegistro = dataOrigem ? new Date(dataOrigem).getTime() : 0;
      const limiteInicio = dataInicio ? new Date(dataInicio + 'T00:00:00').getTime() : 0;
      const limiteFim = dataFim ? new Date(dataFim + 'T23:59:59').getTime() : Infinity;
      const matchesTempo = dataRegistro >= limiteInicio && dataRegistro <= limiteFim;

      return matchesSearch && matchesStatus && matchesTempo;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let valA = a[sortConfig.key] || '';
        let valB = b[sortConfig.key] || '';
        if (sortConfig.key === 'data_criacao') {
          valA = valA ? new Date(valA).getTime() : 0;
          valB = valB ? new Date(valB).getTime() : 0;
        }
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [pedidos, searchTerm, statusFilter, dataInicio, dataFim, sortConfig]);

  const clientesFiltrados = useMemo(() => {
    if (!buscaCliente) return [];
    const termo = (buscaCliente || '').toLowerCase();
    return clientes.filter(c => {
      const nomeOuRazao = (c.nome_ou_razao_social || '').toLowerCase();
      const fantasia = (c.nome_fantasia || '').toLowerCase();
      return nomeOuRazao.includes(termo) || fantasia.includes(termo);
    });
  }, [buscaCliente, clientes]);

  const produtosFiltrados = useMemo(() => {
    if (!buscaProduto) return [];
    const termo = (buscaProduto || '').toLowerCase();
    return produtos.filter(p => {
      const desc = (p.descricao || '').toLowerCase();
      const cod = (p.codigo_comercial || '').toLowerCase();
      return desc.includes(termo) || cod.includes(termo);
    });
  }, [buscaProduto, produtos]);

  const handlePuxarUltimoPedido = () => {
    if (!clienteSelecionado) return;
    const ultimo = pedidos.find(p => p.cliente_id === clienteSelecionado.id && p.status !== 'aguardando_validacao');
    if (ultimo && ultimo.itemsDetalhados) {
      setItensManuais([...ultimo.itemsDetalhados]); 
      alert(`Último pedido (${ultimo.codigo_pedido_formatado}) carregado com sucesso!`);
    } else {
      alert('Nenhum pedido anterior encontrado para este cliente.');
    }
  };

  const handleAddProduto = () => {
    if (!produtoSelecionado || qtdProduto < 1 || precoEditavel === '') return;
    const novoItem = {
      produtoId: produtoSelecionado.id,
      nome: produtoSelecionado.descricao,
      quantidade: Number(qtdProduto),
      precoUnitario: Number(precoEditavel),
      eh_fabricacao_propria: produtoSelecionado.eh_fabricacao_propria,
      origem: produtoSelecionado.eh_fabricacao_propria ? 'proprio' : 'terceiro'
    };
    setItensManuais(prev => [...prev, novoItem]);
    setBuscaProduto('');
    setProdutoSelecionado(null);
    setQtdProduto(1);
  };

  const removerItemManual = (index) => {
    setItensManuais(prev => prev.filter((_, i) => i !== index));
  };

  const valorTotalManual = itensManuais.reduce((acc, item) => acc + (item.quantidade * item.precoUnitario), 0);

  const handleSalvarPedidoManual = async () => {
    if (!clienteSelecionado || itensManuais.length === 0) {
      alert("Selecione um cliente e adicione ao menos um produto.");
      return;
    }
    const novoPedido = {
      empresa_id: "emp-01", // Mudar dinamicamente no futuro se houver multi-empresa
      cliente_id: clienteSelecionado.id,
      origem: 1, // Exemplo: 1 para "Manual" no C# (dependendo do Enum do backend)
      valor_total_pedido: valorTotalManual,
      observacao_negociacao: "Criado manualmente pelo operador.",
      itemsDetalhados: itensManuais
    };

    try {
      // Descomente a linha abaixo quando a rota de criação de pedido estiver 100% no C#
      // await api.post('/api/pedidos', novoPedido);
      
      // Simulação local imediata (UX) enquanto aguarda
      setPedidos([{ ...novoPedido, id: Date.now().toString(), status: 'preparando', clienteNome: clienteSelecionado.nome_ou_razao_social, codigo_pedido_formatado: 'MAN-NOVO' }, ...pedidos]);
      setIsManualOpen(false);
      setItensManuais([]);
      setClienteSelecionado(null);
      setBuscaCliente('');
      alert("Pedido manual criado com sucesso!");
    } catch (erro) {
      console.error("Erro ao salvar pedido manual:", erro);
      alert("Ocorreu um erro ao salvar o pedido no banco de dados.");
    }
  };

  const handleAbrirTriagem = (pedido) => {
    setPedidoSelecionado(pedido);
    setActiveTabTriagem('comercial');
    setIsTriagemOpen(true);
  };

  const handleAprovarOrcamento = async () => {
    if (window.confirm('Deseja aprovar este orçamento e enviá-lo para a fila de produção?')) {
      try {
        // Descomente a linha abaixo quando a rota de aprovação estiver 100% no C#
        // await api.put(`/api/pedidos/${pedidoSelecionado.id}/aprovar`);

        // Atualiza a tela imediatamente (Otimista)
        setPedidos(prev => prev.map(p => 
          p.id === pedidoSelecionado.id 
            ? { ...p, status: 'preparando', status_logistica: 'preparando' } 
            : p
        ));
        setIsTriagemOpen(false);
        setPedidoSelecionado(null);
      } catch (erro) {
        console.error("Erro ao aprovar o pedido:", erro);
        alert("Falha na comunicação com o servidor ao aprovar.");
      }
    }
  };

  return (
    <div className="p-8 space-y-6 bg-slate-50/50 dark:bg-slate-950/50 min-h-screen">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <ShoppingCart className="text-amber-500" /> Gestão Orçamentária
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Esteira de pedidos Híbrida (App B2B e Lançamentos Manuais).</p>
        </div>
        <button 
          onClick={() => setIsManualOpen(true)}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <Plus size={20} /> Novo Orçamento Manual
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-col lg:flex-row gap-4 items-center bg-white p-3 rounded-2xl shadow-sm border border-slate-200 print:hidden">
        <div className="flex items-center gap-3 flex-1 w-full pl-2">
          <Search className="text-slate-400 shrink-0" size={20} />
          <input 
            type="text" 
            placeholder="Filtrar por cliente, código ou data..." 
            className="w-full p-2 outline-none text-slate-700 font-medium text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 w-full lg:w-auto border-t lg:border-t-0 lg:border-l border-slate-200 pt-3 lg:pt-0 lg:pl-4">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <Calendar size={16} className="text-slate-400" />
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">De</span>
              <input 
                type="date" 
                className="bg-transparent text-xs font-bold text-slate-700 outline-none"
                value={dataInicio}
                onChange={e => setDataInicio(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1 border-l border-slate-300 pl-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Até</span>
              <input 
                type="date" 
                className="bg-transparent text-xs font-bold text-slate-700 outline-none"
                value={dataFim}
                onChange={e => setDataFim(e.target.value)}
              />
            </div>
          </div>

          <select 
            className="p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-700 font-bold text-sm cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="TODOS">Todos os Orçamentos</option>
            <option value="AGUARDANDO">Aguardando Validação</option>
            <option value="PREPARACAO">Em Preparação (Fábrica)</option>
            <option value="CONCLUIDO">Concluídos (Entregues)</option>
          </select>
        </div>
      </div>

      {/* Tabela de Pedidos */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print:hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold select-none">
                <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('codigo_pedido_formatado')}>
                  <div className="flex items-center gap-2">PEDIDO / ORIGEM <ArrowUpDown size={14} /></div>
                </th>
                <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('data_criacao')}>
                  <div className="flex items-center gap-2">DATA <ArrowUpDown size={14} /></div>
                </th>
                <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('clienteNome')}>
                  <div className="flex items-center gap-2">CLIENTE / RESUMO <ArrowUpDown size={14} /></div>
                </th>
                <th className="p-4 text-center cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('status')}>
                  <div className="flex items-center justify-center gap-2">STATUS FILA <ArrowUpDown size={14} /></div>
                </th>
                <th className="p-4 text-center">AÇÃO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {processedOrders.map(pedido => (
                <tr key={pedido.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-slate-800 bg-slate-100 inline-block px-2 py-0.5 rounded text-xs">{pedido.codigo_pedido_formatado}</p>
                    <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{pedido.origem}</p>
                  </td>
                  <td className="p-4 font-bold text-slate-600 text-xs">
                    {formatDate(pedido.data_criacao)}
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-slate-800 text-sm">{pedido.clienteNome}</p>
                    <p className="text-xs font-medium text-slate-400 mt-0.5 truncate max-w-sm">{pedido.resumo}</p>
                  </td>
                  <td className="p-4 text-center">
                    {pedido.status === 'aguardando_validacao' && (
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">Aguardando Validação</span>
                    )}
                    {pedido.status === 'preparando' && (
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">Em Preparação</span>
                    )}
                    {(pedido.status === 'concluido' || pedido.status === 'entregue') && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">Concluído</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => handleAbrirTriagem(pedido)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-indigo-600 hover:bg-indigo-50 font-bold rounded-xl transition-colors text-xs cursor-pointer border border-transparent hover:border-indigo-100"
                    >
                      <Eye size={16} /> Triagem
                    </button>
                  </td>
                </tr>
              ))}
              {processedOrders.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-slate-400 font-semibold flex flex-col items-center gap-3">
                    <AlertCircle size={32} className="text-slate-300" />
                    Nenhum orçamento encontrado com estes filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: TRIAGEM (VISÃO COMERCIAL E LOGÍSTICA COM IMPRESSÃO ISOLADA) */}
      {/* ========================================================================= */}
      {isTriagemOpen && pedidoSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm print:fixed print:inset-0 print:bg-white print:z-[99999] print:block">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh] print:max-h-none print:w-full print:h-full print:border-none print:shadow-none print:rounded-none">
            
            {/* CABEÇALHO DO MODAL E DO DOCUMENTO IMPRESSO */}
            <div className="p-6 border-b border-slate-200 flex justify-between items-start bg-slate-50 print:bg-white print:border-b-2 print:border-slate-800 print:pb-6 print:mb-6">
              <div>
                <h1 className="hidden print:block text-2xl font-black text-amber-500 uppercase tracking-tight mb-6">
                  EMPRESA <span className="text-slate-800">A CASEIRA</span>
                </h1>
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                  {activeTabTriagem === 'logistica' ? 'Ordem de Produção (OP) - ' : 'Orçamento '} 
                  {pedidoSelecionado.codigo_pedido_formatado}
                  <span className="text-[10px] font-bold uppercase bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md print:hidden">
                    {pedidoSelecionado.origem}
                  </span>
                </h2>
                <p className="text-slate-600 font-bold mt-1 text-lg print:text-base">{pedidoSelecionado.clienteNome}</p>
                <p className="text-xs text-slate-400 mt-1">Data de Emissão: {formatDate(pedidoSelecionado.data_criacao)}</p>
              </div>
              <button onClick={() => setIsTriagemOpen(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full cursor-pointer transition-colors print:hidden">
                <X size={20} />
              </button>
            </div>

            {/* ABAS (OCULTAS NA IMPRESSÃO) */}
            <div className="flex border-b border-slate-200 px-6 pt-2 bg-slate-50 print:hidden">
              <button 
                onClick={() => setActiveTabTriagem('comercial')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${activeTabTriagem === 'comercial' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                <Store size={16} /> Visão Comercial
              </button>
              <button 
                onClick={() => setActiveTabTriagem('logistica')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${activeTabTriagem === 'logistica' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                <Factory size={16} /> Visão Logística
              </button>
            </div>

            {/* CORPO DA TABELA */}
            <div className="p-6 bg-white overflow-y-auto flex-1 print:overflow-visible">
              <table className="w-full text-left border-collapse print:border print:border-slate-200">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-400 font-black print:bg-slate-100 print:text-slate-600">
                    
                    {/* CABEÇALHOS CONDICIONAIS */}
                    {activeTabTriagem === 'comercial' ? (
                      <>
                        <th className="pb-3 print:p-3">Produto</th>
                        <th className="pb-3 print:p-3 text-center">Qtd</th>
                        <th className="pb-3 print:p-3 text-right">Preço Unit.</th>
                        <th className="pb-3 print:p-3 text-right">Subtotal</th>
                      </>
                    ) : (
                      <>
                        <th className="pb-3 print:p-3">Produto Solicitado</th>
                        <th className="pb-3 print:p-3 text-center">Unidades</th>
                        <th className="pb-3 print:p-3 text-center">Mesas Necessárias</th>
                        <th className="pb-3 print:p-3 text-center">Caixas a Fechar</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {(pedidoSelecionado.itemsDetalhados || [])
                    .filter(item => activeTabTriagem === 'comercial' || item.eh_fabricacao_propria)
                    .map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 print:border-b print:border-slate-100">
                      
                      {/* LINHAS CONDICIONAIS */}
                      {activeTabTriagem === 'comercial' ? (
                        <>
                          <td className="py-3 font-bold text-slate-700 print:p-3">{item.nome}</td>
                          <td className="py-3 text-center font-black text-slate-800 print:p-3 bg-slate-50 print:bg-transparent">{item.quantidade}</td>
                          <td className="py-3 text-right text-slate-500 font-semibold print:p-3">{formatCurrency(item.precoUnitario)}</td>
                          <td className="py-3 text-right font-black text-slate-800 print:p-3">{formatCurrency(item.quantidade * item.precoUnitario)}</td>
                        </>
                      ) : (
                        <>
                          <td className="py-3 font-bold text-slate-700 print:p-3">{item.nome}</td>
                          <td className="py-3 text-center font-black text-slate-800 print:p-3">{item.quantidade} un</td>
                          <td className="py-3 text-center font-bold text-indigo-600 print:p-3 bg-indigo-50/30 print:bg-transparent">
                            {Math.ceil(item.quantidade / capacidadePorMesa)} mesa(s)
                          </td>
                          <td className="py-3 text-center font-black text-slate-800 print:p-3">
                            {calcularCaixas(item.nome, item.quantidade)} cx
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* TOTAL (APENAS COMERCIAL) */}
              {activeTabTriagem === 'comercial' && (
                <div className="mt-4 pt-4 flex justify-end">
                  <div className="text-right bg-slate-50 px-8 py-4 rounded-xl border border-slate-200 print:border-none print:p-0 print:mt-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Valor Total</p>
                    <p className="text-3xl font-black text-amber-500">{formatCurrency(pedidoSelecionado.valor_total_pedido)}</p>
                  </div>
                </div>
              )}

              {/* ASSINATURAS (APENAS LOGÍSTICA / IMPRESSÃO) */}
              {activeTabTriagem === 'logistica' && (
                <div className="hidden print:flex justify-between items-end mt-24 px-12">
                  <div className="text-center w-64">
                    <div className="border-t border-slate-400 mb-2"></div>
                    <p className="text-xs font-bold text-slate-600 uppercase">Visto - Responsável PCP</p>
                  </div>
                  <div className="text-center w-64">
                    <div className="border-t border-slate-400 mb-2"></div>
                    <p className="text-xs font-bold text-slate-600 uppercase">Visto - Expedição</p>
                  </div>
                </div>
              )}
            </div>

            {/* RODAPÉ DO MODAL (OCULTO NA IMPRESSÃO) */}
            <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-between items-center rounded-b-2xl print:hidden">
              
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setActiveTabTriagem('logistica');
                    setTimeout(() => window.print(), 300);
                  }}
                  className="flex items-center gap-2 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 font-bold text-sm transition-colors cursor-pointer px-4 py-2 rounded-xl border border-indigo-200 shadow-sm"
                >
                  <Printer size={18} /> Imprimir OP (Fábrica)
                </button>

                <button 
                  onClick={() => {
                    setActiveTabTriagem('comercial');
                    setTimeout(() => window.print(), 300);
                  }}
                  className="flex items-center gap-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-bold text-sm transition-colors cursor-pointer px-4 py-2 rounded-xl border border-emerald-200 shadow-sm"
                >
                  <Printer size={18} /> Imprimir OP Total
                </button>
              </div>
              
              {pedidoSelecionado.status === 'aguardando_validacao' && (
                <button 
                  onClick={handleAprovarOrcamento}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 size={20} /> Aprovar Orçamento
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: NOVO ORÇAMENTO MANUAL */}
      {/* ========================================================================= */}
      {isManualOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm print:hidden">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden border border-slate-200 flex flex-col max-h-[95vh]">
            
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <ShoppingCart className="text-amber-500" /> Novo Lançamento Manual
              </h2>
              <button onClick={() => setIsManualOpen(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 bg-white overflow-y-auto flex-1 space-y-6">
              
              <div className="relative">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">1. Selecionar Cliente</label>
                {clienteSelecionado ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div>
                      <p className="font-bold text-emerald-800">{clienteSelecionado.nome_fantasia || clienteSelecionado.nome_ou_razao_social}</p>
                      <p className="text-xs text-emerald-600">{clienteSelecionado.documento}</p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button 
                        onClick={handlePuxarUltimoPedido} 
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1 text-indigo-700 bg-white border border-indigo-200 hover:bg-indigo-50 p-2 rounded-lg transition-colors cursor-pointer font-bold text-xs"
                      >
                        <RefreshCw size={14} /> Repetir Último Pedido
                      </button>
                      <button 
                        onClick={() => setClienteSelecionado(null)} 
                        className="flex-1 sm:flex-none text-emerald-700 bg-white border border-emerald-200 hover:bg-emerald-100 p-2 rounded-lg transition-colors cursor-pointer font-bold text-xs"
                      >
                        Trocar Cliente
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <input 
                      type="text" 
                      placeholder="Comece a digitar o nome fantasia, razão social..." 
                      className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm font-medium"
                      value={buscaCliente}
                      onChange={(e) => {
                        setBuscaCliente(e.target.value);
                        setShowClienteDropdown(true);
                      }}
                      onFocus={() => setShowClienteDropdown(true)}
                    />
                    {showClienteDropdown && buscaCliente && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {clientesFiltrados.length > 0 ? (
                          clientesFiltrados.map(cliente => (
                            <div 
                              key={cliente.id}
                              className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0"
                              onClick={() => {
                                setClienteSelecionado(cliente);
                                setShowClienteDropdown(false);
                                setBuscaCliente('');
                              }}
                            >
                              <p className="font-bold text-slate-800 text-sm">{cliente.nome_fantasia || cliente.nome_ou_razao_social}</p>
                              <p className="text-xs text-slate-500">{cliente.documento}</p>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-sm text-slate-500 font-medium">Nenhum cliente encontrado.</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="relative pt-4 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">2. Inserir Produtos</label>
                <div className="flex flex-col md:flex-row gap-3 items-start">
                  
                  <div className="flex-1 w-full relative">
                    <input 
                      type="text" 
                      placeholder="Buscar por nome ou SKU..." 
                      className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm font-medium"
                      value={produtoSelecionado ? produtoSelecionado.descricao : buscaProduto}
                      onChange={(e) => {
                        if (produtoSelecionado) setProdutoSelecionado(null);
                        setBuscaProduto(e.target.value);
                        setShowProdutoDropdown(true);
                      }}
                      onFocus={() => setShowProdutoDropdown(true)}
                    />
                    {showProdutoDropdown && buscaProduto && !produtoSelecionado && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {produtosFiltrados.length > 0 ? (
                          produtosFiltrados.map(prod => (
                            <div 
                              key={prod.id}
                              className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0"
                              onClick={() => {
                                setProdutoSelecionado(prod);
                                setShowProdutoDropdown(false);
                              }}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-bold text-slate-800 text-sm">{prod.descricao}</p>
                                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">{prod.codigo_comercial}</p>
                                </div>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded ${prod.eh_fabricacao_propria ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'}`}>
                                  {prod.eh_fabricacao_propria ? 'Fábrica' : 'Revenda'}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-sm text-slate-500 font-medium">Nenhum produto encontrado.</div>
                        )}
                      </div>
                    )}
                  </div>

                  <select 
                    className="p-3 bg-white border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm font-bold text-slate-700 cursor-pointer w-full md:w-32"
                    value={tabelaPreco}
                    onChange={(e) => setTabelaPreco(e.target.value)}
                  >
                    <option value="atacado">Atacado</option>
                    <option value="lojista">Lojista</option>
                    <option value="varejo">Varejo</option>
                  </select>

                  <div className="w-full md:w-28 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">R$</span>
                    <input 
                      type="number" 
                      step="0.01"
                      min="0"
                      title="Você pode alterar este valor"
                      className="p-3 pl-8 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm font-bold w-full bg-amber-50/30"
                      value={precoEditavel}
                      onChange={(e) => setPrecoEditavel(e.target.value)}
                    />
                  </div>

                  <input 
                    type="number" 
                    min="1"
                    title="Quantidade"
                    className="p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm font-bold w-full md:w-20 text-center"
                    value={qtdProduto}
                    onChange={(e) => setQtdProduto(e.target.value)}
                  />

                  <button 
                    onClick={handleAddProduto}
                    disabled={!produtoSelecionado}
                    className="p-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer w-full md:w-auto px-6 whitespace-nowrap"
                  >
                    Incluir
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4">
                  <h3 className="text-xs font-black uppercase text-emerald-800 mb-3 flex items-center gap-2">
                    <Factory size={16} /> Fabricação Própria (PCP)
                  </h3>
                  <div className="space-y-2">
                    {itensManuais.filter(i => i.eh_fabricacao_propria).map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl border border-emerald-100 shadow-sm">
                        <div className="flex-1">
                          <p className="font-bold text-slate-700 text-sm truncate pr-2">{item.nome}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{item.quantidade}x {formatCurrency(item.precoUnitario)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-black text-slate-800">{formatCurrency(item.quantidade * item.precoUnitario)}</span>
                          <button onClick={() => removerItemManual(itensManuais.indexOf(item))} className="text-rose-400 hover:text-rose-600 cursor-pointer p-1">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {itensManuais.filter(i => i.eh_fabricacao_propria).length === 0 && (
                      <p className="text-xs text-emerald-600/60 font-medium italic text-center py-4">Nenhum item adicionado.</p>
                    )}
                  </div>
                </div>

                <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-4">
                  <h3 className="text-xs font-black uppercase text-purple-800 mb-3 flex items-center gap-2">
                    <Store size={16} /> Revenda de Terceiros
                  </h3>
                  <div className="space-y-2">
                    {itensManuais.filter(i => !i.eh_fabricacao_propria).map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl border border-purple-100 shadow-sm">
                        <div className="flex-1">
                          <p className="font-bold text-slate-700 text-sm truncate pr-2">{item.nome}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{item.quantidade}x {formatCurrency(item.precoUnitario)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-black text-slate-800">{formatCurrency(item.quantidade * item.precoUnitario)}</span>
                          <button onClick={() => removerItemManual(itensManuais.indexOf(item))} className="text-rose-400 hover:text-rose-600 cursor-pointer p-1">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {itensManuais.filter(i => !i.eh_fabricacao_propria).length === 0 && (
                      <p className="text-xs text-purple-600/60 font-medium italic text-center py-4">Nenhum item adicionado.</p>
                    )}
                  </div>
                </div>

              </div>
            </div>

            <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-between items-center rounded-b-2xl">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Previsto:</span>
                <span className="text-3xl font-black text-amber-500">{formatCurrency(valorTotalManual)}</span>
              </div>
              <button 
                onClick={handleSalvarPedidoManual}
                className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                Salvar Pedido Manual
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}