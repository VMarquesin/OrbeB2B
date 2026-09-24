import { useState, useMemo, useEffect } from 'react';
import {
  Package,
  Search,
  Plus,
  Edit3,
  Archive,
  RotateCcw,
  Factory,
  Store,
  X,
  Truck,
  Image as ImageIcon
} from 'lucide-react';
import api from '../../services/api';
import Toast from '../../components/Toast';
import ConfirmModal from '../../components/ConfirmModal';

export default function GestaoProdutos() {
  const [produtos, setProdutos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroOrigem, setFiltroOrigem] = useState('TODOS');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [produtoEmEdicao, setProdutoEmEdicao] = useState(null);

  const [imagensArquivos, setImagensArquivos] = useState([]);
  const [imagensPreview, setImagensPreview] = useState([]);

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
    codigo_comercial: '',
    descricao: '',
    descricao_detalhada: '',
    imagem_url: '',
    imagens: [],
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

      console.log('PRODUTOS DA API:', resProd.data);

      if (resProd.data && resProd.data.length > 0) {
        const normalizedData = resProd.data.map(p => ({
          ...p,

          id: p.id || p.Id,

          codigo_comercial:
            p.codigo_comercial ||
            p.codigoComercial ||
            p.CodigoComercial ||
            '',

          descricao:
            p.descricao ||
            p.Descricao ||
            '',

          descricao_detalhada:
            p.descricao_detalhada ??
            p.descricaoDetalhada ??
            p.DescricaoDetalhada ??
            '',

          imagem_url:
            p.imagem_url ??
            p.imagemUrl ??
            p.ImagemUrl ??
            '',

          imagens:
            p.imagens ??
            p.Imagens ??
            [],

          embalagem:
            p.embalagem ||
            p.Embalagem ||
            '',

          categoriaId:
            p.categoriaId ??
            p.CategoriaId ??
            '',

          fornecedorId:
            p.fornecedorId ??
            p.FornecedorId ??
            '',

          eh_fabricacao_propria:
            p.eh_fabricacao_propria ??
            p.ehFabricacaoPropria ??
            p.EhFabricacaoPropria ??
            true,

          preco_atacado:
            p.preco_atacado ??
            p.precoAtacado ??
            p.PrecoAtacado ??
            0,

          preco_lojista:
            p.preco_lojista ??
            p.precoLojista ??
            p.PrecoLojista ??
            0,

          preco_varejo:
            p.preco_varejo ??
            p.precoVarejo ??
            p.PrecoVarejo ??
            0,

          estoqueInicial:
            p.estoqueInicial ??
            p.estoque ??
            p.Estoque ??
            0,

          esta_ativo:
            p.esta_ativo ??
            p.EstaAtivo ??
            true
        }));

        console.log(
          'PRODUTOS NORMALIZADOS:',
          normalizedData
        );

        setProdutos(normalizedData);
      } else {
        setProdutos([]);
      }
    } catch (e) {
      console.error(
        'Erro ao carregar produtos',
        e
      );
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      api.get('/api/categorias')
        .then(res => {
          setCategoriasDisponiveis(
            res.data || []
          );
        })
        .catch(e => {
          console.error(
            'Erro ao carregar categorias',
            e
          );
        });

      api.get('/api/fornecedores')
        .then(res => {
          setFornecedoresDisponiveis(
            res.data || []
          );
        })
        .catch(e => {
          console.error(
            'Erro ao carregar fornecedores',
            e
          );
        });
    }
  }, [isModalOpen]);

  useEffect(() => {
    return () => {
      imagensPreview.forEach(imagem => {
        if (imagem?.startsWith('blob:')) {
          URL.revokeObjectURL(imagem);
        }
      });
    };
  }, [imagensPreview]);

  const formatCurrency = val => {
    return Number(val || 0).toLocaleString(
      'pt-BR',
      {
        style: 'currency',
        currency: 'BRL'
      }
    );
  };

  const metricas = useMemo(() => {
    const total = produtos.length;

    const totaisOrigem = produtos.reduce(
      (acc, p) => {
        const isProprio =
          p.ehFabricacaoPropria ??
          p.EhFabricacaoPropria ??
          p.eh_fabricacao_propria ??
          (p.origem === 'Próprio (PCP)');

        if (isProprio) {
          acc.proprios += 1;
        } else {
          acc.terceiros += 1;
        }

        return acc;
      },
      {
        proprios: 0,
        terceiros: 0
      }
    );

    const totalInativos = produtos.filter(p => {
      const statusAtual =
        p.estaAtivo ??
        p.EstaAtivo ??
        p.esta_ativo ??
        true;

      return !statusAtual;
    }).length;

    return {
      total,
      proprios: totaisOrigem.proprios,
      terceiros: totaisOrigem.terceiros,
      inativos: totalInativos
    };
  }, [produtos]);

  const produtosFiltrados = useMemo(() => {
    return produtos.filter(p => {
      const termo = (
        searchTerm || ''
      ).toLowerCase();

      const desc = (
        p.descricao ||
        p.Descricao ||
        ''
      ).toLowerCase();

      const cod = (
        p.codigo_comercial ||
        p.codigoComercial ||
        p.CodigoComercial ||
        ''
      ).toLowerCase();

      const matchSearch =
        desc.includes(termo) ||
        cod.includes(termo);

      const isProprio =
        p.ehFabricacaoPropria ??
        p.EhFabricacaoPropria ??
        p.eh_fabricacao_propria ??
        (p.origem === 'Próprio (PCP)');

      let matchOrigem = true;

      if (filtroOrigem === 'PROPRIO') {
        matchOrigem = isProprio;
      }

      if (filtroOrigem === 'TERCEIRO') {
        matchOrigem = !isProprio;
      }

      return matchSearch && matchOrigem;
    });
  }, [
    produtos,
    searchTerm,
    filtroOrigem
  ]);

  const limparImagens = () => {
    imagensPreview.forEach(imagem => {
      if (imagem?.startsWith('blob:')) {
        URL.revokeObjectURL(imagem);
      }
    });

    setImagensArquivos([]);
    setImagensPreview([]);
  };

  const handleNovoProduto = () => {
    setProdutoEmEdicao(null);

    limparImagens();

    setFormData({
      codigo_comercial: '',
      descricao: '',
      descricao_detalhada: '',
      imagem_url: '',
      imagens: [],
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

  const handleEditarProduto = prod => {
    setProdutoEmEdicao(prod);

    limparImagens();

    const imagemExistente =
      prod.imagem_url ??
      prod.imagemUrl ??
      prod.ImagemUrl ??
      '';

    const imagensExistentes =
      prod.imagens ??
      prod.Imagens ??
      [];

    const imagensValidas =
      Array.isArray(imagensExistentes)
        ? imagensExistentes.filter(Boolean)
        : [];

    const imagensFinais =
      imagensValidas.length > 0
        ? imagensValidas
        : imagemExistente
          ? [imagemExistente]
          : [];

    setImagensPreview(imagensFinais);

    setFormData({
      codigo_comercial:
        prod.codigo_comercial ||
        prod.codigoComercial ||
        prod.CodigoComercial ||
        '',

      descricao:
        prod.descricao ||
        prod.Descricao ||
        '',

      descricao_detalhada:
        prod.descricao_detalhada ??
        prod.descricaoDetalhada ??
        prod.DescricaoDetalhada ??
        '',

      imagem_url:
        imagemExistente,

      imagens:
        imagensFinais,

      embalagem:
        prod.embalagem ||
        prod.Embalagem ||
        '',

      categoriaId:
        prod.categoriaId ??
        prod.CategoriaId ??
        '',

      fornecedorId:
        prod.fornecedorId ??
        prod.FornecedorId ??
        '',

      eh_fabricacao_propria:
        prod.eh_fabricacao_propria ??
        prod.ehFabricacaoPropria ??
        prod.EhFabricacaoPropria ??
        true,

      preco_atacado:
        prod.preco_atacado ??
        prod.precoAtacado ??
        prod.PrecoAtacado ??
        0,

      preco_lojista:
        prod.preco_lojista ??
        prod.precoLojista ??
        prod.PrecoLojista ??
        0,

      preco_varejo:
        prod.preco_varejo ??
        prod.precoVarejo ??
        prod.PrecoVarejo ??
        0,

      estoqueInicial:
        prod.estoqueInicial ??
        prod.EstoqueInicial ??
        prod.estoque ??
        prod.Estoque ??
        0
    });

    setIsModalOpen(true);
  };

  const handleSelecionarImagens = e => {
    const arquivosSelecionados = Array.from(
      e.target.files || []
    );

    if (arquivosSelecionados.length === 0) {
      return;
    }

    const tiposPermitidos = [
      'image/png',
      'image/jpeg',
      'image/webp'
    ];

    const tamanhoMaximo =
      5 * 1024 * 1024;

    const arquivosInvalidos =
      arquivosSelecionados.find(arquivo => {
        return (
          !tiposPermitidos.includes(
            arquivo.type
          ) ||
          arquivo.size > tamanhoMaximo
        );
      });

    if (arquivosInvalidos) {
      if (
        !tiposPermitidos.includes(
          arquivosInvalidos.type
        )
      ) {
        showToast(
          'Formato inválido. Selecione PNG, JPG, JPEG ou WEBP.',
          'error'
        );
      } else {
        showToast(
          'Cada imagem deve ter no máximo 5 MB.',
          'error'
        );
      }

      e.target.value = '';
      return;
    }

    const imagensAtuais =
      imagensPreview || [];

    const quantidadeTotal =
      imagensAtuais.length +
      arquivosSelecionados.length;

    if (quantidadeTotal > 4) {
      showToast(
        'Um produto pode ter no máximo 4 imagens.',
        'error'
      );

      e.target.value = '';
      return;
    }

    const novosPreviews =
      arquivosSelecionados.map(
        arquivo =>
          URL.createObjectURL(arquivo)
      );

    setImagensArquivos(prev => [
      ...prev,
      ...arquivosSelecionados
    ]);

    setImagensPreview(prev => [
      ...prev,
      ...novosPreviews
    ]);

    e.target.value = '';
  };

  const handleRemoverImagem = index => {
    const imagemRemovida =
      imagensPreview[index];

    if (
      imagemRemovida?.startsWith('blob:')
    ) {
      URL.revokeObjectURL(
        imagemRemovida
      );
    }

    const quantidadeImagensExistentes =
      (
        formData.imagens || []
      ).length;

    if (
      index >= quantidadeImagensExistentes
    ) {
      const indexArquivo =
        index -
        quantidadeImagensExistentes;

      setImagensArquivos(prev =>
        prev.filter(
          (_, i) =>
            i !== indexArquivo
        )
      );
    }

    setImagensPreview(prev =>
      prev.filter(
        (_, i) => i !== index
      )
    );

    setFormData(prev => ({
      ...prev,
      imagens:
        prev.imagens?.filter(
          (_, i) => i !== index
        ) || []
    }));
  };

  const handleSalvarProduto = async e => {
    e.preventDefault();

    if (
      !formData.descricao ||
      !formData.codigo_comercial
    ) {
      showToast(
        'Descrição e Código Comercial (SKU) são obrigatórios.',
        'error'
      );

      return;
    }

    if (
      imagensPreview.length > 4
    ) {
      showToast(
        'Um produto pode ter no máximo 4 imagens.',
        'error'
      );

      return;
    }

    if (
      !formData.embalagem
    ) {
      showToast(
        'Embalagem é obrigatória.',
        'error'
      );

      return;
    }

    if (
      !formData.eh_fabricacao_propria &&
      !formData.fornecedorId
    ) {
      showToast(
        'Selecione um fornecedor para produtos de terceiros.',
        'error'
      );

      return;
    }

    try {
      let imagensUrls = (
        formData.imagens || []
      ).filter(Boolean);

      if (
        imagensArquivos.length > 0
      ) {
        const novasImagensUrls = [];

        for (
          const imagemArquivo of imagensArquivos
        ) {
          const uploadFormData =
            new FormData();

          uploadFormData.append(
            'arquivo',
            imagemArquivo
          );

          const uploadResponse =
            await api.post(
              '/api/produtos/upload-imagem',
              uploadFormData
            );

          const imagemUrl =
            uploadResponse.data?.imagemUrl ||
            uploadResponse.data?.imagem_url ||
            uploadResponse.data?.ImagemUrl;

          if (!imagemUrl) {
            throw new Error(
              'A API não retornou a URL da imagem.'
            );
          }

          novasImagensUrls.push(
            imagemUrl
          );
        }

        imagensUrls = [
          ...imagensUrls,
          ...novasImagensUrls
        ];
      }

      if (
        imagensUrls.length > 4
      ) {
        showToast(
          'Um produto pode ter no máximo 4 imagens.',
          'error'
        );

        return;
      }

      const imagemPrincipal =
        imagensUrls[0] ||
        null;

      const precoAtacado =
        parseFloat(
          String(
            formData.preco_atacado
          ).replace(',', '.')
        ) || 0;

      const precoLojista =
        parseFloat(
          String(
            formData.preco_lojista
          ).replace(',', '.')
        ) || 0;

      const precoVarejo =
        parseFloat(
          String(
            formData.preco_varejo
          ).replace(',', '.')
        ) || 0;

      const estoque =
        parseInt(
          formData.estoqueInicial,
          10
        ) || 0;

      const ehFabricacao =
        Boolean(
          formData.eh_fabricacao_propria
        );

      const fornId =
        ehFabricacao
          ? null
          : formData.fornecedorId;

      const produtoPayload = {
        categoriaId:
          formData.categoriaId || null,

        codigoComercial:
          formData.codigo_comercial,

        descricao:
          formData.descricao,

        descricaoDetalhada:
          formData.descricao_detalhada ||
          null,

        imagemUrl:
          imagemPrincipal,

        imagens:
          imagensUrls,

        embalagem:
          formData.embalagem,

        fornecedorId:
          fornId,

        ehFabricacaoPropria:
          ehFabricacao,

        precoAtacado:
          precoAtacado,

        precoLojista:
          precoLojista,

        precoVarejo:
          precoVarejo,

        estoqueInicial:
          estoque,

        estoque:
          estoque
      };

      console.log(
        'PAYLOAD DO PRODUTO:',
        produtoPayload
      );

      if (produtoEmEdicao) {
        await api.put(
          `/api/produtos/${produtoEmEdicao.id}`,
          produtoPayload
        );

        showToast(
          'Produto atualizado com sucesso!'
        );
      } else {
        await api.post(
          '/api/produtos',
          produtoPayload
        );

        showToast(
          'Produto cadastrado com sucesso!'
        );
      }

      limparImagens();

      setProdutoEmEdicao(null);

      setIsModalOpen(false);

      fetchProdutos();
    } catch (erro) {
      console.error(
        'Erro ao salvar produto:',
        erro
      );

      const msg =
        erro.response?.data?.mensagem ||
        erro.response?.data?.errors ||
        erro.message;

      showToast(
        typeof msg === 'object'
          ? JSON.stringify(msg)
          : msg ||
            'Falha ao comunicar com o servidor.',
        'error'
      );
    }
  };

  const handleToggleStatus =
    produtoSelecionado => {
      const statusAtual =
        produtoSelecionado.estaAtivo ??
        produtoSelecionado.EstaAtivo ??
        produtoSelecionado.esta_ativo ??
        true;

      const novoStatus =
        !statusAtual;

      setConfirmModal({
        isOpen: true,

        title: novoStatus
          ? 'Ativar Produto'
          : 'Inativar Produto',

        message:
          `Deseja realmente ${
            novoStatus
              ? 'ATIVAR'
              : 'INATIVAR'
          } o produto ${
            produtoSelecionado.descricao ??
            produtoSelecionado.Descricao
          }?`,

        isDanger:
          !novoStatus,

        onConfirm:
          async () => {
            setConfirmModal(
              prev => ({
                ...prev,
                isOpen: false
              })
            );

            try {
              const endpointAcao =
                novoStatus
                  ? 'reativar'
                  : 'inativar';

              const produtoId =
                produtoSelecionado.id ||
                produtoSelecionado.Id;

              await api.patch(
                `/api/produtos/${produtoId}/${endpointAcao}`
              );

              showToast(
                `Produto ${
                  novoStatus
                    ? 'ativado'
                    : 'inativado'
                } com sucesso!`
              );
            } catch (error) {
              console.error(
                'Erro ao alterar status:',
                error
              );

              showToast(
                'Erro ao alterar o status do produto.',
                'error'
              );
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
            <Package className="text-amber-500" />
            Cadastro de Produtos
          </h1>

          <p className="text-slate-500 mt-1">
            Gerenciamento do catálogo híbrido (Atacado e Varejo).
          </p>
        </div>

        <button
          onClick={handleNovoProduto}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Plus size={20} />
          Cadastrar Novo Produto
        </button>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
            <Package size={24} />
          </div>

          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">
              Total no Catálogo
            </p>

            <h3 className="text-2xl font-black text-slate-800">
              {metricas.total}
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Factory size={24} />
          </div>

          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">
              Próprios (PCP)
            </p>

            <h3 className="text-2xl font-black text-slate-800">
              {metricas.proprios}
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Store size={24} />
          </div>

          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">
              Terceiros
            </p>

            <h3 className="text-2xl font-black text-slate-800">
              {metricas.terceiros}
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <Archive size={24} />
          </div>

          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">
              Inativos
            </p>

            <h3 className="text-2xl font-black text-slate-800">
              {metricas.inativos}
            </h3>
          </div>
        </div>

      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-3 rounded-2xl shadow-sm border border-slate-200">

        <div className="flex items-center gap-3 w-full sm:flex-1 pl-2">

          <Search
            className="text-slate-400"
            size={20}
          />

          <input
            type="text"
            placeholder="Buscar por nome ou SKU..."
            className="w-full p-2 outline-none text-slate-700 font-medium text-sm"
            value={searchTerm}
            onChange={e =>
              setSearchTerm(
                e.target.value
              )
            }
          />

        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">

          <button
            onClick={() =>
              setFiltroOrigem('TODOS')
            }
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              filtroOrigem === 'TODOS'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos
          </button>

          <button
            onClick={() =>
              setFiltroOrigem('PROPRIO')
            }
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              filtroOrigem === 'PROPRIO'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Próprios
          </button>

          <button
            onClick={() =>
              setFiltroOrigem('TERCEIRO')
            }
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              filtroOrigem === 'TERCEIRO'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
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

              <th className="p-4">
                Produto / SKU
              </th>

              <th className="p-4">
                Origem
              </th>

              <th className="p-4 text-right">
                Preço Atacado
              </th>

              <th className="p-4 text-right">
                Preço Lojista
              </th>

              <th className="p-4 text-right">
                Preço Varejo
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

            {produtosFiltrados.map(
              produto => {
                const statusAtivo =
                  produto.estaAtivo ??
                  produto.EstaAtivo ??
                  produto.esta_ativo ??
                  false;

                const isProprio =
                  produto.ehFabricacaoPropria ??
                  produto.EhFabricacaoPropria ??
                  produto.eh_fabricacao_propria ??
                  true;

                const imagensProduto =
                  produto.imagens ??
                  produto.Imagens ??
                  [];

                const imagemProduto =
                  imagensProduto?.[0] ??
                  produto.imagem_url ??
                  produto.imagemUrl ??
                  produto.ImagemUrl ??
                  '';

                return (
                  <tr
                    key={
                      produto.id ||
                      produto.Id
                    }
                    className="hover:bg-slate-50 transition-colors"
                  >

                    <td className="p-4">

                      <div className="flex items-center gap-3">

                        {imagemProduto ? (
                          <img
                            src={imagemProduto}
                            alt={
                              produto.descricao ||
                              produto.Descricao ||
                              'Produto'
                            }
                            className="w-12 h-12 rounded-lg object-cover border border-slate-200 bg-slate-50"
                            onError={e => {
                              e.currentTarget.style.display =
                                'none';
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                            <ImageIcon size={20} />
                          </div>
                        )}

                        <div>

                          <div className="flex items-center gap-2">

                            <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">
                              {produto.codigoComercial ??
                                produto.CodigoComercial ??
                                produto.codigo_comercial ??
                                ''}
                            </span>

                            <p className="font-bold text-slate-800">
                              {produto.descricao ??
                                produto.Descricao ??
                                ''}
                            </p>

                          </div>

                          {(produto.embalagem ??
                            produto.Embalagem) && (
                            <p className="text-xs text-slate-400 mt-0.5">
                              Embalagem:{' '}
                              {produto.embalagem ??
                                produto.Embalagem}
                            </p>
                          )}

                        </div>

                      </div>

                    </td>

                    <td className="p-4">

                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium text-xs ${
                          isProprio
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
                            : 'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20'
                        }`}
                      >
                        {isProprio
                          ? 'Próprio'
                          : 'Terceiro'}
                      </span>

                    </td>

                    <td className="p-4 text-right font-bold text-slate-700">
                      {formatCurrency(
                        produto.preco_atacado ??
                        produto.precoAtacado ??
                        produto.PrecoAtacado ??
                        0
                      )}
                    </td>

                    <td className="p-4 text-right text-slate-600">
                      {formatCurrency(
                        produto.preco_lojista ??
                        produto.precoLojista ??
                        produto.PrecoLojista ??
                        0
                      )}
                    </td>

                    <td className="p-4 text-right text-slate-700 font-black">
                      {formatCurrency(
                        produto.preco_varejo ??
                        produto.precoVarejo ??
                        produto.PrecoVarejo ??
                        0
                      )}
                    </td>

                    <td className="p-4 text-center">

                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          statusAtivo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {statusAtivo
                          ? 'Ativo'
                          : 'Inativo'}
                      </span>

                    </td>

                    <td className="p-4 text-center">

                      <div className="flex justify-center items-center gap-2">

                        <button
                          onClick={() =>
                            handleEditarProduto(
                              produto
                            )
                          }
                          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Editar Produto"
                        >
                          <Edit3 size={16} />
                        </button>

                        <button
                          onClick={() =>
                            handleToggleStatus(
                              produto
                            )
                          }
                          className={`p-2 rounded-lg transition-colors cursor-pointer ${
                            statusAtivo
                              ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={
                            statusAtivo
                              ? 'Inativar Produto'
                              : 'Ativar Produto'
                          }
                        >
                          {statusAtivo ? (
                            <Archive size={16} />
                          ) : (
                            <RotateCcw size={16} />
                          )}
                        </button>

                      </div>

                    </td>

                  </tr>
                );
              }
            )}

            {produtosFiltrados.length ===
              0 && (
              <tr>
                <td
                  colSpan="7"
                  className="p-8 text-center text-slate-400 font-semibold"
                >
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

          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-xl overflow-hidden border border-slate-200 flex flex-col">

            {/* Cabeçalho */}
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">

              <div>
                <h2 className="text-xl font-black text-slate-800">
                  {produtoEmEdicao
                    ? 'Editar Produto'
                    : 'Cadastrar Novo Produto'}
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Informe os dados comerciais e a origem do produto.
                </p>
              </div>

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
              onSubmit={handleSalvarProduto}
              className="p-6 space-y-6 overflow-y-auto"
            >

              {/* INFORMAÇÕES DO PRODUTO */}
              <section>

                <div className="flex items-center gap-2 mb-4">

                  <Package
                    size={18}
                    className="text-amber-500"
                  />

                  <div>
                    <h3 className="text-sm font-black text-slate-800">
                      Informações do Produto
                    </h3>

                    <p className="text-xs text-slate-400">
                      Identificação e apresentação do produto.
                    </p>
                  </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* SKU */}
                  <div>

                    <label className="block text-xs font-bold text-slate-500 uppercase">
                      Código Comercial / SKU *
                    </label>

                    <input
                      type="text"
                      required
                      maxLength="50"
                      value={
                        formData.codigo_comercial ??
                        ''
                      }
                      onChange={e =>
                        setFormData({
                          ...formData,
                          codigo_comercial:
                            e.target.value
                        })
                      }
                      placeholder="Ex: COD-044"
                      className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm mt-1 font-mono font-medium"
                    />

                  </div>

                  {/* EMBALAGEM */}
                  <div>

                    <label className="block text-xs font-bold text-slate-500 uppercase">
                      Embalagem *
                    </label>

                    <input
                      type="text"
                      required
                      maxLength="50"
                      value={
                        formData.embalagem ??
                        ''
                      }
                      onChange={e =>
                        setFormData({
                          ...formData,
                          embalagem:
                            e.target.value
                        })
                      }
                      placeholder="Ex: Caixa 20un"
                      className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm mt-1 font-medium"
                    />

                  </div>

                  {/* DESCRIÇÃO */}
                  <div className="md:col-span-2">

                    <label className="block text-xs font-bold text-slate-500 uppercase">
                      Descrição / Nome do Produto *
                    </label>

                    <input
                      type="text"
                      required
                      maxLength="255"
                      value={
                        formData.descricao ??
                        ''
                      }
                      onChange={e =>
                        setFormData({
                          ...formData,
                          descricao:
                            e.target.value
                        })
                      }
                      placeholder="Ex: Doce de Leite Artesanal"
                      className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm mt-1 font-medium"
                    />

                  </div>

                  {/* DESCRIÇÃO DETALHADA */}
                  <div className="md:col-span-2">

                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Descrição detalhada
                    </label>

                    <textarea
                      value={
                        formData.descricao_detalhada ??
                        ''
                      }
                      onChange={e =>
                        setFormData({
                          ...formData,
                          descricao_detalhada:
                            e.target.value
                        })
                      }
                      rows={4}
                      placeholder="Descreva características, ingredientes, diferenciais e outras informações do produto..."
                      className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    />

                  </div>

                  {/* IMAGENS */}
                  <div className="md:col-span-2">

                    <div className="flex items-center justify-between">

                      <label className="block text-xs font-bold text-slate-500 uppercase">
                        Imagens do Produto
                      </label>

                      <span className="text-xs font-bold text-slate-400">
                        {imagensPreview.length}/4
                      </span>

                    </div>

                    <div className="mt-2">

                      <label
                        htmlFor="imagens-produto"
                        className={`w-full min-h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-colors ${
                          imagensPreview.length >= 4
                            ? 'border-slate-200 bg-slate-100 cursor-not-allowed opacity-60'
                            : 'border-slate-300 hover:border-amber-400 cursor-pointer bg-slate-50 hover:bg-amber-50/30'
                        }`}
                      >

                        <ImageIcon
                          size={28}
                          className="text-slate-400"
                        />

                        <span className="text-sm font-bold text-slate-600">
                          {imagensPreview.length >= 4
                            ? 'Limite de 4 imagens atingido'
                            : 'Selecionar imagens'}
                        </span>

                        <span className="text-xs text-slate-400">
                          PNG, JPG, JPEG ou WEBP — máximo 5 MB por imagem
                        </span>

                      </label>

                      <input
                        id="imagens-produto"
                        type="file"
                        multiple
                        accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                        onChange={
                          handleSelecionarImagens
                        }
                        disabled={
                          imagensPreview.length >=
                          4
                        }
                        className="hidden"
                      />

                    </div>

                    {imagensPreview.length >
                      0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">

                        {imagensPreview.map(
                          (
                            imagem,
                            index
                          ) => (
                            <div
                              key={`${imagem}-${index}`}
                              className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50 group"
                            >

                              <img
                                src={imagem}
                                alt={`Produto - imagem ${
                                  index + 1
                                }`}
                                className="w-full h-full object-cover"
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoverImagem(
                                    index
                                  )
                                }
                                className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-sm cursor-pointer"
                                title="Remover imagem"
                              >
                                <X
                                  size={14}
                                />
                              </button>

                              {index ===
                                0 && (
                                <span className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-slate-900/75 text-white text-[10px] font-bold">
                                  Principal
                                </span>
                              )}

                            </div>
                          )
                        )}

                      </div>
                    )}

                    <p className="text-xs text-slate-400 mt-2">
                      A primeira imagem será utilizada como imagem principal do produto.
                    </p>

                  </div>

                  {/* CATEGORIA */}
                  <div className="md:col-span-2">

                    <label className="block text-xs font-bold text-slate-500 uppercase">
                      Categoria
                    </label>

                    <select
                      value={
                        formData.categoriaId ??
                        ''
                      }
                      onChange={e =>
                        setFormData({
                          ...formData,
                          categoriaId:
                            e.target.value
                        })
                      }
                      className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm mt-1 font-medium bg-white cursor-pointer"
                    >

                      <option value="">
                        Sem categoria
                      </option>

                      {(
                        categoriasDisponiveis ||
                        []
                      ).map(cat => (
                        <option
                          key={cat.id}
                          value={cat.id}
                        >
                          {cat.nome}
                        </option>
                      ))}

                    </select>

                    {categoriasDisponiveis.length ===
                      0 && (
                      <p className="text-xs text-amber-600 mt-1.5">
                        Nenhuma categoria disponível para seleção.
                      </p>
                    )}

                  </div>

                </div>
              </section>

              {/* ORIGEM DO PRODUTO */}
              <section className="border-t border-slate-200 pt-6">

                <div className="flex items-center gap-2 mb-4">

                  <Factory
                    size={18}
                    className="text-amber-500"
                  />

                  <div>
                    <h3 className="text-sm font-black text-slate-800">
                      Origem do Produto
                    </h3>

                    <p className="text-xs text-slate-400">
                      Informe como este produto é obtido pela empresa.
                    </p>
                  </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                  {/* PRODUÇÃO PRÓPRIA */}
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        eh_fabricacao_propria:
                          true,
                        fornecedorId: ''
                      })
                    }
                    className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      formData.eh_fabricacao_propria
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >

                    <div className="flex items-start gap-3">

                      <div
                        className={`p-2 rounded-lg ${
                          formData.eh_fabricacao_propria
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <Factory size={20} />
                      </div>

                      <div className="flex-1">

                        <div className="flex items-center justify-between gap-2">

                          <h4 className="font-bold text-slate-800">
                            Produção própria
                          </h4>

                          {formData.eh_fabricacao_propria && (
                            <span className="text-xs font-bold text-emerald-600">
                              Selecionado
                            </span>
                          )}

                        </div>

                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          Produto fabricado internamente pela empresa.
                        </p>

                      </div>

                    </div>

                  </button>

                  {/* FORNECEDOR */}
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        eh_fabricacao_propria:
                          false
                      })
                    }
                    className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      !formData.eh_fabricacao_propria
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >

                    <div className="flex items-start gap-3">

                      <div
                        className={`p-2 rounded-lg ${
                          !formData.eh_fabricacao_propria
                            ? 'bg-purple-100 text-purple-600'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <Truck size={20} />
                      </div>

                      <div className="flex-1">

                        <div className="flex items-center justify-between gap-2">

                          <h4 className="font-bold text-slate-800">
                            Fornecedor
                          </h4>

                          {!formData.eh_fabricacao_propria && (
                            <span className="text-xs font-bold text-purple-600">
                              Selecionado
                            </span>
                          )}

                        </div>

                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          Produto adquirido de uma empresa fornecedora.
                        </p>

                      </div>

                    </div>

                  </button>

                </div>

                {/* FORNECEDOR */}
                {!formData.eh_fabricacao_propria && (
                  <div className="mt-4 p-4 rounded-xl bg-purple-50 border border-purple-100">

                    <div className="mb-3">

                      <label className="block text-xs font-bold text-purple-700 uppercase">
                        Fornecedor / Empresa de Origem *
                      </label>

                      <p className="text-xs text-purple-600 mt-1">
                        Selecione a empresa responsável pelo fornecimento deste produto.
                      </p>

                    </div>

                    <select
                      required
                      value={
                        formData.fornecedorId ??
                        ''
                      }
                      onChange={e =>
                        setFormData({
                          ...formData,
                          fornecedorId:
                            e.target.value
                        })
                      }
                      className="w-full p-3 border border-purple-200 rounded-xl outline-none focus:border-purple-500 text-sm font-medium bg-white cursor-pointer"
                    >

                      <option value="">
                        Selecione um fornecedor...
                      </option>

                      {(
                        fornecedoresDisponiveis ||
                        []
                      ).map(forn => (
                        <option
                          key={forn.id}
                          value={forn.id}
                        >
                          {forn.razaoSocial ||
                            forn.nome_ou_razao_social ||
                            forn.nomeOuRazaoSocial}
                        </option>
                      ))}

                    </select>

                    {fornecedoresDisponiveis.length ===
                      0 && (
                      <p className="text-xs text-rose-600 mt-2">
                        Nenhum fornecedor disponível para seleção.
                      </p>
                    )}

                  </div>
                )}

              </section>

              {/* PRECIFICAÇÃO */}
              <section className="border-t border-slate-200 pt-6">

                <div className="flex items-center gap-2 mb-4">

                  <Store
                    size={18}
                    className="text-amber-500"
                  />

                  <div>
                    <h3 className="text-sm font-black text-slate-800">
                      Precificação
                    </h3>

                    <p className="text-xs text-slate-400">
                      Defina os valores para cada modalidade de venda.
                    </p>
                  </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  {/* ATACADO */}
                  <div>

                    <label className="block text-xs font-bold text-slate-500 uppercase">
                      Preço Atacado (R$) *
                    </label>

                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={
                        formData.preco_atacado ??
                        ''
                      }
                      onChange={e =>
                        setFormData({
                          ...formData,
                          preco_atacado:
                            e.target.value
                        })
                      }
                      placeholder="0.00"
                      className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm mt-1 font-medium"
                    />

                  </div>

                  {/* LOJISTA */}
                  <div>

                    <label className="block text-xs font-bold text-slate-500 uppercase">
                      Preço Lojista (R$)
                    </label>

                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={
                        formData.preco_lojista ??
                        ''
                      }
                      onChange={e =>
                        setFormData({
                          ...formData,
                          preco_lojista:
                            e.target.value
                        })
                      }
                      placeholder="0.00"
                      className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm mt-1 font-medium"
                    />

                  </div>

                  {/* VAREJO */}
                  <div>

                    <label className="block text-xs font-bold text-slate-500 uppercase">
                      Preço Varejo (R$) *
                    </label>

                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={
                        formData.preco_varejo ??
                        ''
                      }
                      onChange={e =>
                        setFormData({
                          ...formData,
                          preco_varejo:
                            e.target.value
                        })
                      }
                      placeholder="0.00"
                      className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm mt-1 font-medium"
                    />

                  </div>

                </div>
              </section>

              {/* AÇÕES */}
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
                  Salvar Produto
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

      {/* Feedbacks */}
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
        isOpen={
          confirmModal.isOpen
        }
        title={
          confirmModal.title
        }
        message={
          confirmModal.message
        }
        isDanger={
          confirmModal.isDanger
        }
        onConfirm={
          confirmModal.onConfirm
        }
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
