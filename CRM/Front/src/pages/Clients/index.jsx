import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search,
  Users,
  Building2,
  UserCircle,
  AlertCircle,
  Plus,
  Edit3,
  Archive,
  X,
  RotateCcw,
  MessageCircle,
  Eye
} from 'lucide-react';
import api from '../../services/api';
import Toast from '../../components/Toast';
import ConfirmModal from '../../components/ConfirmModal';

export default function GestaoClientes() {
  const [clientes, setClientes] = useState([]);

  // cidades: cache interno usado por handleBuscarCep para cruzar
  // nome da cidade → cidadeId.
  const [cidades, setCidades] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState('TODOS');
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Modal de edição/cadastro
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clienteEmEdicao, setClienteEmEdicao] = useState(null);

  // Modal de visualização
  const [isVisualizacaoOpen, setIsVisualizacaoOpen] = useState(false);
  const [clienteEmVisualizacao, setClienteEmVisualizacao] =
    useState(null);

  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  const showToast = (message, type = 'success') =>
    setToast({
      show: true,
      message,
      type
    });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    isDanger: false,
    onConfirm: null
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
    cidadeId: '',
    uf: '',
    cidadeNome: '',
    whatsapp: ''
  });

  // =========================================================================
  // 1. BUSCAR CLIENTES
  // =========================================================================
  const fetchClientes = () => {
    setIsLoading(true);
    setHasError(false);

    api.get('/api/clientes')
      .then(res => {
        const rawData = Array.isArray(res.data)
          ? res.data
          : res.data?.dados || res.data?.data || [];

        const normalizedData = rawData.map(c => {
          const statusCadastro =
            c.StatusCadastro ??
            c.statusCadastro ??
            c.status_cadastro ??
            '';

          const statusLimpo = String(statusCadastro)
            .trim()
            .toLowerCase();

          const isExpressamenteInativo =
            statusLimpo === 'inativo' ||
            statusLimpo === 'rejeitado' ||
            statusLimpo === '2';

          const estaAtivo = !isExpressamenteInativo;

          return {
            ...c,

            id: c.Id || c.id,

            estaAtivo,
            statusCadastro,

            tipoSegmento:
              c.TipoSegmento ||
              c.tipoSegmento ||
              c.tipo_segmento,

            nomeOuRazaoSocial:
              c.NomeOuRazaoSocial ||
              c.nomeOuRazaoSocial,

            nomeFantasia:
              c.NomeFantasia ||
              c.nomeFantasia,

            documento:
              c.Documento ||
              c.documento,

            cidadeNome:
              c.NomeCidade ||
              c.cidadeNome ||
              c.CidadeNome,

            uf:
              c.SiglaEstado ||
              c.uf ||
              c.Uf,

            cep:
              c.Cep ||
              c.cep ||
              c.CEP,

            logradouro:
              c.Logradouro ||
              c.logradouro,

            bairro:
              c.Bairro ||
              c.bairro,

            numero:
              c.Numero ||
              c.numero,

            estadoId:
              c.EstadoId ||
              c.estadoId,

            cidadeId:
              c.CidadeId ||
              c.cidadeId,

            whatsapp:
              c.whatsApp ||
              c.WhatsApp ||
              c.whatsapp ||
              c.Whatsapp ||
              ''
          };
        });

        setClientes(normalizedData);
      })
      .catch(err => {
        console.error(
          'Erro ao carregar clientes',
          err
        );

        setHasError(true);
        setClientes([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  // =========================================================================
  // 2. CÁLCULO DE MÉTRICAS
  // =========================================================================
  const metricas = useMemo(() => {
    const baseAtiva = clientes.filter(c => {
      const status =
        c.estaAtivo ??
        c.EstaAtivo ??
        c.statusCadastro ??
        c.StatusCadastro ??
        c.status_cadastro;

      return (
        status === true ||
        String(status).toLowerCase() === 'ativo'
      );
    }).length;

    const atacadoB2B = clientes.filter(c => {
      const status =
        c.estaAtivo ??
        c.EstaAtivo ??
        c.statusCadastro ??
        c.StatusCadastro ??
        c.status_cadastro;

      const isActive =
        status === true ||
        String(status).toLowerCase() === 'ativo';

      const seg = String(
        c.segmento ??
        c.Segmento ??
        c.tipoSegmento ??
        c.TipoSegmento ??
        c.tipo_segmento ??
        ''
      ).toLowerCase();

      const isB2B =
        seg.includes('b2b') ||
        seg.includes('atacado') ||
        seg === '0';

      return isActive && isB2B;
    }).length;

    const varejoB2C = clientes.filter(c => {
      const status =
        c.estaAtivo ??
        c.EstaAtivo ??
        c.statusCadastro ??
        c.StatusCadastro ??
        c.status_cadastro;

      const isActive =
        status === true ||
        String(status).toLowerCase() === 'ativo';

      const seg = String(
        c.segmento ??
        c.Segmento ??
        c.tipoSegmento ??
        c.TipoSegmento ??
        c.tipo_segmento ??
        ''
      ).toLowerCase();

      const isB2C =
        seg.includes('b2c') ||
        seg.includes('varejo') ||
        seg === '1';

      return isActive && isB2C;
    }).length;

    return {
      baseAtiva,
      atacadoB2B,
      varejoB2C
    };
  }, [clientes]);

  // =========================================================================
  // 3. FILTRAGEM
  // =========================================================================
  const clientesFiltrados = useMemo(() => {
    return clientes.filter(c => {
      const termo = (searchTerm || '').toLowerCase();

      const nomeRazao = (
        c?.nomeOuRazaoSocial ||
        c?.NomeOuRazaoSocial ||
        ''
      ).toLowerCase();

      const fantasia = (
        c?.nomeFantasia ||
        c?.NomeFantasia ||
        ''
      ).toLowerCase();

      const doc = (
        c?.documento ||
        c?.Documento ||
        ''
      ).toLowerCase();

      const matchSearch =
        nomeRazao.includes(termo) ||
        fantasia.includes(termo) ||
        doc.includes(termo);

      const statusRaw =
        c?.estaAtivo ??
        c?.EstaAtivo ??
        c?.statusCadastro ??
        c?.StatusCadastro ??
        c?.status_cadastro;

      const isAtivo =
        statusRaw === true ||
        String(statusRaw ?? '').toLowerCase() === 'ativo';

      const segNorm = String(
        c?.segmento ??
        c?.Segmento ??
        c?.tipoSegmento ??
        c?.TipoSegmento ??
        c?.tipo_segmento ??
        ''
      ).toLowerCase();

      const isB2B =
        segNorm.includes('b2b') ||
        segNorm.includes('atacado') ||
        segNorm === '0';

      const isB2C =
        segNorm.includes('b2c') ||
        segNorm.includes('varejo') ||
        segNorm === '1';

      let matchFiltro = true;

      if (filtroAtivo === 'B2B') {
        matchFiltro = isB2B && isAtivo;
      }

      if (filtroAtivo === 'B2C') {
        matchFiltro = isB2C && isAtivo;
      }

      if (filtroAtivo === 'ARQUIVADOS') {
        matchFiltro = !isAtivo;
      }

      return matchSearch && matchFiltro;
    });
  }, [
    clientes,
    searchTerm,
    filtroAtivo
  ]);

  // =========================================================================
  // 4. NOVO CLIENTE
  // =========================================================================
  const handleNovoCliente = () => {
    setClienteEmEdicao(null);

    setFormData({
      documento: '',
      nomeOuRazaoSocial: '',
      nomeFantasia: '',
      tipoSegmento: 0,
      cep: '',
      logradouro: '',
      numero: '',
      bairro: '',
      estadoId: '',
      cidadeId: '',
      uf: '',
      cidadeNome: '',
      whatsapp: ''
    });

    setIsModalOpen(true);
  };

  // =========================================================================
  // 5. BUSCA CEP
  // =========================================================================
  const normalizeStr = str =>
    str
      ? String(str)
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .trim()
      : '';

  const handleBuscarCep = useCallback(async cepOpcional => {
    const cepAlvo =
      typeof cepOpcional === 'string'
        ? cepOpcional
        : '';

    if (!cepAlvo) return;

    const cleanCep = cepAlvo.replace(/\D/g, '');

    if (cleanCep.length !== 8) return;

    try {
      const res = await api.get(
        `/api/Ceps/${cleanCep}`
      );

      if (res.data) {
        const uf =
          res.data?.uf ||
          res.data?.Uf ||
          res.data?.siglaEstado ||
          res.data?.estado ||
          '';

        const nomeCidade =
          res.data?.localidade ||
          res.data?.cidade ||
          res.data?.cidadeNome ||
          res.data?.nomeCidade ||
          '';

        let novoEstadoId =
          res.data?.estadoId ||
          res.data?.EstadoId ||
          '';

        let novaCidadeId =
          res.data?.cidadeId ||
          res.data?.CidadeId ||
          '';

        if (novoEstadoId) {
          try {
            const cidadesRes = await api.get(
              `/api/lookups/estados/${novoEstadoId}/cidades`
            );

            const listaCidades = Array.isArray(
              cidadesRes.data
            )
              ? cidadesRes.data
              : [];

            setCidades(listaCidades);

            if (
              !novaCidadeId &&
              nomeCidade
            ) {
              const cityTarget =
                normalizeStr(nomeCidade);

              const cidadeEncontrada =
                listaCidades.find(c => {
                  const cityName =
                    normalizeStr(
                      c.nome ||
                      c.Nome ||
                      c.descricao ||
                      c.Descricao ||
                      c.nomeCidade ||
                      c.NomeCidade
                    );

                  return (
                    cityName === cityTarget
                  );
                });

              if (cidadeEncontrada) {
                novaCidadeId =
                  cidadeEncontrada.id ||
                  cidadeEncontrada.Id;
              } else if (
                listaCidades.length > 0
              ) {
                novaCidadeId =
                  listaCidades[0].id ||
                  listaCidades[0].Id;
              }
            }
          } catch (err) {
            console.error(
              'Erro ao carregar lista de cidades:',
              err
            );
          }
        }

        setFormData(prev => ({
          ...prev,

          logradouro:
            res.data?.logradouro ||
            res.data?.Logradouro ||
            prev.logradouro,

          bairro:
            res.data?.bairro ||
            res.data?.Bairro ||
            prev.bairro,

          estadoId:
            novoEstadoId ||
            prev.estadoId,

          cidadeId:
            novaCidadeId ||
            prev.cidadeId,

          uf:
            uf ||
            prev.uf,

          cidadeNome:
            nomeCidade ||
            prev.cidadeNome
        }));
      }
    } catch (err) {
      console.error(
        'Erro ao buscar CEP',
        err
      );
    }
  }, []);

  useEffect(() => {
    if (
      isModalOpen &&
      clienteEmEdicao
    ) {
      const cepDoCliente =
        clienteEmEdicao.cep ||
        clienteEmEdicao.Cep ||
        clienteEmEdicao.CEP;

      if (cepDoCliente) {
        handleBuscarCep(cepDoCliente);
      }
    }
  }, [
    isModalOpen,
    clienteEmEdicao,
    handleBuscarCep
  ]);

  // =========================================================================
  // 6. FORMATAÇÃO CPF / CNPJ
  // =========================================================================
  const formatCpfCnpj = value => {
    if (!value) return '';

    let clean = value.replace(/\D/g, '');

    if (clean.length > 14) {
      clean = clean.slice(0, 14);
    }

    if (clean.length <= 11) {
      clean = clean.replace(
        /(\d{3})(\d)/,
        '$1.$2'
      );

      clean = clean.replace(
        /(\d{3})(\d)/,
        '$1.$2'
      );

      clean = clean.replace(
        /(\d{3})(\d{1,2})$/,
        '$1-$2'
      );
    } else {
      clean = clean.replace(
        /^(\d{2})(\d)/,
        '$1.$2'
      );

      clean = clean.replace(
        /^(\d{2})\.(\d{3})(\d)/,
        '$1.$2.$3'
      );

      clean = clean.replace(
        /\.(\d{3})(\d)/,
        '.$1/$2'
      );

      clean = clean.replace(
        /(\d{4})(\d)/,
        '$1-$2'
      );
    }

    return clean;
  };

  // =========================================================================
  // 7. VISUALIZAR CLIENTE
  // =========================================================================
  const handleVisualizarCliente = cliente => {
    setClienteEmVisualizacao(cliente);
    setIsVisualizacaoOpen(true);
  };

  // =========================================================================
  // 8. EDITAR CLIENTE
  // =========================================================================
  const handleEditarCliente = cliente => {
    setClienteEmEdicao(cliente);

    const segNorm = String(
      cliente?.segmento ??
      cliente?.Segmento ??
      cliente?.tipoSegmento ??
      cliente?.TipoSegmento ??
      ''
    ).toLowerCase();

    const tipoSegmentoNumerico =
      segNorm.includes('b2c') ||
      segNorm.includes('varejo') ||
      segNorm === '1'
        ? 1
        : 0;

    setFormData({
      documento:
        cliente?.documento ||
        cliente?.Documento ||
        '',

      nomeOuRazaoSocial:
        cliente?.nomeOuRazaoSocial ||
        cliente?.NomeOuRazaoSocial ||
        '',

      nomeFantasia:
        cliente?.nomeFantasia ||
        cliente?.NomeFantasia ||
        '',

      tipoSegmento:
        tipoSegmentoNumerico,

      cep:
        cliente?.cep ||
        cliente?.Cep ||
        cliente?.CEP ||
        '',

      logradouro:
        cliente?.logradouro ||
        cliente?.Logradouro ||
        '',

      numero:
        cliente?.numero ||
        cliente?.Numero ||
        '',

      bairro:
        cliente?.bairro ||
        cliente?.Bairro ||
        '',

      estadoId:
        cliente?.estadoId ||
        cliente?.EstadoId ||
        '',

      cidadeId:
        cliente?.cidadeId ||
        cliente?.CidadeId ||
        '',

      uf:
        cliente?.siglaEstado ||
        cliente?.SiglaEstado ||
        cliente?.uf ||
        'SP',

      cidadeNome:
        cliente?.nomeCidade ||
        cliente?.NomeCidade ||
        cliente?.cidadeNome ||
        '',

      whatsapp:
        cliente?.whatsApp ||
        cliente?.WhatsApp ||
        cliente?.whatsapp ||
        cliente?.Whatsapp ||
        ''
    });

    setIsModalOpen(true);

    const cepExistente =
      cliente?.cep ||
      cliente?.Cep ||
      cliente?.CEP;

    if (cepExistente) {
      handleBuscarCep(cepExistente);
    }
  };

  // =========================================================================
  // 9. ABRIR WHATSAPP
  // =========================================================================
  const handleAbrirWhatsapp = cliente => {
    const numero = (
      cliente?.whatsapp ||
      cliente?.whatsApp ||
      cliente?.WhatsApp ||
      cliente?.Whatsapp ||
      ''
    ).replace(/\D/g, '');

    if (!numero) {
      showToast(
        'Este cliente não possui WhatsApp cadastrado.',
        'error'
      );

      return;
    }

    const numeroComPais =
      numero.startsWith('55')
        ? numero
        : `55${numero}`;

    const url =
      `https://wa.me/${numeroComPais}`;

    window.open(
      url,
      '_blank',
      'noopener,noreferrer'
    );
  };

  // =========================================================================
  // 10. SALVAR CLIENTE
  // =========================================================================
  const handleSalvarCliente = async e => {
    e.preventDefault();

    if (
      !formData.nomeOuRazaoSocial ||
      !formData.documento
    ) {
      showToast(
        'Razão Social e Documento são obrigatórios.',
        'error'
      );

      return;
    }

    if (!formData.cidadeId) {
      showToast(
        'Por favor, selecione uma cidade válida.',
        'error'
      );

      return;
    }

    try {
      const documentoLimpo =
        formData.documento
          ? formData.documento.replace(/\D/g, '')
          : '';

      const cepLimpo =
        formData.cep
          ? formData.cep.replace(/\D/g, '')
          : '';

      const whatsappLimpo =
        formData.whatsapp
          ? formData.whatsapp.replace(/\D/g, '')
          : null;

      const payload = {
        cidadeId: formData.cidadeId,
        documento: documentoLimpo,
        nomeOuRazaoSocial:
          formData.nomeOuRazaoSocial,
        nomeFantasia:
          formData.nomeFantasia,
        tipoSegmento:
          parseInt(
            formData.tipoSegmento,
            10
          ),
        cep: cepLimpo,
        logradouro:
          formData.logradouro,
        numero:
          formData.numero,
        bairro:
          formData.bairro,
        whatsapp:
          whatsappLimpo
      };

      if (clienteEmEdicao) {
        const idAlvo =
          clienteEmEdicao.id ||
          clienteEmEdicao.Id;

        const resposta =
          await api.put(
            `/api/clientes/${idAlvo}`,
            payload
          );

        console.log(
          'RESPOSTA DO PUT:',
          resposta.data
        );

        showToast(
          'Cliente atualizado com sucesso!'
        );
      } else {
        await api.post(
          '/api/clientes',
          payload
        );

        showToast(
          'Cliente cadastrado com sucesso!'
        );
      }

      setIsModalOpen(false);

      fetchClientes();
    } catch (erro) {
      console.error(
        'Erro ao salvar cliente:',
        erro
      );

      const detalhes =
        erro.response?.data?.errors
          ? JSON.stringify(
              erro.response.data.errors
            )
          : erro.response?.data?.mensagem;

      showToast(
        detalhes ||
          'Erro ao comunicar com o servidor.',
        'error'
      );
    }
  };

  // =========================================================================
  // 11. ALTERAR STATUS
  // =========================================================================
  const handleToggleStatusCliente = cliente => {
    if (!cliente?.estaAtivo) {
      setConfirmModal({
        isOpen: true,
        title: 'Reativar Cliente',
        message:
          `Deseja REATIVAR o cliente ${cliente?.nomeOuRazaoSocial || 'Selecionado'}?`,
        isDanger: false,

        onConfirm: async () => {
          setConfirmModal(prev => ({
            ...prev,
            isOpen: false
          }));

          try {
            await api.patch(
              `/api/clientes/${cliente?.id}/status`,
              { status: 0 }
            );

            setClientes(prev =>
              prev.map(c =>
                c?.id === cliente?.id
                  ? {
                      ...c,
                      estaAtivo: true,
                      statusCadastro: 'Pendente'
                    }
                  : c
              )
            );

            showToast(
              'Cliente reativado com sucesso!'
            );
          } catch (err) {
            console.error(err);

            showToast(
              'Falha ao se comunicar com a API.',
              'error'
            );
          }
        }
      });
    } else {
      setConfirmModal({
        isOpen: true,
        title: 'Arquivar Cliente',
        message:
          `Deseja realmente ARQUIVAR / INATIVAR o cliente ${cliente?.nomeOuRazaoSocial || 'Selecionado'}?`,
        isDanger: true,

        onConfirm: async () => {
          setConfirmModal(prev => ({
            ...prev,
            isOpen: false
          }));

          try {
            await api.patch(
              `/api/clientes/${cliente?.id}/status`,
              { status: 2 }
            );

            setClientes(prev =>
              prev.map(c =>
                c?.id === cliente?.id
                  ? {
                      ...c,
                      estaAtivo: false,
                      statusCadastro: 'Rejeitado'
                    }
                  : c
              )
            );

            showToast(
              'Cliente arquivado com sucesso!'
            );
          } catch (err) {
            console.error(err);

            showToast(
              'Falha ao se comunicar com a API.',
              'error'
            );
          }
        }
      });
    }
  };

  // =========================================================================
  // 12. HELPERS DE VISUALIZAÇÃO
  // =========================================================================
  const getSegmentoLabel = cliente => {
    const segNorm = String(
      cliente?.segmento ??
      cliente?.Segmento ??
      cliente?.tipoSegmento ??
      cliente?.TipoSegmento ??
      cliente?.tipo_segmento ??
      ''
    ).toLowerCase();

    return (
      segNorm.includes('b2c') ||
      segNorm.includes('varejo') ||
      segNorm === '1'
    )
      ? 'Varejo (B2C)'
      : 'Atacado (B2B)';
  };

  const getWhatsapp = cliente =>
    cliente?.whatsapp ||
    cliente?.whatsApp ||
    cliente?.WhatsApp ||
    cliente?.Whatsapp ||
    '';

  // =========================================================================
  // 13. RENDER
  // =========================================================================
  return (
    <div className="p-8 space-y-6 bg-slate-50/50 dark:bg-slate-950/50 min-h-screen">

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <Users className="text-amber-500" />
            Gestão de Clientes
          </h1>

          <p className="text-slate-500 mt-1">
            CRM integrado para análise de base e gestão cadastral.
          </p>
        </div>

        <button
          onClick={handleNovoCliente}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Plus size={20} />
          Cadastrar Cliente
        </button>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">

          <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
            <Users size={24} />
          </div>

          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">
              Base Total Ativa
            </p>

            <h3 className="text-2xl font-black text-slate-800">
              {metricas.baseAtiva}
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">

          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Building2 size={24} />
          </div>

          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">
              Atacado (B2B)
            </p>

            <h3 className="text-2xl font-black text-slate-800">
              {metricas.atacadoB2B}
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">

          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <UserCircle size={24} />
          </div>

          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">
              Varejo (B2C)
            </p>

            <h3 className="text-2xl font-black text-slate-800">
              {metricas.varejoB2C}
            </h3>
          </div>
        </div>

      </div>

      {/* Alerta de erro */}
      {hasError && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-start gap-3">

          <AlertCircle
            className="text-rose-500 shrink-0 mt-0.5"
            size={20}
          />

          <div>
            <h4 className="text-sm font-bold text-rose-800">
              Falha ao carregar a listagem (Problema na API)
            </h4>

            <p className="text-xs text-rose-600 mt-1">
              Ocorreu um erro 500 no backend ao consultar os clientes.
              No entanto, o botão "Cadastrar Cliente" e os demais
              formulários continuam ativos para você criar novos registros.
            </p>
          </div>
        </div>
      )}

      {/* Filtros e Busca */}
      <div className="flex flex-col xl:flex-row justify-between items-center gap-4 bg-white p-3 rounded-2xl shadow-sm border border-slate-200">

        <div className="flex items-center gap-3 w-full xl:flex-1 pl-2">

          <Search
            className="text-slate-400"
            size={20}
          />

          <input
            type="text"
            placeholder="Buscar cliente por nome, razão social ou CNPJ/CPF..."
            className="w-full p-2 outline-none text-slate-700 font-medium text-sm"
            value={searchTerm}
            onChange={e =>
              setSearchTerm(e.target.value)
            }
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">

          <button
            onClick={() =>
              setFiltroAtivo('TODOS')
            }
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              filtroAtivo === 'TODOS'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos
          </button>

          <button
            onClick={() =>
              setFiltroAtivo('B2B')
            }
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              filtroAtivo === 'B2B'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Atacado (B2B)
          </button>

          <button
            onClick={() =>
              setFiltroAtivo('B2C')
            }
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              filtroAtivo === 'B2C'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Varejo (B2C)
          </button>

          <button
            onClick={() =>
              setFiltroAtivo('ARQUIVADOS')
            }
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              filtroAtivo === 'ARQUIVADOS'
                ? 'bg-slate-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
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

                <th className="p-4">
                  Cliente / Empresa
                </th>

                <th className="p-4">
                  Documento
                </th>

                <th className="p-4 text-center">
                  Segmento
                </th>

                <th className="p-4 text-center">
                  Status
                </th>

                <th className="p-4 text-center">
                  Ações
                </th>

              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-sm">

              {isLoading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="p-10 text-center text-slate-400 font-semibold"
                  >
                    Carregando base de clientes...
                  </td>
                </tr>
              ) : (
                clientesFiltrados.map(cliente => (
                  <tr
                    key={cliente?.id}
                    className="hover:bg-slate-50 transition-colors"
                  >

                    <td className="p-4">

                      <button
                        type="button"
                        onClick={() =>
                          handleVisualizarCliente(cliente)
                        }
                        className="group text-left cursor-pointer"
                        title="Visualizar informações do cliente"
                      >

                        <div className="flex items-center gap-2">

                          <p className="font-bold text-slate-800 group-hover:text-amber-600 transition-colors">
                            {cliente?.nomeOuRazaoSocial ||
                              'Sem Nome Cadastrado'}
                          </p>

                          <Eye
                            size={15}
                            className="text-slate-300 group-hover:text-amber-500 transition-colors"
                          />

                        </div>

                        <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                          Fantasia:{' '}
                          {cliente?.nomeFantasia || 'N/A'}
                        </p>

                      </button>

                    </td>

                    <td className="p-4 text-slate-600 font-mono text-xs font-semibold">
                      {formatCpfCnpj(
                        cliente?.documento || ''
                      )}
                    </td>

                    <td className="p-4 text-center">

                      {(() => {
                        const segNorm = String(
                          cliente?.segmento ??
                          cliente?.Segmento ??
                          cliente?.tipoSegmento ??
                          cliente?.TipoSegmento ??
                          cliente?.tipo_segmento ??
                          ''
                        ).toLowerCase();

                        const isB2B =
                          segNorm.includes('b2b') ||
                          segNorm.includes('atacado') ||
                          segNorm === '0';

                        return (
                          <span
                            className={`inline-block px-2.5 py-1 rounded text-xs font-bold ${
                              isB2B
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            {isB2B
                              ? 'B2B'
                              : 'B2C'}
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

                        {/* WhatsApp */}
                        <button
                          onClick={() =>
                            handleAbrirWhatsapp(cliente)
                          }
                          className={`p-2 rounded-lg transition-colors ${
                            cliente?.whatsapp ||
                            cliente?.whatsApp ||
                            cliente?.WhatsApp
                              ? 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 cursor-pointer'
                              : 'text-slate-300 hover:text-slate-400 cursor-pointer'
                          }`}
                          title={
                            cliente?.whatsapp ||
                            cliente?.whatsApp ||
                            cliente?.WhatsApp
                              ? 'Entrar em contato pelo WhatsApp'
                              : 'WhatsApp não cadastrado'
                          }
                        >
                          <MessageCircle size={16} />
                        </button>

                        {/* Editar */}
                        <button
                          onClick={() =>
                            handleEditarCliente(cliente)
                          }
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit3 size={16} />
                        </button>

                        {/* Status */}
                        <button
                          onClick={() =>
                            handleToggleStatusCliente(cliente)
                          }
                          className={`p-2 rounded-lg transition-colors cursor-pointer ${
                            !cliente?.estaAtivo
                              ? 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50'
                              : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                          }`}
                          title={
                            !cliente?.estaAtivo
                              ? 'Reativar Cliente'
                              : 'Arquivar/Inativar'
                          }
                        >
                          {!cliente?.estaAtivo ? (
                            <RotateCcw size={16} />
                          ) : (
                            <Archive size={16} />
                          )}
                        </button>

                      </div>

                    </td>

                  </tr>
                ))
              )}

              {!isLoading &&
                clientesFiltrados.length === 0 &&
                !hasError && (
                  <tr>
                    <td
                      colSpan="5"
                      className="p-10 text-center text-slate-400 font-semibold"
                    >
                      Nenhum cliente encontrado na base de dados.
                    </td>
                  </tr>
                )}

            </tbody>
          </table>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL DE VISUALIZAÇÃO DO CLIENTE */}
      {/* ========================================================================= */}
      {isVisualizacaoOpen &&
        clienteEmVisualizacao && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">

            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">

              {/* Cabeçalho */}
              <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">

                <div className="flex items-center gap-3">

                  <div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl">
                    <Eye size={22} />
                  </div>

                  <div>
                    <h2 className="text-xl font-black text-slate-800">
                      Informações do Cliente
                    </h2>

                    <p className="text-xs text-slate-500 mt-0.5">
                      Visualização cadastral
                    </p>
                  </div>

                </div>

                <button
                  onClick={() => {
                    setIsVisualizacaoOpen(false);
                    setClienteEmVisualizacao(null);
                  }}
                  className="p-2 text-slate-400 hover:bg-slate-200 rounded-full cursor-pointer"
                  title="Fechar"
                >
                  <X size={20} />
                </button>

              </div>

              {/* Conteúdo */}
              <div className="p-6 overflow-y-auto space-y-6">

                {/* Identificação */}
                <div>

                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
                    Identificação
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div className="md:col-span-2">
                      <p className="text-xs font-bold text-slate-400 uppercase">
                        Razão Social / Nome Completo
                      </p>

                      <p className="text-sm font-bold text-slate-800 mt-1">
                        {clienteEmVisualizacao?.nomeOuRazaoSocial ||
                          clienteEmVisualizacao?.NomeOuRazaoSocial ||
                          'Não informado'}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">
                        Nome Fantasia
                      </p>

                      <p className="text-sm font-semibold text-slate-700 mt-1">
                        {clienteEmVisualizacao?.nomeFantasia ||
                          clienteEmVisualizacao?.NomeFantasia ||
                          'Não informado'}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">
                        CPF / CNPJ
                      </p>

                      <p className="text-sm font-mono font-semibold text-slate-700 mt-1">
                        {formatCpfCnpj(
                          clienteEmVisualizacao?.documento ||
                          clienteEmVisualizacao?.Documento ||
                          ''
                        ) || 'Não informado'}
                      </p>
                    </div>

                  </div>

                </div>

                {/* Segmento e Status */}
                <div>

                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
                    Classificação
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">
                        Segmento
                      </p>

                      <div className="mt-1">
                        <span
                          className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold ${
                            getSegmentoLabel(
                              clienteEmVisualizacao
                            ) === 'Atacado (B2B)'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {getSegmentoLabel(
                            clienteEmVisualizacao
                          )}
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">
                        Status
                      </p>

                      <div className="mt-1">

                        {clienteEmVisualizacao?.estaAtivo ? (
                          <span className="inline-block px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700">
                            Ativo
                          </span>
                        ) : (
                          <span className="inline-block px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600">
                            Inativo
                          </span>
                        )}

                      </div>
                    </div>

                  </div>

                </div>

                {/* Contato */}
                <div>

                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
                    Contato
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">
                        WhatsApp
                      </p>

                      {getWhatsapp(
                        clienteEmVisualizacao
                      ) ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleAbrirWhatsapp(
                              clienteEmVisualizacao
                            )
                          }
                          className="mt-1 inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                        >
                          <MessageCircle size={17} />

                          {getWhatsapp(
                            clienteEmVisualizacao
                          )}
                        </button>
                      ) : (
                        <p className="text-sm font-semibold text-slate-500 mt-1">
                          Não informado
                        </p>
                      )}

                    </div>

                  </div>

                </div>

                {/* Endereço */}
                <div>

                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
                    Endereço
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div className="md:col-span-2">
                      <p className="text-xs font-bold text-slate-400 uppercase">
                        Logradouro
                      </p>

                      <p className="text-sm font-semibold text-slate-700 mt-1">
                        {clienteEmVisualizacao?.logradouro ||
                          clienteEmVisualizacao?.Logradouro ||
                          'Não informado'}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">
                        Número
                      </p>

                      <p className="text-sm font-semibold text-slate-700 mt-1">
                        {clienteEmVisualizacao?.numero ||
                          clienteEmVisualizacao?.Numero ||
                          'Não informado'}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">
                        Bairro
                      </p>

                      <p className="text-sm font-semibold text-slate-700 mt-1">
                        {clienteEmVisualizacao?.bairro ||
                          clienteEmVisualizacao?.Bairro ||
                          'Não informado'}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">
                        CEP
                      </p>

                      <p className="text-sm font-mono font-semibold text-slate-700 mt-1">
                        {clienteEmVisualizacao?.cep ||
                          clienteEmVisualizacao?.Cep ||
                          clienteEmVisualizacao?.CEP ||
                          'Não informado'}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">
                        Cidade / Estado
                      </p>

                      <p className="text-sm font-semibold text-slate-700 mt-1">
                        {clienteEmVisualizacao?.cidadeNome ||
                          clienteEmVisualizacao?.NomeCidade ||
                          clienteEmVisualizacao?.nomeCidade ||
                          'Não informado'}

                        {(clienteEmVisualizacao?.uf ||
                          clienteEmVisualizacao?.Uf ||
                          clienteEmVisualizacao?.SiglaEstado) && (
                          <>
                            {' / '}
                            {clienteEmVisualizacao?.uf ||
                              clienteEmVisualizacao?.Uf ||
                              clienteEmVisualizacao?.SiglaEstado}
                          </>
                        )}
                      </p>
                    </div>

                  </div>

                </div>

              </div>

              {/* Rodapé */}
              <div className="flex justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">

                <button
                  type="button"
                  onClick={() => {
                    setIsVisualizacaoOpen(false);
                    setClienteEmVisualizacao(null);
                  }}
                  className="px-6 py-2.5 font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Fechar
                </button>

              </div>

            </div>
          </div>
        )}

      {/* ========================================================================= */}
      {/* MODAL DE CADASTRO / EDIÇÃO */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">

          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden border border-slate-200 flex flex-col">

            <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">

              <h2 className="text-xl font-black text-slate-800">
                {clienteEmEdicao
                  ? 'Editar Cliente'
                  : 'Cadastrar Novo Cliente'}
              </h2>

              <button
                onClick={() =>
                  setIsModalOpen(false)
                }
                className="p-2 text-slate-400 hover:bg-slate-200 rounded-full cursor-pointer"
              >
                <X size={20} />
              </button>

            </div>

            <form
              onSubmit={handleSalvarCliente}
              className="p-6 space-y-4"
            >

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="md:col-span-2">

                  <label className="block text-xs font-bold text-slate-500 uppercase">
                    Razão Social / Nome Completo *
                  </label>

                  <input
                    type="text"
                    required
                    maxLength="150"
                    value={
                      formData.nomeOuRazaoSocial
                    }
                    onChange={e =>
                      setFormData({
                        ...formData,
                        nomeOuRazaoSocial:
                          e.target.value
                      })
                    }
                    placeholder="Ex: Mercadinho da Praça Ltda"
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm mt-1 font-medium"
                  />

                </div>

                <div>

                  <label className="block text-xs font-bold text-slate-500 uppercase">
                    Nome Fantasia
                  </label>

                  <input
                    type="text"
                    maxLength="150"
                    value={
                      formData.nomeFantasia
                    }
                    onChange={e =>
                      setFormData({
                        ...formData,
                        nomeFantasia:
                          e.target.value
                      })
                    }
                    placeholder="Ex: Mercadinho da Praça"
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm mt-1 font-medium"
                  />

                </div>

                <div>

                  <label className="block text-xs font-bold text-slate-500 uppercase">
                    Documento (CPF/CNPJ) *
                  </label>

                  <input
                    type="text"
                    required
                    maxLength="18"
                    value={formData.documento}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        documento:
                          formatCpfCnpj(
                            e.target.value
                          )
                      })
                    }
                    placeholder="00.000.000/0000-00"
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm mt-1 font-medium font-mono"
                  />

                </div>

                <div>

                  <label className="block text-xs font-bold text-slate-500 uppercase">
                    Segmento de Venda *
                  </label>

                  <select
                    value={
                      formData.tipoSegmento
                    }
                    onChange={e =>
                      setFormData({
                        ...formData,
                        tipoSegmento:
                          Number(
                            e.target.value
                          )
                      })
                    }
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm mt-1 font-bold bg-white cursor-pointer text-slate-700"
                  >
                    <option value={0}>
                      Atacado (B2B)
                    </option>

                    <option value={1}>
                      Varejo (B2C)
                    </option>
                  </select>

                </div>

                {/* WhatsApp */}
                <div>

                  <label className="block text-xs font-bold text-slate-500 uppercase">
                    WhatsApp
                  </label>

                  <div className="relative mt-1">

                    <MessageCircle
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500"
                    />

                    <input
                      type="text"
                      maxLength="20"
                      value={
                        formData.whatsapp
                      }
                      onChange={e =>
                        setFormData({
                          ...formData,
                          whatsapp:
                            e.target.value
                        })
                      }
                      placeholder="(14) 99999-9999"
                      className="w-full p-3 pl-10 border border-slate-300 rounded-xl outline-none focus:border-emerald-500 text-sm font-medium"
                    />

                  </div>

                </div>

                <div>

                  <label className="block text-xs font-bold text-slate-500 uppercase">
                    CEP *
                  </label>

                  <input
                    type="text"
                    maxLength="10"
                    required
                    value={formData.cep}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        cep: e.target.value
                      })
                    }
                    onBlur={e =>
                      handleBuscarCep(
                        e.target.value
                      )
                    }
                    placeholder="00000-000"
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm mt-1 font-medium"
                  />

                </div>

                <div className="md:col-span-2 flex gap-4">

                  <div className="flex-[3]">

                    <label className="block text-xs font-bold text-slate-500 uppercase">
                      Logradouro / Rua
                    </label>

                    <input
                      type="text"
                      maxLength="150"
                      value={
                        formData.logradouro
                      }
                      onChange={e =>
                        setFormData({
                          ...formData,
                          logradouro:
                            e.target.value
                        })
                      }
                      placeholder="Av. Brasil"
                      className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm mt-1 font-medium"
                    />

                  </div>

                  <div className="flex-1">

                    <label className="block text-xs font-bold text-slate-500 uppercase">
                      Número
                    </label>

                    <input
                      type="text"
                      maxLength="20"
                      value={
                        formData.numero
                      }
                      onChange={e =>
                        setFormData({
                          ...formData,
                          numero:
                            e.target.value
                        })
                      }
                      placeholder="123"
                      className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm mt-1 font-medium"
                    />

                  </div>

                </div>

                <div className="md:col-span-2">

                  <label className="block text-xs font-bold text-slate-500 uppercase">
                    Bairro
                  </label>

                  <input
                    type="text"
                    maxLength="100"
                    value={formData.bairro}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        bairro:
                          e.target.value
                      })
                    }
                    placeholder="Centro"
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm mt-1 font-medium"
                  />

                </div>

                <div>

                  <label className="block text-xs font-bold text-slate-500 uppercase">
                    Estado{' '}
                    <span className="normal-case text-slate-400 font-normal">
                      (preenchido pelo CEP)
                    </span>
                  </label>

                  <input
                    type="text"
                    value={
                      formData.uf || ''
                    }
                    disabled
                    placeholder="Preenchido automaticamente pelo CEP"
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm mt-1 font-medium bg-slate-100 text-slate-500 cursor-not-allowed"
                  />

                </div>

                <div>

                  <label className="block text-xs font-bold text-slate-500 uppercase">
                    Cidade{' '}
                    <span className="normal-case text-slate-400 font-normal">
                      (preenchido pelo CEP)
                    </span>
                  </label>

                  <input
                    type="text"
                    value={
                      formData.cidadeNome || ''
                    }
                    disabled
                    placeholder="Preenchido automaticamente pelo CEP"
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm mt-1 font-medium bg-slate-100 text-slate-500 cursor-not-allowed"
                  />

                </div>

              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">

                <button
                  type="button"
                  onClick={() =>
                    setIsModalOpen(false)
                  }
                  className="px-5 py-2.5 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors shadow-sm cursor-pointer"
                >
                  Salvar Cliente
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

      {/* Feedback */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() =>
          setToast({
            ...toast,
            show: false
          })
        }
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        isDanger={confirmModal.isDanger}
        onConfirm={confirmModal.onConfirm}
        onCancel={() =>
          setConfirmModal(prev => ({
            ...prev,
            isOpen: false
          }))
        }
      />

    </div>
  );
}