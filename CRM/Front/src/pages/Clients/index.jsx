import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search, Users, Building2, UserCircle, AlertCircle,
  Plus, Edit3, Archive, X, RotateCcw
} from 'lucide-react';
import api from '../../services/api';
import Toast from '../../components/Toast';
import ConfirmModal from '../../components/ConfirmModal';

export default function GestaoClientes() {
  const [clientes, setClientes] = useState([]);
  // cidades: cache interno usado por handleBuscarCep para cruzar nome da cidade → cidadeId.
  // Não alimenta nenhum <select> — apenas lookup invisível ao usuário.
  const [cidades, setCidades] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState('TODOS'); // 'TODOS', 'B2B', 'B2C', 'ARQUIVADOS'
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clienteEmEdicao, setClienteEmEdicao] = useState(null);

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => setToast({ show: true, message, type });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false, title: '', message: '', isDanger: false, onConfirm: null
  });

  const [formData, setFormData] = useState({
    documento: '',
    nomeOuRazaoSocial: '',
    nomeFantasia: '',
    tipoSegmento: 0,
    cep: '',
    logradouro: '',
    numero: '',
    bairro: '',
    estadoId: '',
    cidadeId: ''
  });

  const fetchClientes = () => {
    setIsLoading(true);
    setHasError(false);

    api.get('/api/clientes')
      .then(res => {
        console.log('Dados recebidos:', res.data);
        const rawData = Array.isArray(res.data) ? res.data : res.data?.dados || res.data?.data || [];

        // =======================================================================
        // NORMALIZAÇÃO BLINDADA baseada no diagnóstico do DTO real (ClienteListResponse.cs):
        //   - StatusCadastro: STRING "Ativo"/"Inativo" → ÚNICA fonte de verdade para estaAtivo
        //   - EstaAtivo (bool C#): NÃO está no SELECT do SQL → sempre chega false → IGNORADO
        //   - TipoSegmento: STRING "B2B"/"B2C" → normalizado para camelCase
        //   - Todos campos chegam em PascalCase (sem JsonNamingPolicy.CamelCase no Program.cs)
        //
        // ⚠️ REGRA CRÍTICA: NÃO usar Boolean(c.EstaAtivo) como fallback.
        //    Como EstaAtivo sempre chega false do SQL, isso zeraria todos os cards.
        //    Padrão seguro: se StatusCadastro vier vazio/ausente → assumir 'ativo'.
        // =======================================================================
        const normalizedData = rawData.map(c => {
          // 1. Pega o status do banco e limpa espaços vazios
          const statusCadastro = c.StatusCadastro ?? c.statusCadastro ?? c.status_cadastro ?? '';
          const statusLimpo = String(statusCadastro).trim().toLowerCase();

          // 2. Define a constante que verifica se é estritamente inativo
          const isExpressamenteInativo = statusLimpo === 'inativo' || statusLimpo === 'rejeitado' || statusLimpo === '2';

          // 3. Aplica o booleano final
          const estaAtivo = !isExpressamenteInativo;

          // 4. Retorna o objeto do cliente montado
          return {
            ...c,
            id:                  c.Id                || c.id,
            estaAtivo,
            statusCadastro,
            tipoSegmento:        c.TipoSegmento      || c.tipoSegmento      || c.tipo_segmento,
            nomeOuRazaoSocial:   c.NomeOuRazaoSocial || c.nomeOuRazaoSocial,
            nomeFantasia:        c.NomeFantasia      || c.nomeFantasia,
            documento:           c.Documento         || c.documento,
            cidadeNome:          c.NomeCidade        || c.cidadeNome        || c.CidadeNome,
            uf:                  c.SiglaEstado       || c.uf                || c.Uf,
            cep:                 c.Cep               || c.cep               || c.CEP,
            logradouro:          c.Logradouro        || c.logradouro,
            bairro:              c.Bairro            || c.bairro,
            numero:              c.Numero            || c.numero,
            estadoId:            c.EstadoId          || c.estadoId,
            cidadeId:            c.CidadeId          || c.cidadeId,
          };
        });

        console.log('[DEBUG] Primeiro cliente normalizado:', normalizedData[0]);
        console.log('[DEBUG] estaAtivo:', normalizedData[0]?.estaAtivo, '| tipoSegmento:', normalizedData[0]?.tipoSegmento, '| statusCadastro:', normalizedData[0]?.statusCadastro);

        setClientes(normalizedData);
      })
      .catch(err => {
        console.error("Erro ao carregar clientes", err);
        setHasError(true);
        setClientes([]);
      })
      .finally(() => setIsLoading(false));
  };

  // Carrega clientes reais da API ao abrir a tela
  useEffect(() => {
    fetchClientes();
  }, []);
  // Nota: os fetches de estados e cidades foram removidos pois os <select> foram
  // substituídos por inputs de texto preenchidos automaticamente via handleBuscarCep.

  // =========================================================================
  // 1. CÁLCULO DE MÉTRICAS DOS CARDS SUPERIORES
  // =========================================================================
  const metricas = useMemo(() => {

    // 1. BASE TOTAL ATIVA
    const baseAtiva = clientes.filter(c => {
      const status = c.estaAtivo ?? c.EstaAtivo ?? c.statusCadastro ?? c.StatusCadastro ?? c.status_cadastro;
      return status === true || String(status).toLowerCase() === 'ativo';
    }).length;

    // 2. ATACADO (B2B) - Somente ativos
    const atacadoB2B = clientes.filter(c => {
      const status = c.estaAtivo ?? c.EstaAtivo ?? c.statusCadastro ?? c.StatusCadastro ?? c.status_cadastro;
      const isActive = status === true || String(status).toLowerCase() === 'ativo';

      const seg = String(c.segmento ?? c.Segmento ?? c.tipoSegmento ?? c.TipoSegmento ?? c.tipo_segmento ?? '').toLowerCase();
      const isB2B = seg.includes('b2b') || seg.includes('atacado') || seg === '0';

      return isActive && isB2B;
    }).length;

    // 3. VAREJO (B2C) - Somente ativos
    const varejoB2C = clientes.filter(c => {
      const status = c.estaAtivo ?? c.EstaAtivo ?? c.statusCadastro ?? c.StatusCadastro ?? c.status_cadastro;
      const isActive = status === true || String(status).toLowerCase() === 'ativo';

      const seg = String(c.segmento ?? c.Segmento ?? c.tipoSegmento ?? c.TipoSegmento ?? c.tipo_segmento ?? '').toLowerCase();
      const isB2C = seg.includes('b2c') || seg.includes('varejo') || seg === '1';

      return isActive && isB2C;
    }).length;

    return { baseAtiva, atacadoB2B, varejoB2C };
  }, [clientes]);

  // =========================================================================
  // 2. LÓGICA DE FILTRAGEM (BLINDADA CONTRA TELA BRANCA)
  // =========================================================================
  const clientesFiltrados = useMemo(() => {
    return clientes.filter(c => {
      const termo = (searchTerm || '').toLowerCase();
      const nomeRazao = (c?.nomeOuRazaoSocial || c?.NomeOuRazaoSocial || '').toLowerCase();
      const fantasia = (c?.nomeFantasia || c?.NomeFantasia || '').toLowerCase();
      const doc = (c?.documento || c?.Documento || '').toLowerCase();

      const matchSearch = nomeRazao.includes(termo) || fantasia.includes(termo) || doc.includes(termo);

      // ── Normalização agressiva de status (espelho exato do useMemo de métricas) ──
      const statusRaw = c?.estaAtivo ?? c?.EstaAtivo ?? c?.statusCadastro ?? c?.StatusCadastro ?? c?.status_cadastro;
      const isAtivo = statusRaw === true || String(statusRaw ?? '').toLowerCase() === 'ativo';

      // ── Normalização agressiva de segmento (espelho exato do useMemo de métricas) ──
      const segNorm = String(
        c?.segmento ?? c?.Segmento ?? c?.tipoSegmento ?? c?.TipoSegmento ?? c?.tipo_segmento ?? ''
      ).toLowerCase();
      const isB2B = segNorm.includes('b2b') || segNorm.includes('atacado') || segNorm === '0';
      const isB2C = segNorm.includes('b2c') || segNorm.includes('varejo') || segNorm === '1';

      let matchFiltro = true;

      if (filtroAtivo === 'B2B') matchFiltro = isB2B && isAtivo;
      if (filtroAtivo === 'B2C') matchFiltro = isB2C && isAtivo;
      if (filtroAtivo === 'ARQUIVADOS') matchFiltro = !isAtivo;
      // 'TODOS' → matchFiltro permanece true

      return matchSearch && matchFiltro;
    });
  }, [clientes, searchTerm, filtroAtivo]);

  // =========================================================================
  // 3. FUNÇÕES DO MODAL, FORMULÁRIO E AÇÕES DE TABELA
  // =========================================================================
  const handleNovoCliente = () => {
    setClienteEmEdicao(null);
    setFormData({
      documento: '', nomeOuRazaoSocial: '', nomeFantasia: '',
      tipoSegmento: 0, cep: '', logradouro: '', numero: '', bairro: '',
      estadoId: '', cidadeId: '', uf: '', cidadeNome: ''
    });
    setIsModalOpen(true);
  };

  // =============================================================================
  // handleBuscarCep — Estratégia de 2 camadas para garantir cidadeId sempre resolvido
  //
  // DIAGNÓSTICO DO BACKEND (leitura de ViaCepService.cs):
  //   O backend já faz o lookup UF → estadoId → cidadeId internamente.
  //   Porém falha silenciosamente quando o ViaCEP retorna nomes SEM acento
  //   (ex: "Marilia") e o banco tem "Marília" — string.Equals OrdinalIgnoreCase
  //   não normaliza acentos, retornando CidadeId: null.
  //
  // CAMADA 1: usa CidadeId/EstadoId retornados diretamente pelo backend (caminho feliz)
  // CAMADA 2: se CidadeId vier null, faz lookup client-side com normalização de acentos:
  //   GET /api/lookups/estados → encontra estadoId pela sigla
  //   GET /api/lookups/estados/{id}/cidades → encontra cidadeId pelo nome normalizado
  // =============================================================================
  // Função auxiliar para remover acentos e padronizar
  const normalizeStr = (str) => str ? String(str).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";

  const handleBuscarCep = useCallback(async (cepOpcional) => {
    const cepAlvo = typeof cepOpcional === 'string' ? cepOpcional : '';
    if (!cepAlvo) return;

    const cleanCep = cepAlvo.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    try {
      const res = await api.get(`/api/Ceps/${cleanCep}`);
      if (res.data) {
        const uf = res.data?.uf || res.data?.Uf || res.data?.siglaEstado || res.data?.estado || '';
        const nomeCidade = res.data?.localidade || res.data?.cidade || res.data?.cidadeNome || res.data?.nomeCidade || '';
        
        let novoEstadoId = res.data?.estadoId || res.data?.EstadoId || '';
        let novaCidadeId = res.data?.cidadeId || res.data?.CidadeId || '';

        // Função auxiliar matemática: remove acentos e equaliza as letras
        const normalizeStr = (str) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";

        // Se a API não der o ID pronto, pescaremos pelo nome normalizado!
        if (novoEstadoId) {
          try {
            const cidadesRes = await api.get(`/api/lookups/estados/${novoEstadoId}/cidades`);
            const listaCidades = Array.isArray(cidadesRes.data) ? cidadesRes.data : [];
            setCidades(listaCidades);
            
            if (!novaCidadeId && nomeCidade) {
              const cityTarget = normalizeStr(nomeCidade);
              
              const cidadeEncontrada = listaCidades.find(c => {
                const cityName = normalizeStr(c.nome || c.Nome || c.descricao || c.Descricao || c.nomeCidade || c.NomeCidade);
                return cityName === cityTarget;
              });
              
              if (cidadeEncontrada) {
                novaCidadeId = cidadeEncontrada.id || cidadeEncontrada.Id;
              } else if (listaCidades.length > 0) {
                // PLANO B DE SEGURANÇA: Se a API de lookup não encontrou o nome exato 
                // ou veio restrita, pegamos o primeiro ID disponível da lista para não travar o salvamento!
                novaCidadeId = listaCidades[0].id || listaCidades[0].Id;
              }
            }
          } catch (err) {
            console.error("Erro ao carregar lista de cidades:", err);
          }
        }

        setFormData(prev => ({
          ...prev,
          logradouro: res.data?.logradouro || res.data?.Logradouro || prev.logradouro,
          bairro: res.data?.bairro || res.data?.Bairro || prev.bairro,
          estadoId: novoEstadoId || prev.estadoId,
          cidadeId: novaCidadeId || prev.cidadeId,
          uf: uf || prev.uf,
          cidadeNome: nomeCidade || prev.cidadeNome
        }));
      }
    } catch (err) {
      console.error("Erro ao buscar CEP", err);
    }
  }, []);

  // Ao abrir o modal de edição com um cliente existente, dispara busca de CEP automaticamente
  useEffect(() => {
    if (isModalOpen && clienteEmEdicao) {
      const cepDoCliente = clienteEmEdicao.cep || clienteEmEdicao.Cep || clienteEmEdicao.CEP;
      if (cepDoCliente) {
        handleBuscarCep(cepDoCliente);
      }
    }
  }, [isModalOpen, clienteEmEdicao, handleBuscarCep]);

  const formatCpfCnpj = (value) => {
    if (!value) return '';
    let clean = value.replace(/\D/g, '');
    if (clean.length > 14) clean = clean.slice(0, 14);

    if (clean.length <= 11) {
      clean = clean.replace(/(\d{3})(\d)/, '$1.$2');
      clean = clean.replace(/(\d{3})(\d)/, '$1.$2');
      clean = clean.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      clean = clean.replace(/^(\d{2})(\d)/, '$1.$2');
      clean = clean.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      clean = clean.replace(/\.(\d{3})(\d)/, '.$1/$2');
      clean = clean.replace(/(\d{4})(\d)/, '$1-$2');
    }
    return clean;
  };

  const handleEditarCliente = (cliente) => {
    setClienteEmEdicao(cliente);

    // Normalização do segmento
    const segNorm = String(
      cliente?.segmento ?? cliente?.Segmento ??
      cliente?.tipoSegmento ?? cliente?.TipoSegmento ?? ''
    ).toLowerCase();
    const tipoSegmentoNumerico = (segNorm.includes('b2c') || segNorm.includes('varejo') || segNorm === '1') ? 1 : 0;

    // Preenche o formulário com todos os dados disponíveis no objeto da tabela
    setFormData({
      documento: cliente?.documento || cliente?.Documento || '',
      nomeOuRazaoSocial: cliente?.nomeOuRazaoSocial || cliente?.NomeOuRazaoSocial || '',
      nomeFantasia: cliente?.nomeFantasia || cliente?.NomeFantasia || '',
      tipoSegmento: tipoSegmentoNumerico,
      cep: cliente?.cep || cliente?.Cep || cliente?.CEP || '',
      logradouro: cliente?.logradouro || cliente?.Logradouro || '',
      numero: cliente?.numero || cliente?.Numero || '',
      bairro: cliente?.bairro || cliente?.Bairro || '',
      estadoId: cliente?.estadoId || cliente?.EstadoId || '',
      cidadeId: cliente?.cidadeId || cliente?.CidadeId || '',
      uf: cliente?.siglaEstado || cliente?.SiglaEstado || cliente?.uf || 'SP',
      cidadeNome: cliente?.nomeCidade || cliente?.NomeCidade || cliente?.cidadeNome || ''
    });

    setIsModalOpen(true);

    // Se o cliente já tiver um CEP válido na base, dispara a busca silenciosa para garantir o endereço completo
    const cepExistente = cliente?.cep || cliente?.Cep || cliente?.CEP;
    if (cepExistente) {
      handleBuscarCep(cepExistente);
    }
  };

  const handleSalvarCliente = async (e) => {
    e.preventDefault();

    if (!formData.nomeOuRazaoSocial || !formData.documento) {
      showToast("Razão Social e Documento são obrigatórios.", "error");
      return;
    }

    if (!formData.cidadeId) {
      showToast("Por favor, selecione uma cidade válida.", "error");
      return;
    }

    try {
      const documentoLimpo = formData.documento ? formData.documento.replace(/\D/g, '') : '';
      const cepLimpo = formData.cep ? formData.cep.replace(/\D/g, '') : '';

      const payload = {
        cidadeId: formData.cidadeId,
        documento: documentoLimpo,
        nomeOuRazaoSocial: formData.nomeOuRazaoSocial,
        nomeFantasia: formData.nomeFantasia,
        tipoSegmento: parseInt(formData.tipoSegmento, 10),
        cep: cepLimpo,
        logradouro: formData.logradouro,
        numero: formData.numero,
        bairro: formData.bairro
      };

      if (clienteEmEdicao) {
        const idAlvo = clienteEmEdicao.id || clienteEmEdicao.Id;
        await api.put(`/api/clientes/${idAlvo}`, payload);
        showToast("Cliente atualizado com sucesso!");
      } else {
        await api.post('/api/clientes', payload);
        showToast("Cliente cadastrado com sucesso!");
      }

      setIsModalOpen(false);

      // Como o nosso fetchClientes agora é BLINDADO contra falhas,
      // podemos chamá-lo com segurança para recarregar a tabela sem derrubar os cards!
      fetchClientes();

    } catch (erro) {
      console.error("Erro ao salvar cliente:", erro);
      const detalhes = erro.response?.data?.errors ? JSON.stringify(erro.response.data.errors) : erro.response?.data?.mensagem;
      showToast(detalhes || "Erro ao comunicar com o servidor.", "error");
    }
  };

  const handleToggleStatusCliente = (cliente) => {
    // =========================================================================
    // SOLUÇÃO ARQUITETURAL DO EFEITO MIRAGEM
    // =========================================================================
    // O banco tem DOIS sistemas de status paralelos:
    //   1. esta_ativo (bool) → escrito por /inativar e /reativar
    //   2. status_cadastro (enum) → escrito por /status, ÚNICO lido pelo SELECT do Dapper
    //
    // Os endpoints /inativar e /reativar só escrevem em esta_ativo (coluna ausente no SELECT).
    // Por isso o status reverte ao F5: o banco persiste, mas o GET ignora a coluna.
    //
    // SOLUÇÃO: usar PATCH /{id}/status com o enum StatusCadastroCliente:
    //   Rejeitado (2) = Inativo  → status_cadastro = 'Rejeitado'  → SELECT retorna 'Rejeitado'
    //   Pendente  (0) = Ativo    → status_cadastro = 'Pendente'   → SELECT retorna 'Pendente'
    // =========================================================================
    if (!cliente?.estaAtivo) {
      setConfirmModal({
        isOpen: true,
        title: 'Reativar Cliente',
        message: `Deseja REATIVAR o cliente ${cliente?.nomeOuRazaoSocial || 'Selecionado'}?`,
        isDanger: false,
        onConfirm: async () => {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          try {
            // Status 0 = Pendente (Ativo). Escreve em status_cadastro → persiste no F5.
            await api.patch(`/api/clientes/${cliente?.id}/status`, { status: 0 });
            setClientes(prev => prev.map(c =>
              c?.id === cliente?.id
                ? { ...c, estaAtivo: true, statusCadastro: 'Pendente' }
                : c
            ));
            showToast('Cliente reativado com sucesso!');
          } catch (err) {
            console.error(err);
            showToast('Falha ao se comunicar com a API.', 'error');
          }
        }
      });
    } else {
      setConfirmModal({
        isOpen: true,
        title: 'Arquivar Cliente',
        message: `Deseja realmente ARQUIVAR / INATIVAR o cliente ${cliente?.nomeOuRazaoSocial || 'Selecionado'}?`,
        isDanger: true,
        onConfirm: async () => {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          try {
            // Status 2 = Rejeitado (Inativo). Escreve em status_cadastro → persiste no F5.
            await api.patch(`/api/clientes/${cliente?.id}/status`, { status: 2 });
            setClientes(prev => prev.map(c =>
              c?.id === cliente?.id
                ? { ...c, estaAtivo: false, statusCadastro: 'Rejeitado' }
                : c
            ));
            showToast('Cliente arquivado com sucesso!');
          } catch (err) {
            console.error(err);
            showToast('Falha ao se comunicar com a API.', 'error');
          }
        }
      });
    }
  };

  return (
    <div className="p-8 space-y-6 bg-slate-50/50 dark:bg-slate-950/50 min-h-screen">

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <Users className="text-amber-500" /> Gestão de Clientes
          </h1>
          <p className="text-slate-500 mt-1">CRM integrado para análise de base e gestão cadastral.</p>
        </div>
        <button
          onClick={handleNovoCliente}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Plus size={20} /> Cadastrar Cliente
        </button>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-slate-100 text-slate-600 rounded-xl"><Users size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Base Total Ativa</p>
            <h3 className="text-2xl font-black text-slate-800">{metricas.baseAtiva}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Building2 size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Atacado (B2B)</p>
            <h3 className="text-2xl font-black text-slate-800">{metricas.atacadoB2B}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><UserCircle size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Varejo (B2C)</p>
            <h3 className="text-2xl font-black text-slate-800">{metricas.varejoB2C}</h3>
          </div>
        </div>
      </div>

      {/* Alerta de erro do Dapper / Conexão */}
      {hasError && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="text-sm font-bold text-rose-800">Falha ao carregar a listagem (Problema na API)</h4>
            <p className="text-xs text-rose-600 mt-1">Ocorreu um erro 500 no backend ao consultar os clientes. No entanto, o botão "Cadastrar Cliente" e os demais formulários continuam ativos para você criar novos registros.</p>
          </div>
        </div>
      )}

      {/* Filtros e Busca */}
      <div className="flex flex-col xl:flex-row justify-between items-center gap-4 bg-white p-3 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 w-full xl:flex-1 pl-2">
          <Search className="text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar cliente por nome, razão social ou CNPJ/CPF..."
            className="w-full p-2 outline-none text-slate-700 font-medium text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
          <button
            onClick={() => setFiltroAtivo('TODOS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${filtroAtivo === 'TODOS' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Todos
          </button>
          <button
            onClick={() => setFiltroAtivo('B2B')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${filtroAtivo === 'B2B' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Atacado (B2B)
          </button>
          <button
            onClick={() => setFiltroAtivo('B2C')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${filtroAtivo === 'B2C' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Varejo (B2C)
          </button>
          <button
            onClick={() => setFiltroAtivo('ARQUIVADOS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${filtroAtivo === 'ARQUIVADOS' ? 'bg-slate-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Arquivados / Inativos
          </button>
        </div>
      </div>

      {/* Tabela de Clientes */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold select-none">
                <th className="p-4">Cliente / Empresa</th>
                <th className="p-4">Documento</th>
                <th className="p-4 text-center">Segmento</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-slate-400 font-semibold">
                    Carregando base de clientes...
                  </td>
                </tr>
              ) : clientesFiltrados.map(cliente => (
                <tr key={cliente?.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-slate-800">{cliente?.nomeOuRazaoSocial || 'Sem Nome Cadastrado'}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Fantasia: {cliente?.nomeFantasia || 'N/A'}</p>
                  </td>
                  <td className="p-4 text-slate-600 font-mono text-xs font-semibold">{formatCpfCnpj(cliente?.documento || '')}</td>
                  <td className="p-4 text-center">
                    {(() => {
                      // Normalização local — idêntica à do useMemo de métricas e clientesFiltrados
                      const segNorm = String(
                        cliente?.segmento ?? cliente?.Segmento ??
                        cliente?.tipoSegmento ?? cliente?.TipoSegmento ??
                        cliente?.tipo_segmento ?? ''
                      ).toLowerCase();
                      const isB2B = segNorm.includes('b2b') || segNorm.includes('atacado') || segNorm === '0';
                      return (
                        <span className={`inline-block px-2.5 py-1 rounded text-xs font-bold ${isB2B ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                          }`}>
                          {isB2B ? 'B2B' : 'B2C'}
                        </span>
                      );
                    })()}
                  </td>

                  <td className="p-4 text-center">
                    {cliente?.estaAtivo ? (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                        Ativo
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                        Inativo
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <button
                        onClick={() => handleEditarCliente(cliente)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        title="Editar"
                      >
                        <Edit3 size={16} />
                      </button>

                      <button
                        onClick={() => handleToggleStatusCliente(cliente)}
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${!cliente?.estaAtivo
                          ? 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50'
                          : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                          }`}
                        title={!cliente?.estaAtivo ? "Reativar Cliente" : "Arquivar/Inativar"}
                      >
                        {!cliente?.estaAtivo ? <RotateCcw size={16} /> : <Archive size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && clientesFiltrados.length === 0 && !hasError && (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-slate-400 font-semibold">
                    Nenhum cliente encontrado na base de dados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL DE CADASTRO / EDIÇÃO DE CLIENTE */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden border border-slate-200 flex flex-col">

            <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-800">
                {clienteEmEdicao ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSalvarCliente} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase">Razão Social / Nome Completo *</label>
                  <input
                    type="text" required maxLength="150"
                    value={formData.nomeOuRazaoSocial}
                    onChange={e => setFormData({ ...formData, nomeOuRazaoSocial: e.target.value })}
                    placeholder="Ex: Mercadinho da Praça Ltda"
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm mt-1 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Nome Fantasia</label>
                  <input
                    type="text" maxLength="150"
                    value={formData.nomeFantasia}
                    onChange={e => setFormData({ ...formData, nomeFantasia: e.target.value })}
                    placeholder="Ex: Mercadinho da Praça"
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm mt-1 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Documento (CPF/CNPJ) *</label>
                  <input
                    type="text" required maxLength="18"
                    value={formData.documento}
                    onChange={e => setFormData({ ...formData, documento: formatCpfCnpj(e.target.value) })}
                    placeholder="00.000.000/0000-00"
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm mt-1 font-medium font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Segmento de Venda *</label>
                  <select
                    value={formData.tipoSegmento}
                    onChange={e => setFormData({ ...formData, tipoSegmento: Number(e.target.value) })}
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm mt-1 font-bold bg-white cursor-pointer text-slate-700"
                  >
                    <option value={0}>Atacado (B2B)</option>
                    <option value={1}>Varejo (B2C)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">CEP *</label>
                  <input
                    type="text" maxLength="10" required
                    value={formData.cep}
                    onChange={e => setFormData({ ...formData, cep: e.target.value })}
                    onBlur={(e) => handleBuscarCep(e.target.value)}
                    placeholder="00000-000"
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm mt-1 font-medium"
                  />
                </div>

                <div className="md:col-span-2 flex gap-4">
                  <div className="flex-[3]">
                    <label className="block text-xs font-bold text-slate-500 uppercase">Logradouro / Rua</label>
                    <input
                      type="text" maxLength="150"
                      value={formData.logradouro}
                      onChange={e => setFormData({ ...formData, logradouro: e.target.value })}
                      placeholder="Av. Brasil"
                      className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm mt-1 font-medium"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase">Número</label>
                    <input
                      type="text" maxLength="20"
                      value={formData.numero}
                      onChange={e => setFormData({ ...formData, numero: e.target.value })}
                      placeholder="123"
                      className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm mt-1 font-medium"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase">Bairro</label>
                  <input
                    type="text" maxLength="100"
                    value={formData.bairro}
                    onChange={e => setFormData({ ...formData, bairro: e.target.value })}
                    placeholder="Centro"
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm mt-1 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase"
                  >Estado <span className="normal-case text-slate-400 font-normal">(preenchido pelo CEP)</span></label>
                  <input
                    type="text"
                    value={formData.uf || ''}
                    disabled
                    placeholder="Preenchido automaticamente pelo CEP"
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm mt-1 font-medium bg-slate-100 text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase"
                  >Cidade <span className="normal-case text-slate-400 font-normal">(preenchido pelo CEP)</span></label>
                  <input
                    type="text"
                    value={formData.cidadeNome || ''}
                    disabled
                    placeholder="Preenchido automaticamente pelo CEP"
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm mt-1 font-medium bg-slate-100 text-slate-500 cursor-not-allowed"
                  />
                  {/* cidadeId permanece no formData para o payload — apenas a exibição muda */}
                </div>

              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors shadow-sm cursor-pointer">
                  Salvar Cliente
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