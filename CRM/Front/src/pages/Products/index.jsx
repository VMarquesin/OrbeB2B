import { useState, useMemo } from 'react';
import { 
  Package, Search, Plus, Edit3, Archive, RotateCcw, 
  Factory, Store, X 
} from 'lucide-react';
import { mockProducts } from '../../services/mockData';

export default function GestaoProdutos() {
  const [produtos, setProdutos] = useState(mockProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroOrigem, setFiltroOrigem] = useState('TODOS'); // 'TODOS', 'PROPRIO', 'TERCEIRO'
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [produtoEmEdicao, setProdutoEmEdicao] = useState(null);

  const [formData, setFormData] = useState({
    codigo_comercial: '',
    descricao: '',
    embalagem: '',
    fornecedor_origem: 'Fabricação Interna',
    eh_fabricacao_propria: true,
    preco_atacado: '',
    preco_lojista: '',
    preco_varejo: '',
    estoque: ''
  });

  const formatCurrency = (val) => {
    return Number(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const metricas = useMemo(() => {
    const total = produtos.length;
    const proprios = produtos.filter(p => p.eh_fabricacao_propria).length;
    const terceiros = produtos.filter(p => !p.eh_fabricacao_propria).length;
    const inativos = produtos.filter(p => !p.esta_ativo).length;
    return { total, proprios, terceiros, inativos };
  }, [produtos]);

  // BLINDAGEM ANTI TELA BRANCA APLICADA AQUI
  const produtosFiltrados = useMemo(() => {
    return produtos.filter(p => {
      const termo = (searchTerm || '').toLowerCase();
      const desc = (p.descricao || '').toLowerCase();
      const cod = (p.codigo_comercial || '').toLowerCase();
      
      const matchSearch = desc.includes(termo) || cod.includes(termo);

      let matchOrigem = true;
      if (filtroOrigem === 'PROPRIO') matchOrigem = p.eh_fabricacao_propria;
      if (filtroOrigem === 'TERCEIRO') matchOrigem = !p.eh_fabricacao_propria;

      return matchSearch && matchOrigem;
    });
  }, [produtos, searchTerm, filtroOrigem]);

  const handleNovoProduto = () => {
    setProdutoEmEdicao(null);
    setFormData({
      codigo_comercial: '',
      descricao: '',
      embalagem: '',
      fornecedor_origem: 'Fabricação Interna',
      eh_fabricacao_propria: true,
      preco_atacado: '',
      preco_lojista: '',
      preco_varejo: '',
      estoque: ''
    });
    setIsModalOpen(true);
  };

  const handleEditarProduto = (prod) => {
    setProdutoEmEdicao(prod);
    setFormData({
      codigo_comercial: prod.codigo_comercial,
      descricao: prod.descricao,
      embalagem: prod.embalagem || '',
      fornecedor_origem: prod.fornecedor_origem || '',
      eh_fabricacao_propria: prod.eh_fabricacao_propria,
      preco_atacado: prod.preco_atacado,
      preco_lojista: prod.preco_lojista || '',
      preco_varejo: prod.preco_varejo,
      estoque: prod.estoque || 0
    });
    setIsModalOpen(true);
  };

  const handleSalvarProduto = (e) => {
    e.preventDefault();
    if (!formData.descricao || !formData.codigo_comercial) {
      alert("Descrição e Código Comercial (SKU) são obrigatórios.");
      return;
    }

    const produtoPayload = {
      ...formData,
      preco_atacado: Number(formData.preco_atacado),
      preco_lojista: Number(formData.preco_lojista || 0),
      preco_varejo: Number(formData.preco_varejo),
      estoque: Number(formData.estoque || 0)
    };

    if (produtoEmEdicao) {
      setProdutos(prev => prev.map(p => p.id === produtoEmEdicao.id ? { ...p, ...produtoPayload } : p));
    } else {
      const novoProduto = {
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
        empresa_id: "emp-01",
        categoria_id: "cat-doces-01",
        ...produtoPayload,
        esta_ativo: true
      };
      setProdutos(prev => [novoProduto, ...prev]);
    }

    setIsModalOpen(false);
  };

  const handleToggleStatus = (id) => {
    setProdutos(prev => prev.map(p => p.id === id ? { ...p, esta_ativo: !p.esta_ativo } : p));
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
            {produtosFiltrados.map(prod => (
              <tr key={prod.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">{prod.codigo_comercial}</span>
                    <p className="font-bold text-slate-800">{prod.descricao}</p>
                  </div>
                  {prod.embalagem && <p className="text-xs text-slate-400 mt-0.5">Embalagem: {prod.embalagem}</p>}
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold ${prod.eh_fabricacao_propria ? 'bg-emerald-50 text-emerald-700' : 'bg-purple-50 text-purple-700'}`}>
                    {prod.eh_fabricacao_propria ? <Factory size={14} /> : <Store size={14} />}
                    {prod.eh_fabricacao_propria ? 'Próprio' : 'Terceiro'}
                  </span>
                </td>
                <td className="p-4 text-right font-bold text-slate-700">{formatCurrency(prod.preco_atacado)}</td>
                <td className="p-4 text-right text-slate-600">{formatCurrency(prod.preco_lojista)}</td>
                <td className="p-4 text-right text-slate-700 font-black">{formatCurrency(prod.preco_varejo)}</td>
                <td className="p-4 text-center">
                  {prod.esta_ativo ? (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">Ativo</span>
                  ) : (
                    <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full">Inativo</span>
                  )}
                </td>
                <td className="p-4 text-center">
                  <div className="flex justify-center items-center gap-2">
                    <button 
                      onClick={() => handleEditarProduto(prod)} 
                      className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      title="Editar Produto"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      onClick={() => handleToggleStatus(prod.id)} 
                      className={`p-2 rounded-lg transition-colors cursor-pointer ${prod.esta_ativo ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                      title={prod.esta_ativo ? "Inativar Produto" : "Ativar Produto"}
                    >
                      {prod.esta_ativo ? <Archive size={16} /> : <RotateCcw size={16} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
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
                    value={formData.codigo_comercial}
                    onChange={e => setFormData({...formData, codigo_comercial: e.target.value})}
                    placeholder="Ex: COD-044"
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm mt-1 font-mono font-medium" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Embalagem *</label>
                  <input 
                    type="text" required maxLength="50"
                    value={formData.embalagem}
                    onChange={e => setFormData({...formData, embalagem: e.target.value})}
                    placeholder="Ex: Caixa 20un"
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm mt-1 font-medium" 
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase">Descrição / Nome do Produto *</label>
                  <input 
                    type="text" required maxLength="255"
                    value={formData.descricao}
                    onChange={e => setFormData({...formData, descricao: e.target.value})}
                    placeholder="Ex: Doce de Leite Artesanal"
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm mt-1 font-medium" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Origem *</label>
                  <select 
                    value={formData.eh_fabricacao_propria ? 'proprio' : 'terceiro'}
                    onChange={e => setFormData({
                      ...formData, 
                      eh_fabricacao_propria: e.target.value === 'proprio',
                      fornecedor_origem: e.target.value === 'proprio' ? 'Fabricação Interna' : 'Fornecedor Terceirizado'
                    })}
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm mt-1 font-medium bg-white cursor-pointer"
                  >
                    <option value="proprio">Próprio (PCP)</option>
                    <option value="terceiro">Terceiro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Fornecedor / Origem</label>
                  <input 
                    type="text" maxLength="150"
                    value={formData.fornecedor_origem}
                    onChange={e => setFormData({...formData, fornecedor_origem: e.target.value})}
                    placeholder="Ex: Interno ou Nome do Fornecedor"
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm mt-1 font-medium" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Preço Atacado (R$) *</label>
                  <input 
                    type="number" step="0.01" min="0" required
                    value={formData.preco_atacado}
                    onChange={e => setFormData({...formData, preco_atacado: e.target.value})}
                    placeholder="0.00"
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm mt-1 font-medium" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Preço Lojista (R$)</label>
                  <input 
                    type="number" step="0.01" min="0"
                    value={formData.preco_lojista}
                    onChange={e => setFormData({...formData, preco_lojista: e.target.value})}
                    placeholder="0.00"
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm mt-1 font-medium" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Preço Varejo (R$) *</label>
                  <input 
                    type="number" step="0.01" min="0" required
                    value={formData.preco_varejo}
                    onChange={e => setFormData({...formData, preco_varejo: e.target.value})}
                    placeholder="0.00"
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm mt-1 font-medium" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Estoque Inicial</label>
                  <input 
                    type="number" min="0"
                    value={formData.estoque}
                    onChange={e => setFormData({...formData, estoque: e.target.value})}
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

    </div>
  );
}