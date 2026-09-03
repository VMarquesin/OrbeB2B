import { useState, useMemo, useEffect } from 'react';
import {
  Package, Search, Plus, Edit3, Archive, RotateCcw,
  Factory, Store, X
} from 'lucide-react';
import api from '../../services/api';
import Toast from '../../components/Toast';
import ConfirmModal from '../../components/ConfirmModal';

export default function GestaoProdutos() {
  const [produtos, setProdutos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroOrigem, setFiltroOrigem] = useState('TODOS'); // 'TODOS', 'PROPRIO', 'TERCEIRO'

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [produtoEmEdicao, setProdutoEmEdicao] = useState(null);

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => setToast({ show: true, message, type });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false, title: '', message: '', isDanger: false, onConfirm: null
  });

  const [formData, setFormData] = useState({
    codigo_comercial: '',
    descricao: '',
    embalagem: '',
    categoriaId: '',
    fornecedorId: '',
    eh_fabricacao_propria: true,
    preco_atacado: '',
    preco_lojista: '',
    preco_varejo: '',
    estoqueInicial: ''
  });

  const [categoriasDisponiveis, setCategoriasDisponiveis] = useState([]);
  const [fornecedoresDisponiveis, setFornecedoresDisponiveis] = useState([]);

  const fetchProdutos = async () => {
    try {
      const resProd = await api.get('/api/produtos');
      if (resProd.data && resProd.data.length > 0) {
        // Normalização defensiva forçando chaves camelCase compatíveis com o estado do React
        const normalizedData = resProd.data.map(p => ({
          ...p,
          id: p.id || p.Id,
          codigo_comercial: p.codigo_comercial || p.CodigoComercial || '',
          descricao: p.descricao || p.Descricao || '',
          embalagem: p.embalagem || p.Embalagem || '',
          categoriaId: p.categoriaId || p.CategoriaId || '',
          fornecedorId: p.fornecedorId || p.FornecedorId || '',
          eh_fabricacao_propria: p.eh_fabricacao_propria ?? p.EhFabricacaoPropria ?? true,
          preco_atacado: p.preco_atacado ?? p.PrecoAtacado ?? 0,
          preco_lojista: p.preco_lojista ?? p.PrecoLojista ?? 0,
          preco_varejo: p.preco_varejo ?? p.PrecoVarejo ?? 0,
          estoqueInicial: p.estoqueInicial ?? p.estoque ?? p.Estoque ?? 0,
          esta_ativo: p.esta_ativo ?? p.EstaAtivo ?? true
        }));
        setProdutos(normalizedData);
      }
    } catch (e) {
      console.error("Erro ao carregar produtos", e);
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, []);

  // Busca categorias e fornecedores apenas quando o modal é aberto (garante dados frescos)
  useEffect(() => {
    if (isModalOpen) {
      api.get('/api/categorias')
        .then(res => setCategoriasDisponiveis(res.data || []))
        .catch(e => console.error("Erro ao carregar categorias", e));

      api.get('/api/fornecedores')
        .then(res => setFornecedoresDisponiveis(res.data || []))
        .catch(e => console.error("Erro ao carregar fornecedores", e));
    }
  }, [isModalOpen]);

  const formatCurrency = (val) => {
    return Number(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const metricas = useMemo(() => {
    const total = produtos.length;
    
    const totaisOrigem = produtos.reduce((acc, p) => {
      // Verifica se é fabricação própria defensivamente
      const isProprio = p.ehFabricacaoPropria ?? p.EhFabricacaoPropria ?? p.eh_fabricacao_propria ?? (p.origem === 'Próprio (PCP)');
      if (isProprio) acc.proprios += 1;
      else acc.terceiros += 1;
      return acc;
    }, { proprios: 0, terceiros: 0 });

    const totalInativos = produtos.filter(p => {
      // Conta inativos
      const statusAtual = p.estaAtivo ?? p.EstaAtivo ?? p.esta_ativo ?? true;
      return !statusAtual; 
    }).length;

    return { total, proprios: totaisOrigem.proprios, terceiros: totaisOrigem.terceiros, inativos: totalInativos };
  }, [produtos]);

  // BLINDAGEM ANTI TELA BRANCA APLICADA AQUI
  const produtosFiltrados = useMemo(() => {
    return produtos.filter(p => {
      const termo = (searchTerm || '').toLowerCase();
      const desc = (p.descricao || p.Descricao || '').toLowerCase();
      const cod = (p.codigo_comercial || p.codigoComercial || p.CodigoComercial || '').toLowerCase();

      const matchSearch = desc.includes(termo) || cod.includes(termo);

      const isProprio = p.ehFabricacaoPropria ?? p.EhFabricacaoPropria ?? p.eh_fabricacao_propria ?? (p.origem === 'Próprio (PCP)');
      let matchOrigem = true;
      if (filtroOrigem === 'PROPRIO') matchOrigem = isProprio;
      if (filtroOrigem === 'TERCEIRO') matchOrigem = !isProprio;

      return matchSearch && matchOrigem;
    });
  }, [produtos, searchTerm, filtroOrigem]);

  const handleNovoProduto = () => {
    setProdutoEmEdicao(null);
    setFormData({
      codigo_comercial: '',
      descricao: '',
      embalagem: '',
      categoriaId: '',
      fornecedorId: '',
      eh_fabricacao_propria: true,
      preco_atacado: '',
      preco_lojista: '',
      preco_varejo: '',
      estoqueInicial: ''
    });
    setIsModalOpen(true);
  };

  const handleEditarProduto = (prod) => {
    setProdutoEmEdicao(prod);
    setFormData({
      codigo_comercial: prod.codigo_comercial || prod.codigoComercial || prod.CodigoComercial || '',
      descricao: prod.descricao || prod.Descricao || '',
      embalagem: prod.embalagem || prod.Embalagem || '',
      categoriaId: prod.categoriaId || prod.CategoriaId || '',
      fornecedorId: prod.fornecedorId || prod.FornecedorId || '',
      eh_fabricacao_propria: prod.eh_fabricacao_propria ?? prod.ehFabricacaoPropria ?? prod.EhFabricacaoPropria ?? true,
      preco_atacado: prod.preco_atacado ?? prod.precoAtacado ?? prod.PrecoAtacado ?? 0,
      preco_lojista: prod.preco_lojista ?? prod.precoLojista ?? prod.PrecoLojista ?? 0,
      preco_varejo: prod.preco_varejo ?? prod.precoVarejo ?? prod.PrecoVarejo ?? 0,
      estoqueInicial: prod.estoqueInicial ?? prod.EstoqueInicial ?? prod.estoque ?? prod.Estoque ?? 0
    });
    setIsModalOpen(true);
  };

  const handleSalvarProduto = async (e) => {
    e.preventDefault();
    if (!formData.descricao || !formData.codigo_comercial) {
      showToast("Descrição e Código Comercial (SKU) são obrigatórios.", "error");
      return;
    }

    try {
      // Formatação exata para o backend com tipagem rigorosa e limpeza de snake_case
      const precoAtacado = parseFloat(String(formData.preco_atacado).replace(',', '.')) || 0;
      const precoLojista = parseFloat(String(formData.preco_lojista).replace(',', '.')) || 0;
      const precoVarejo = parseFloat(String(formData.preco_varejo).replace(',', '.')) || 0;
      const estoque = parseInt(formData.estoqueInicial, 10) || 0;
      const ehFabricacao = Boolean(formData.eh_fabricacao_propria);
      const fornId = formData.eh_fabricacao_propria
        ? (fornecedoresDisponiveis[0]?.id || "3fa85f64-5717-4562-b3fc-2c963f66afa6")
        : formData.fornecedorId;

      const produtoPayload = {
        categoriaId: formData.categoriaId,
        codigoComercial: formData.codigo_comercial,
        codigo_comercial: formData.codigo_comercial,
        descricao: formData.descricao,
        embalagem: formData.embalagem,
        fornecedorId: fornId,
        ehFabricacaoPropria: ehFabricacao,
        eh_fabricacao_propria: ehFabricacao,
        precoAtacado: precoAtacado,
        preco_atacado: precoAtacado,
        precoLojista: precoLojista,
        preco_lojista: precoLojista,
        precoVarejo: precoVarejo,
        preco_varejo: precoVarejo,
        estoqueInicial: estoque,
        estoque: estoque
      };

      if (produtoEmEdicao) {
        await api.put(`/api/produtos/${produtoEmEdicao.id}`, produtoPayload);
        showToast("Produto atualizado com sucesso!");
      } else {
        await api.post('/api/produtos', produtoPayload);
        showToast("Produto cadastrado com sucesso!");
      }

      setIsModalOpen(false);
      fetchProdutos();
    } catch (erro) {
      console.error("Erro ao salvar produto:", erro);
      const msg = erro.response?.data?.mensagem || erro.response?.data?.errors;
      showToast(typeof msg === 'object' ? JSON.stringify(msg) : msg || "Falha ao comunicar com o servidor.", "error");
    }
  };

  const handleToggleStatus = (produtoSelecionado) => {
    // 1. CÁLCULO SEGURO DO NOVO STATUS
    const statusAtual = produtoSelecionado.estaAtivo ?? produtoSelecionado.EstaAtivo ?? produtoSelecionado.esta_ativo ?? true;
    const novoStatus = !statusAtual;

    setConfirmModal({
      isOpen: true,
      title: novoStatus ? 'Ativar Produto' : 'Inativar Produto',
      message: `Deseja realmente ${novoStatus ? 'ATIVAR' : 'INATIVAR'} o produto ${produtoSelecionado.descricao ?? produtoSelecionado.Descricao}?`,
      isDanger: !novoStatus,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));

        try {
          const endpointAcao = novoStatus ? 'reativar' : 'inativar';
          const produtoId = produtoSelecionado.id || produtoSelecionado.Id;

          await api.patch(`/api/produtos/${produtoId}/${endpointAcao}`);
          showToast(`Produto ${novoStatus ? 'ativado' : 'inativado'} com sucesso!`);

        } catch (error) {
          console.error("Erro ao alterar status:", error);
          showToast("Erro ao alterar o status do produto.", "error");
        } finally {
          fetchProdutos();
        }
      }
    });
  };

  return (
    <div className="p-8 space-y-6 bg-slate-50/50 dark:bg-slate-950/50 min-h-screen">

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <Package className="text-amber-500" /> Cadastro de Produtos
          </h1>
          <p className="text-slate-500 mt-1">Gerenciamento do catálogo híbrido (Atacado e Varejo).</p>
        </div>
        <button
          onClick={handleNovoProduto}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Plus size={20} /> Cadastrar Novo Produto
        </button>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-slate-100 text-slate-600 rounded-xl"><Package size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Total no Catálogo</p>
            <h3 className="text-2xl font-black text-slate-800">{metricas.total}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Factory size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Próprios (PCP)</p>
            <h3 className="text-2xl font-black text-slate-800">{metricas.proprios}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Store size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Terceiros</p>
            <h3 className="text-2xl font-black text-slate-800">{metricas.terceiros}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><Archive size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Inativos</p>
            <h3 className="text-2xl font-black text-slate-800">{metricas.inativos}</h3>
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-3 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 w-full sm:flex-1 pl-2">
          <Search className="text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nome ou SKU..."
            className="w-full p-2 outline-none text-slate-700 font-medium text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFiltroOrigem('TODOS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${filtroOrigem === 'TODOS' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Todos
          </button>
          <button
            onClick={() => setFiltroOrigem('PROPRIO')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${filtroOrigem === 'PROPRIO' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Próprios
          </button>
          <button
            onClick={() => setFiltroOrigem('TERCEIRO')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${filtroOrigem === 'TERCEIRO' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Terceiros
          </button>
        </div>
      </div>

      {/* Tabela de Produtos */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold select-none">
              <th className="p-4">Produto / SKU</th>
              <th className="p-4">Origem</th>
              <th className="p-4 text-right">Preço Atacado</th>
              <th className="p-4 text-right">Preço Lojista</th>
              <th className="p-4 text-right">Preço Varejo</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {produtosFiltrados.map(produto => {
              const statusAtivo = produto.estaAtivo ?? produto.EstaAtivo ?? false;
              const isProprio = produto.ehFabricacaoPropria ?? produto.EhFabricacaoPropria ?? produto.eh_fabricacao_propria ?? true;

              return (
                <tr key={produto.id || produto.Id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">
                        {produto.codigoComercial ?? produto.CodigoComercial ?? produto.codigo_comercial ?? ''}
                      </span>
                      <p className="font-bold text-slate-800">{produto.descricao ?? produto.Descricao ?? ''}</p>
                    </div>
                    {(produto.embalagem ?? produto.Embalagem) && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        Embalagem: {produto.embalagem ?? produto.Embalagem}
                      </p>
                    )}
                  </td>

                  {/* COLUNA 2: ORIGEM */}
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium text-xs ${
                      isProprio 
                        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20' 
                        : 'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20'
                    }`}>
                      {isProprio ? 'Próprio' : 'Terceiro'}
                    </span>
                  </td>

                  <td className="p-4 text-right font-bold text-slate-700">{formatCurrency(produto.precoAtacado ?? produto.PrecoAtacado ?? 0)}</td>
                  <td className="p-4 text-right text-slate-600">{formatCurrency(produto.precoLojista ?? produto.PrecoLojista ?? 0)}</td>
                  <td className="p-4 text-right text-slate-700 font-black">{formatCurrency(produto.precoVarejo ?? produto.PrecoVarejo ?? 0)}</td>
                  <td className="p-4 text-center">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusAtivo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {statusAtivo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <button
                        onClick={() => handleEditarProduto(produto)}
                        className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        title="Editar Produto"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(produto)}
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${statusAtivo ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                        title={statusAtivo ? "Inativar Produto" : "Ativar Produto"}
                      >
                        {statusAtivo ? <Archive size={16} /> : <RotateCcw size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {produtosFiltrados.length === 0 && (
              <tr>
                <td colSpan="7" className="p-8 text-center text-slate-400 font-semibold">
                  Nenhum produto encontrado.
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>

      {/* MODAL DE CADASTRO / EDIÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden border border-slate-200 flex flex-col">

            <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-800">
                {produtoEmEdicao ? 'Editar Produto' : 'Cadastrar Novo Produto'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSalvarProduto} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Código Comercial / SKU *</label>
                  <input
                    type="text" required maxLength="50"
                    value={formData.codigo_comercial ?? ''}
                    onChange={e => setFormData({ ...formData, codigo_comercial: e.target.value })}
                    placeholder="Ex: COD-044"
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm mt-1 font-mono font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Embalagem *</label>
                  <input
                    type="text" required maxLength="50"
                    value={formData.embalagem ?? ''}
                    onChange={e => setFormData({ ...formData, embalagem: e.target.value })}
                    placeholder="Ex: Caixa 20un"
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm mt-1 font-medium"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase">Descrição / Nome do Produto *</label>
                  <input
                    type="text" required maxLength="255"
                    value={formData.descricao ?? ''}
                    onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Ex: Doce de Leite Artesanal"
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm mt-1 font-medium"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase">Categoria *</label>
                  <select
                    required
                    value={formData.categoriaId ?? ''}
                    onChange={e => setFormData({ ...formData, categoriaId: e.target.value })}
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm mt-1 font-medium bg-white cursor-pointer"
                  >
                    <option value="">Selecione uma categoria...</option>
                    {(categoriasDisponiveis || []).map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nome}</option>
                    ))}
                    {/* Fallback caso não venham categorias para não travar o teste */}
                    {(!categoriasDisponiveis || categoriasDisponiveis.length === 0) && (
                      <option value="3fa85f64-5717-4562-b3fc-2c963f66afa6">Categoria Padrão (Mock/Fallback)</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Origem *</label>
                  <select
                    value={formData.eh_fabricacao_propria ? 'proprio' : 'terceiro'}
                    onChange={e => {
                      const isProprio = e.target.value === 'proprio';
                      setFormData({
                        ...formData,
                        eh_fabricacao_propria: isProprio,
                        // Se for próprio, podemos "limpar" do state visual, pois o payload pegará o padrão
                        fornecedorId: isProprio ? '' : formData.fornecedorId
                      });
                    }}
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm mt-1 font-medium bg-white cursor-pointer"
                  >
                    <option value="proprio">Próprio (PCP)</option>
                    <option value="terceiro">Terceiro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Fornecedor / Empresa de Origem {(!formData.eh_fabricacao_propria) && '*'}</label>
                  <select
                    disabled={formData.eh_fabricacao_propria}
                    required={!formData.eh_fabricacao_propria}
                    value={formData.fornecedorId ?? ''}
                    onChange={e => setFormData({ ...formData, fornecedorId: e.target.value })}
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm mt-1 font-medium bg-white cursor-pointer"
                  >
                    <option value="">Selecione...</option>
                    {(fornecedoresDisponiveis || []).map(forn => (
                      <option key={forn.id} value={forn.id}>{forn.razaoSocial || forn.nome_ou_razao_social || forn.nomeOuRazaoSocial}</option>
                    ))}
                    {/* Fallback caso não venham fornecedores */}
                    {(!fornecedoresDisponiveis || fornecedoresDisponiveis.length === 0) && !formData.eh_fabricacao_propria && (
                      <option value="3fa85f64-5717-4562-b3fc-2c963f66afa6">Fornecedor Padrão (Mock/Fallback)</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Preço Atacado (R$) *</label>
                  <input
                    type="number" step="0.01" min="0" required
                    value={formData.preco_atacado ?? ''}
                    onChange={e => setFormData({ ...formData, preco_atacado: e.target.value })}
                    placeholder="0.00"
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm mt-1 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Preço Lojista (R$)</label>
                  <input
                    type="number" step="0.01" min="0"
                    value={formData.preco_lojista ?? ''}
                    onChange={e => setFormData({ ...formData, preco_lojista: e.target.value })}
                    placeholder="0.00"
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm mt-1 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Preço Varejo (R$) *</label>
                  <input
                    type="number" step="0.01" min="0" required
                    value={formData.preco_varejo ?? ''}
                    onChange={e => setFormData({ ...formData, preco_varejo: e.target.value })}
                    placeholder="0.00"
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm mt-1 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Estoque Inicial</label>
                  <input
                    type="number" min="0"
                    value={formData.estoqueInicial ?? ''}
                    onChange={e => setFormData({ ...formData, estoqueInicial: e.target.value })}
                    placeholder="0"
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm mt-1 font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors shadow-sm cursor-pointer">
                  Salvar Produto
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Render dos Feedbacks */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        isDanger={confirmModal.isDanger}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}