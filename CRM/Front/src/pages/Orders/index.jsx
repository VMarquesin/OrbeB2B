import { useState, useMemo, useEffect } from 'react';
import { 
  Search, Calendar, Eye, X, Printer, CheckCircle2, 
  ShoppingCart, ArrowUpDown, Plus, Factory, Store,
  Trash2, AlertCircle, RefreshCw, Loader2
} from 'lucide-react';
import api from '../../services/api';
import { listarPedidosCRM, criarPedidoManualCRM, obterDetalhePedidoCRM, atualizarStatusPedidoLogistica } from '../../services/pedidosService';

export default function GestaoOrcamentaria() {
  const [pedidos, setPedidos] = useState([]);
  const [loadingPedidos, setLoadingPedidos] = useState(true);
  const [erroPedidos, setErroPedidos] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'data_criacao', direction: 'desc' });

  const [isTriagemOpen, setIsTriagemOpen] = useState(false);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [loadingTriagem, setLoadingTriagem] = useState(false);
  const [erroTriagem, setErroTriagem]       = useState('');
  const [activeTabTriagem, setActiveTabTriagem] = useState('comercial'); 
  
  const [isConfirmacaoOpen, setIsConfirmacaoOpen] = useState(false);
  const [isConfirmacaoConclusaoOpen, setIsConfirmacaoConclusaoOpen] = useState(false);
  const [loadingAprovacao, setLoadingAprovacao] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [isManualOpen, setIsManualOpen] = useState(false);
  const [modoPF, setModoPF]             = useState(false); // true = Pessoa Física sem cadastro
  const [nomePF, setNomePF]             = useState('');    // nome livre do comprador PF
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
  // ESTADOS DO MODAL DE PEDIDO MANUAL
  // =========================================================================
  const [loadingSalvar, setLoadingSalvar] = useState(false);
  const [erroManual, setErroManual]       = useState('');

  // =========================================================================
  // OPÇÕES DO MODAL (CARREGADAS DA API)
  // =========================================================================
  const [clientesOptions, setClientesOptions] = useState([]);
  const [produtosOptions, setProdutosOptions] = useState([]);

  // Carrega lista de pedidos reais da API
  const carregarPedidos = async () => {
    setLoadingPedidos(true);
    setErroPedidos('');
    try {
      const data = await listarPedidosCRM();
      setPedidos(data ?? []);
    } catch (err) {
      setErroPedidos(err.mensagemNormalizada ?? 'Erro ao carregar pedidos.');
    } finally {
      setLoadingPedidos(false);
    }
  };

  useEffect(() => {
    carregarPedidos();
  }, []);

  // Carrega clientes e produtos para o modal manual
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [resCli, resProd] = await Promise.all([
          api.get('/api/clientes').catch(() => ({ data: [] })),
          api.get('/api/produtos').catch(() => ({ data: [] }))
        ]);
        
        const cliMapped = (resCli.data || []).map(c => ({
          ...c,
          id: c.id || c.Id,
          nome_ou_razao_social: c.nome_ou_razao_social || c.NomeOuRazaoSocial || c.nomeOuRazaoSocial || '',
          nome_fantasia: c.nome_fantasia || c.NomeFantasia || c.nomeFantasia || '',
          documento: c.documento || c.Documento || ''
        }));

        const prodMapped = (resProd.data || []).map(p => ({
          ...p,
          id: p.id || p.Id,
          descricao: p.descricao || p.Descricao || '',
          codigo_comercial: p.codigo_comercial || p.CodigoComercial || p.codigoComercial || '',
          eh_fabricacao_propria: p.eh_fabricacao_propria ?? p.EhFabricacaoPropria ?? true,
          preco_atacado: p.preco_atacado ?? p.PrecoAtacado ?? 0,
          preco_lojista: p.preco_lojista ?? p.PrecoLojista ?? 0,
          preco_varejo: p.preco_varejo ?? p.PrecoVarejo ?? 0
        }));

        setClientesOptions(cliMapped);
        setProdutosOptions(prodMapped);
      } catch (e) {
        console.error('Erro ao carregar opções do modal manual:', e);
      }
    };
    fetchOptions();
  }, []);

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
    // Converte direto para o fuso horário local, sem manipular minutos artificialmente
    return new Date(isoString).toLocaleDateString('pt-BR');
  };

  const formatarStatusLogistica = (pedido) => {
    if (!pedido) return { label: '—', color: 'text-slate-500 bg-slate-100 border-slate-200', value: 'desconhecido' };
    
    const rawStatus = pedido.statusLogistica ?? pedido.status_logistica ?? pedido.status;
    const strStatus = String(rawStatus).toLowerCase();

    // 0 = AguardandoValidacao
    if (rawStatus === 0 || strStatus.includes('aguardando')) {
      return { label: 'Aguardando Validação', color: 'text-amber-700 bg-amber-50 border-amber-200', value: 'aguardando' };
    }
    // 1 = Faturado, 2 = EmSeparacao (Tratados como Em Preparação na UI)
    if (rawStatus === 1 || rawStatus === 2 || strStatus.includes('prepar') || strStatus.includes('separacao')) {
      return { label: 'Em Preparação', color: 'text-indigo-700 bg-indigo-50 border-indigo-200', value: 'preparacao' };
    }
    // 3 = Enviado, 4 = Entregue
    if (rawStatus === 3 || rawStatus === 4 || strStatus.includes('conclu') || strStatus.includes('entreg')) {
      return { label: 'Concluído', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', value: 'concluido' };
    }
    
    return { label: '—', color: 'text-slate-500 bg-slate-100 border-slate-200', value: 'desconhecido' };
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  // Helper para normalizar o campo de status vindo da API (camelCase ou snake_case)
  const getStatus = (pedido) =>
    pedido.statusLogistica || pedido.status_logistica || pedido.status || '';

  const getOrigem = (pedido) =>
    pedido.origem || pedido.Origem || 'APP';

  const processedOrders = useMemo(() => {
    let filtered = pedidos.filter(o => {
      const termo = (searchTerm || '').toLowerCase();
      const clienteNome = (o.clienteNome || o.nomeCliente || '').toLowerCase();
      const codigo = (o.codigoPedidoFormatado || o.codigo_pedido_formatado || '').toLowerCase();
      const dataOrigem = o.dataCriacao || o.data_criacao;
      const dataFormatada = dataOrigem ? new Date(dataOrigem).toLocaleDateString('pt-BR') : '';

      const matchesSearch = clienteNome.includes(termo) || codigo.includes(termo) || dataFormatada.includes(termo);

      const statusAtual = getStatus(o);
      let matchesStatus = true;
      if (statusFilter === 'AGUARDANDO') matchesStatus = statusAtual === 'aguardando_validacao' || statusAtual === 'AguardandoValidacao';
      if (statusFilter === 'PREPARACAO') matchesStatus = statusAtual === 'preparando' || statusAtual === 'Preparando';
      if (statusFilter === 'CONCLUIDO') matchesStatus = statusAtual === 'concluido' || statusAtual === 'entregue' || statusAtual === 'Concluido' || statusAtual === 'Entregue';

      const dataRegistro = dataOrigem ? new Date(dataOrigem).getTime() : 0;
      const limiteInicio = dataInicio ? new Date(dataInicio + 'T00:00:00').getTime() : 0;
      const limiteFim = dataFim ? new Date(dataFim + 'T23:59:59').getTime() : Infinity;
      const matchesTempo = dataRegistro >= limiteInicio && dataRegistro <= limiteFim;

      return matchesSearch && matchesStatus && matchesTempo;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const campoA = sortConfig.key === 'clienteNome'
          ? (a.clienteNome || a.nomeCliente || '')
          : sortConfig.key === 'codigo_pedido_formatado'
            ? (a.codigoPedidoFormatado || a.codigo_pedido_formatado || '')
            : sortConfig.key === 'data_criacao'
              ? (a.dataCriacao || a.data_criacao || '')
              : (a[sortConfig.key] || '');
        const campoB = sortConfig.key === 'clienteNome'
          ? (b.clienteNome || b.nomeCliente || '')
          : sortConfig.key === 'codigo_pedido_formatado'
            ? (b.codigoPedidoFormatado || b.codigo_pedido_formatado || '')
            : sortConfig.key === 'data_criacao'
              ? (b.dataCriacao || b.data_criacao || '')
              : (b[sortConfig.key] || '');
        let valA = campoA;
        let valB = campoB;
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
    return clientesOptions.filter(c => {
      const nomeOuRazao = (c.nome_ou_razao_social || '').toLowerCase();
      const fantasia = (c.nome_fantasia || '').toLowerCase();
      return nomeOuRazao.includes(termo) || fantasia.includes(termo);
    });
  }, [buscaCliente, clientesOptions]);

  const produtosFiltrados = useMemo(() => {
    if (!buscaProduto) return [];
    const termo = (buscaProduto || '').toLowerCase();
    return produtosOptions.filter(p => {
      const desc = (p.descricao || '').toLowerCase();
      const cod = (p.codigo_comercial || '').toLowerCase();
      return desc.includes(termo) || cod.includes(termo);
    });
  }, [buscaProduto, produtosOptions]);

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
    // Validação: precisa de cliente B2B selecionado OU nome PF preenchido
    if (!modoPF && !clienteSelecionado) {
      setErroManual('Selecione um cliente ou ative o modo Pessoa Física.');
      return;
    }
    if (modoPF && !nomePF.trim()) {
      setErroManual('Informe o nome do comprador.');
      return;
    }
    if (itensManuais.length === 0) {
      setErroManual('Adicione ao menos um produto.');
      return;
    }

    setLoadingSalvar(true);
    setErroManual('');

    // Monta o payload exatamente como o C# espera.
    // clienteId = null → C# usa o construtor de PF (sem JOIN com clientes).
    const payload = {
      clienteId: modoPF ? null : clienteSelecionado.id,
      observacaoNegociacao: modoPF
        ? `Venda PF - ${nomePF.trim()} | Criado manualmente pelo operador CRM.`
        : 'Criado manualmente pelo operador CRM.',
      itens: itensManuais.map(item => ({
        produtoId: item.produtoId,
        quantidade: Number(item.quantidade),
        precoUnitario: Number(item.precoUnitario),
        ehFabricacaoPropriaSnapshot: item.eh_fabricacao_propria,
      })),
    };

    try {
      await criarPedidoManualCRM(payload);

      // Recarrega a lista para refletir o pedido criado no banco
      const pedidosAtualizados = await listarPedidosCRM();
      setPedidos(pedidosAtualizados ?? []);

      // Reseta o modal
      setIsManualOpen(false);
      setItensManuais([]);
      setClienteSelecionado(null);
      setBuscaCliente('');
      setModoPF(false);
      setNomePF('');
    } catch (err) {
      setErroManual(err.mensagemNormalizada ?? 'Erro ao salvar pedido. Tente novamente.');
    } finally {
      setLoadingSalvar(false);
    }
  };

  const handleAbrirTriagem = async (pedidoResumo) => {
    setErroTriagem('');
    setLoadingTriagem(true);
    setIsTriagemOpen(true);
    setPedidoSelecionado(null); // limpa o anterior enquanto carrega
    setActiveTabTriagem('comercial');

    try {
      const detalhe = await obterDetalhePedidoCRM(pedidoResumo.id);
      setPedidoSelecionado(detalhe);
    } catch (err) {
      setErroTriagem(err.mensagemNormalizada ?? 'Erro ao carregar detalhes do pedido.');
    } finally {
      setLoadingTriagem(false);
    }
  };

  const handleAprovarOrcamento = () => {
    setIsConfirmacaoOpen(true);
  };

  const handleConfirmarAprovacao = async () => {
    setLoadingAprovacao(true);
    try {
      // 2 = EmSeparacao / Em Preparação na API
      await atualizarStatusPedidoLogistica(pedidoSelecionado.id, 2);
      
      // Recarrega a tabela de pedidos consultando a API novamente
      await carregarPedidos();
      
      setIsConfirmacaoOpen(false);
      setIsTriagemOpen(false);
      setPedidoSelecionado(null);
      
      // Show Toast
      setToastMessage('Orçamento aprovado e enviado para a fila de produção!');
      setTimeout(() => setToastMessage(''), 4000);
      
    } catch (err) {
      setErroTriagem(err.mensagemNormalizada ?? 'Erro ao aprovar o pedido. Tente novamente.');
      setIsConfirmacaoOpen(false);
    } finally {
      setLoadingAprovacao(false);
    }
  };

  const handleConcluirPedido = () => {
    setIsConfirmacaoConclusaoOpen(true);
  };

  const handleConfirmarConclusao = async () => {
    setLoadingAprovacao(true);
    try {
      // 4 = Entregue / Concluído na API
      await atualizarStatusPedidoLogistica(pedidoSelecionado.id, 4);
      
      await carregarPedidos();
      
      setIsConfirmacaoConclusaoOpen(false);
      setIsTriagemOpen(false);
      setPedidoSelecionado(null);
      
      setToastMessage('Pedido marcado como Concluído!');
      setTimeout(() => setToastMessage(''), 4000);
      
    } catch (err) {
      setErroTriagem(err.mensagemNormalizada ?? 'Erro ao concluir o pedido. Tente novamente.');
      setIsConfirmacaoConclusaoOpen(false);
    } finally {
      setLoadingAprovacao(false);
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

              {/* Loading skeleton */}
              {loadingPedidos && (
                <tr>
                  <td colSpan="5" className="p-12 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <Loader2 size={32} className="animate-spin text-amber-400" />
                      <span className="text-sm font-semibold">Carregando pedidos...</span>
                    </div>
                  </td>
                </tr>
              )}

              {/* Erro ao carregar */}
              {!loadingPedidos && erroPedidos && (
                <tr>
                  <td colSpan="5" className="p-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-semibold">
                      <AlertCircle size={18} />
                      {erroPedidos}
                    </div>
                  </td>
                </tr>
              )}

              {/* Dados reais */}
              {!loadingPedidos && !erroPedidos && processedOrders.map(pedido => {
                const codigo = pedido.codigoPedidoFormatado || pedido.codigo_pedido_formatado || '—';
                const nomeCliente = pedido.clienteNome || pedido.nomeCliente || '—';
                const resumo = pedido.resumo || '';
                const dataOrigem = pedido.dataCriacao || pedido.data_criacao;
                const origem = getOrigem(pedido);
                const statusInfo = formatarStatusLogistica(pedido);

                return (
                  <tr key={pedido.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-slate-800 bg-slate-100 inline-block px-2 py-0.5 rounded text-xs">{codigo}</p>
                      <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{origem}</p>
                    </td>
                    <td className="p-4 font-bold text-slate-600 text-xs">
                      {formatDate(dataOrigem)}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800 text-sm">{nomeCliente}</p>
                      {resumo && <p className="text-xs font-medium text-slate-400 mt-0.5 truncate max-w-sm">{resumo}</p>}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
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
                );
              })}

              {!loadingPedidos && !erroPedidos && processedOrders.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-slate-400 font-semibold">
                    <div className="flex flex-col items-center gap-3">
                      <AlertCircle size={32} className="text-slate-300" />
                      Nenhum orçamento encontrado com estes filtros.
                    </div>
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
      {isTriagemOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm print:fixed print:inset-0 print:bg-white print:z-[99999] print:block">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh] print:max-h-none print:w-full print:h-full print:border-none print:shadow-none print:rounded-none">

            {/* CABEÇALHO */}
            <div className="p-6 border-b border-slate-200 flex justify-between items-start bg-slate-50 print:bg-white print:border-b-2 print:border-slate-800 print:pb-6 print:mb-6">
              <div>
                <h1 className="hidden print:block text-2xl font-black text-amber-500 uppercase tracking-tight mb-6">
                  EMPRESA <span className="text-slate-800">A CASEIRA</span>
                </h1>
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                  {activeTabTriagem === 'logistica' ? 'Ordem de Produção (OP) - ' : 'Orçamento '}
                  {loadingTriagem ? '...' : (pedidoSelecionado?.codigoPedidoFormatado || '—')}
                  {pedidoSelecionado && (
                    <span className="text-[10px] font-bold uppercase bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md print:hidden">
                      {pedidoSelecionado.origem}
                    </span>
                  )}
                </h2>
                <p className="text-slate-600 font-bold mt-1 text-lg print:text-base">
                  {pedidoSelecionado?.nomeCliente ?? '—'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Data de Emissão: {pedidoSelecionado ? formatDate(pedidoSelecionado.dataCriacao) : '—'}
                </p>
              </div>
              <button onClick={() => setIsTriagemOpen(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full cursor-pointer transition-colors print:hidden">
                <X size={20} />
              </button>
            </div>

            {/* ABAS */}
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

            {/* CORPO */}
            <div className="p-6 bg-white overflow-y-auto flex-1 print:overflow-visible">

              {/* Loading */}
              {loadingTriagem && (
                <div className="flex flex-col items-center gap-3 text-slate-400 py-12">
                  <Loader2 size={32} className="animate-spin text-amber-400" />
                  <span className="text-sm font-semibold">Carregando detalhes do pedido...</span>
                </div>
              )}

              {/* Erro */}
              {erroTriagem && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-semibold">
                  <AlertCircle size={18} /> {erroTriagem}
                </div>
              )}

              {/* Dados reais */}
              {!loadingTriagem && !erroTriagem && pedidoSelecionado && (() => {
                const itens = pedidoSelecionado.itens ?? [];
                const itensFiltrados = activeTabTriagem === 'comercial'
                  ? itens
                  : itens.filter(i => i.ehFabricacaoPropria);

                return (
                  <table className="w-full text-left border-collapse print:border print:border-slate-200">
                    <thead>
                      <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-400 font-black print:bg-slate-100 print:text-slate-600">
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
                      {itensFiltrados.length === 0 && (
                        <tr>
                          <td colSpan="4" className="py-8 text-center text-slate-400 italic">
                            Nenhum item {activeTabTriagem === 'logistica' ? 'de fabricação própria ' : ''}encontrado.
                          </td>
                        </tr>
                      )}
                      {itensFiltrados.map((item, index) => (
                        <tr key={item.id ?? index} className="hover:bg-slate-50/50 print:border-b print:border-slate-100">
                          {activeTabTriagem === 'comercial' ? (
                            <>
                              <td className="py-3 font-bold text-slate-700 print:p-3">{item.nomeProduto}</td>
                              <td className="py-3 text-center font-black text-slate-800 print:p-3 bg-slate-50 print:bg-transparent">{item.quantidade}</td>
                              <td className="py-3 text-right text-slate-500 font-semibold print:p-3">{formatCurrency(item.precoUnitario)}</td>
                              <td className="py-3 text-right font-black text-slate-800 print:p-3">{formatCurrency(item.quantidade * item.precoUnitario)}</td>
                            </>
                          ) : (
                            <>
                              <td className="py-3 font-bold text-slate-700 print:p-3">{item.nomeProduto}</td>
                              <td className="py-3 text-center font-black text-slate-800 print:p-3">{item.quantidade} un</td>
                              <td className="py-3 text-center font-bold text-indigo-600 print:p-3 bg-indigo-50/30 print:bg-transparent">
                                {Math.ceil(item.quantidade / capacidadePorMesa)} mesa(s)
                              </td>
                              <td className="py-3 text-center font-black text-slate-800 print:p-3">
                                {calcularCaixas(item.nomeProduto, item.quantidade)} cx
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                );
              })()}

              {/* TOTAL (APENAS COMERCIAL) */}
              {!loadingTriagem && activeTabTriagem === 'comercial' && pedidoSelecionado && (
                <div className="mt-4 pt-4 flex justify-end">
                  <div className="text-right bg-slate-50 px-8 py-4 rounded-xl border border-slate-200 print:border-none print:p-0 print:mt-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Valor Total</p>
                    <p className="text-3xl font-black text-amber-500">{formatCurrency(pedidoSelecionado.valorTotalPedido)}</p>
                  </div>
                </div>
              )}

              {/* ASSINATURAS (LOGÍSTICA / IMPRESSÃO) */}
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

            {/* RODAPÉ */}
            <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-between items-center rounded-b-2xl print:hidden">
              <div className="flex gap-3">
                <button
                  onClick={() => { setActiveTabTriagem('logistica'); setTimeout(() => window.print(), 300); }}
                  className="flex items-center gap-2 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 font-bold text-sm transition-colors cursor-pointer px-4 py-2 rounded-xl border border-indigo-200 shadow-sm"
                >
                  <Printer size={18} /> Imprimir OP (Fábrica)
                </button>
                <button
                  onClick={() => { setActiveTabTriagem('comercial'); setTimeout(() => window.print(), 300); }}
                  className="flex items-center gap-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-bold text-sm transition-colors cursor-pointer px-4 py-2 rounded-xl border border-emerald-200 shadow-sm"
                >
                  <Printer size={18} /> Imprimir OP Total
                </button>
              </div>

              {pedidoSelecionado && formatarStatusLogistica(pedidoSelecionado).value === 'aguardando' && (
                <button 
                  onClick={handleAprovarOrcamento}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 size={20} /> Aprovar Orçamento
                </button>
              )}

              {pedidoSelecionado && formatarStatusLogistica(pedidoSelecionado).value === 'preparacao' && (
                <button 
                  onClick={handleConcluirPedido}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 size={20} /> Concluir Separação
                </button>
              )}

              {pedidoSelecionado && formatarStatusLogistica(pedidoSelecionado).value === 'concluido' && (
                <div className="px-6 py-2.5 bg-slate-100 text-slate-500 font-bold rounded-xl border border-slate-200 flex items-center gap-2">
                  <CheckCircle2 size={20} /> Pedido Concluído
                </div>
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
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">1. Selecionar Cliente</label>
                  {/* Toggle Pessoa Física */}
                  <button
                    type="button"
                    onClick={() => {
                      setModoPF(prev => !prev);
                      setClienteSelecionado(null);
                      setBuscaCliente('');
                      setNomePF('');
                    }}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      modoPF
                        ? 'bg-orange-500 text-white border-orange-600'
                        : 'bg-white text-slate-600 border-slate-300 hover:border-orange-400'
                    }`}
                  >
                    👤 {modoPF ? 'Modo: Pessoa Física' : 'Pessoa Física (sem cadastro)'}
                  </button>
                </div>

                {/* Modo Pessoa Física: campo de nome livre */}
                {modoPF ? (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl space-y-3">
                    <p className="text-xs text-orange-700 font-semibold">
                      ⚠️ Pedido de Pessoa Física — não vinculado a nenhum cliente cadastrado. O nome ficará registrado na observação.
                    </p>
                    <input
                      type="text"
                      placeholder="Nome completo do comprador..."
                      className="w-full p-3 border border-orange-300 rounded-xl outline-none focus:border-orange-500 text-sm font-medium bg-white"
                      value={nomePF}
                      onChange={e => setNomePF(e.target.value)}
                    />
                  </div>
                ) : clienteSelecionado ? (
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

            <div className="p-6 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 rounded-b-2xl">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Previsto:</span>
                  <span className="text-3xl font-black text-amber-500">{formatCurrency(valorTotalManual)}</span>
                </div>
                {erroManual && (
                  <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                    <AlertCircle size={14} /> {erroManual}
                  </p>
                )}
              </div>
              <button 
                onClick={handleSalvarPedidoManual}
                disabled={loadingSalvar}
                className="flex items-center gap-2 px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loadingSalvar ? <><Loader2 size={18} className="animate-spin" /> Salvando...</> : 'Salvar Pedido Manual'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CONFIRMAÇÃO DE APROVAÇÃO */}
      {/* ========================================================================= */}
      {isConfirmacaoOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm print:hidden">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-xl font-black text-slate-800">Confirmar Aprovação</h2>
              <p className="text-slate-500 font-medium text-sm">
                Tem certeza que deseja aprovar o orçamento <strong className="text-slate-700">{pedidoSelecionado?.codigoPedidoFormatado}</strong> e enviá-lo para a fila de produção (Fábrica)?
              </p>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setIsConfirmacaoOpen(false)}
                disabled={loadingAprovacao}
                className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarAprovacao}
                disabled={loadingAprovacao}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
              >
                {loadingAprovacao ? (
                  <><Loader2 size={18} className="animate-spin" /> Aprovando...</>
                ) : (
                  'Confirmar Aprovação'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: CONFIRMAÇÃO DE CONCLUSÃO */}
      {/* ========================================================================= */}
      {isConfirmacaoConclusaoOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm print:hidden">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-xl font-black text-slate-800">Confirmar Conclusão</h2>
              <p className="text-slate-500 font-medium text-sm">
                Tem certeza que deseja marcar o pedido <strong className="text-slate-700">{pedidoSelecionado?.codigoPedidoFormatado}</strong> como Concluído / Entregue?
              </p>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setIsConfirmacaoConclusaoOpen(false)}
                disabled={loadingAprovacao}
                className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarConclusao}
                disabled={loadingAprovacao}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
              >
                {loadingAprovacao ? (
                  <><Loader2 size={18} className="animate-spin" /> Concluindo...</>
                ) : (
                  'Confirmar Conclusão'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST DE SUCESSO (SNACKBAR) */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-lg border border-emerald-700 flex items-center gap-3 animate-bounce">
          <CheckCircle2 size={24} />
          <span className="font-bold">{toastMessage}</span>
        </div>
      )}

    </div>
  );
}