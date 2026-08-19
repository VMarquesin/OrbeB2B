import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Store, ShoppingCart, Bell, UserCircle, X, LogOut, Building2, Pencil, Loader2, AlertCircle } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { solicitarAlteracaoEndereco, obterMeuPerfil } from '../../services/cadastroService';
import { obterUsuarioLogado, logout as logoutService } from '../../services/authService';
import logo from '../../assets/logo.jpg';

const navLinks = [
  { label: 'Catálogo', to: '/portal/catalogo', end: true },
  { label: 'Meus Pedidos', to: '/portal/pedidos', end: false },
  { label: 'Suporte', to: '/portal/suporte', end: false },
];

export default function PortalLayout() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { cartItems, totalItems } = useCart();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const usuarioLogado = obterUsuarioLogado();
  const [empresa, setEmpresa] = useState({
    nomeResponsavel: '',
    telefone: '',
    email: '',
    nomeFantasia: '',
    razaoSocial: usuarioLogado?.nomeCliente ?? 'Empresa',
    cnpj: '—',
    endereco: 'Consulte o CRM',
    cidade: '—',
    limiteCredito: '—',
  });
  const [loadingPerfil, setLoadingPerfil] = useState(false);
  const [erroPerfil, setErroPerfil] = useState('');

  // Busca os dados completos do perfil do cliente ao abrir o modal
  useEffect(() => {
    if (!isModalOpen) return;

    let cancelado = false;
    async function carregarPerfil() {
      setLoadingPerfil(true);
      setErroPerfil('');
      try {
        const data = await obterMeuPerfil();
        if (!cancelado && data) {
          const enderecoFormatado = [data.logradouro, data.numero, data.bairro].filter(Boolean).join(', ');
          const cidadeFormatada = [data.cidade, data.uf, data.cep ? `CEP ${data.cep}` : ''].filter(Boolean).join(' - ');

          const cnpjFormatado = data.cnpj && data.cnpj.length === 14
            ? data.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
            : (data.cnpj || '—');

          setEmpresa({
            nomeResponsavel: data.nome || '—',
            telefone: data.telefone || '—',
            email: data.email || '—',
            nomeFantasia: data.nomeFantasia || '—',
            razaoSocial: data.razaoSocial || usuarioLogado?.nomeCliente || '—',
            cnpj: cnpjFormatado,
            endereco: enderecoFormatado || 'Endereço não cadastrado',
            cidade: cidadeFormatada || '—',
            limiteCredito: '—',
          });
        }
      } catch (err) {
        if (!cancelado) {
          setErroPerfil(err.mensagemNormalizada ?? 'Erro ao carregar dados do perfil.');
        }
      } finally {
        if (!cancelado) {
          setLoadingPerfil(false);
        }
      }
    }

    carregarPerfil();
    return () => { cancelado = true; };
  }, [isModalOpen]);

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [loadingEndereco, setLoadingEndereco] = useState(false);
  const [erroEndereco, setErroEndereco] = useState('');
  const [addressRequest, setAddressRequest] = useState({
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
    motivo: "",
  });

  async function buscarCep(cep) {
    const cepLimpo = cep.replace(/\D/g, "");

    if (cepLimpo.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (data.erro) {
        alert("CEP não encontrado.");
        return;
      }

      setAddressRequest((prev) => ({
        ...prev,
        cep: cepLimpo,
        endereco: data.logradouro,
        bairro: data.bairro,
        cidade: data.localidade,
        uf: data.uf,
      }));
    } catch (error) {
      console.error(error);
      alert("Erro ao consultar o CEP.");
    }
  }


  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleVerDados() {
    setIsDropdownOpen(false);
    setIsModalOpen(true);
  }

  function handleSair() {
    setIsDropdownOpen(false);
    logoutService(); // limpa localStorage e redireciona para /login
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setEmpresa((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  useEffect(() => {
    if (isModalOpen || showAddressModal || isCartModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen, showAddressModal, isCartModalOpen]);

  async function enviarSolicitacao() {
    setErroEndereco('');

    if (addressRequest.cep.replace(/\D/g, '').length !== 8) {
      setErroEndereco('CEP inválido. Certifique-se de que possui 8 dígitos.');
      return;
    }

    if (
      !addressRequest.endereco ||
      !addressRequest.numero ||
      !addressRequest.cidade ||
      !addressRequest.uf ||
      !addressRequest.motivo
    ) {
      setErroEndereco('Preencha todos os campos obrigatórios.');
      return;
    }

    setLoadingEndereco(true);
    try {
      // Zero Trust: clienteId NÃO enviado — vem do JWT no back-end
      await solicitarAlteracaoEndereco({
        cep: addressRequest.cep,
        uf: addressRequest.uf,
        cidade: addressRequest.cidade,
        bairro: addressRequest.bairro,
        logradouro: addressRequest.endereco,
        numero: addressRequest.numero,
        complemento: addressRequest.complemento || null,
        motivo: addressRequest.motivo,
      });

      setShowAddressModal(false);
      setAddressRequest({ cep: '', endereco: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '', motivo: '' });
      alert('Solicitação enviada! Nossa equipe analisará em breve.');
    } catch (err) {
      setErroEndereco(err.mensagemNormalizada ?? 'Erro ao enviar solicitação.');
    } finally {
      setLoadingEndereco(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <header className="sticky top-0 z-40 bg-white/95 border-b border-stone-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <nav className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              to="/portal"
              className="flex items-center gap-3 shrink-0"
            >
              <div className="h-[52px] w-[52px] rounded-xl overflow-hidden flex items-center justify-center bg-stone-50 border border-stone-200">
                <img
                  src={logo}
                  alt="A Caseira"
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="flex flex-col leading-tight">
                <span className="text-base font-bold text-stone-900">
                  A Caseira
                </span>

                <span className="text-xs font-semibold text-primary">
                  Portal B2B
                </span>
              </div>
            </Link>

            {/* Nav links */}
            <ul className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.end}
                    className={({ isActive }) =>
                      `text-sm font-medium transition-colors pb-1 border-b-2 ${isActive
                        ? 'text-primary border-primary'
                        : 'text-stone-600 hover:text-stone-900 border-transparent'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>

            {/* Right icons */}
            <div className="flex items-center gap-4 text-stone-400">

              {/* Carrinho */}
              <button
                onClick={() => setIsCartModalOpen(true)}
                className="relative flex items-center justify-center w-7 h-7
                      text-stone-400 hover:text-stone-700 transition-colors"
                aria-label="Carrinho"
              >
                <ShoppingCart
                  className="w-5 h-5"
                  strokeWidth={1.75}
                />

                {totalItems > 0 && (
                  <span
                    className="absolute -top-1 -right-1
                          w-4 h-4 rounded-full
                          bg-primary text-white
                          text-[10px] font-bold
                          flex items-center justify-center"
                  >
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Notificações */}
              <button
                className="flex items-center justify-center w-7 h-7
                      text-stone-400 hover:text-stone-700 transition-colors"
                aria-label="Notificações"
              >
                <Bell
                  className="w-5 h-5"
                  strokeWidth={1.75}
                />
              </button>

              {/* Perfil */}
              <div className="relative" ref={dropdownRef}>

                <button
                  onClick={() => setIsDropdownOpen((v) => !v)}
                  className={`
                  flex items-center justify-center
                  w-7 h-7
                  transition-colors
                  ${isDropdownOpen
                      ? 'text-primary'
                      : 'text-stone-400 hover:text-stone-700'
                    }
                `}
                  aria-label="Perfil"
                  aria-expanded={isDropdownOpen}
                >
                  <UserCircle
                    className="w-5 h-5"
                    strokeWidth={1.75}
                  />
                </button>

                {/* Dropdown menu */}
                {isDropdownOpen && (
                  <div className="
                  absolute
                  left-1/2
                  -translate-x-1/2
                  top-full
                  mt-2
                  w-52
                  bg-white
                  rounded-xl
                  border border-stone-200
                  shadow-xl
                  py-1.5
                  z-50
                ">

                    <div className="px-4 py-2.5 border-b border-stone-100 mb-1">
                      <p className="text-xs font-bold text-stone-800 truncate">
                        {empresa.razaoSocial}
                      </p>

                      <p className="text-[11px] text-stone-400 mt-0.5">
                        {empresa.cnpj}
                      </p>
                    </div>

                    <button
                      onClick={handleVerDados}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition text-left"
                    >
                      <Building2
                        className="w-4 h-4 text-stone-400"
                        strokeWidth={1.75}
                      />

                      Perfil
                    </button>

                    <hr className="border-stone-100 my-1" />

                    <button
                      onClick={handleSair}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition text-left"
                    >
                      <LogOut
                        className="w-4 h-4"
                        strokeWidth={1.75}
                      />

                      Sair do Sistema
                    </button>

                  </div>
                )}

              </div>
            </div>

          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto w-full px-6 lg:px-8 py-8 flex-1">
        <Outlet />
      </main>

      {/* Portal footer */}
      <footer className="border-t border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link
            to="/portal"
            className="flex items-center gap-2 text-stone-700 hover:text-stone-900 transition"
          >
            <Store className="w-4 h-4 text-primary" strokeWidth={1.75} />
            <span className="text-sm font-semibold">A Caseira</span>
          </Link>
          <nav className="flex items-center gap-5 text-xs text-stone-400">
            {['Termos de Uso e Privacidade', 'Ajuda'].map((label) => (
              <Link
                key={label}
                to={label === 'Termos de Uso e Privacidade' ? '/portal/termos' : '/portal/suporte'}
                className="hover:text-stone-700 transition"
              >
                {label}
              </Link>
            ))}
          </nav>
          <p className="text-xs text-stone-400">
            &copy; {new Date().getFullYear()} A Caseira. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      {showAddressModal && !isModalOpen && (
        <div
          className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center p-4"
          onClick={() => setShowAddressModal(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-xl p-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>

            <h2 className="text-xl font-bold mb-2">
              Solicitar alteração de endereço
            </h2>

            <p className="text-sm text-stone-500 mb-6">
              A alteração será enviada para análise da equipe comercial.
            </p>

            <div className="grid grid-cols-2 gap-4">

              <input
                placeholder="CEP"
                value={addressRequest.cep}
                onChange={(e) => {
                  const cep = e.target.value;

                  setAddressRequest({
                    ...addressRequest,
                    cep,
                  });

                  if (cep.replace(/\D/g, "").length === 8) {
                    buscarCep(cep);
                  }
                }}
                className="border rounded-lg p-2"
              />

              <input
                placeholder="Cidade"
                value={addressRequest.cidade}
                onChange={(e) =>
                  setAddressRequest({
                    ...addressRequest,
                    cidade: e.target.value,
                  })
                }
                className="border rounded-lg p-2"
              />

              <input
                placeholder="UF"
                value={addressRequest.uf}
                onChange={(e) =>
                  setAddressRequest({
                    ...addressRequest,
                    uf: e.target.value
                      .replace(/[^a-zA-Z]/g, "")
                      .toUpperCase()
                      .slice(0, 2) // Remove qualquer caractere que não seja letra
                  })
                }
                className="border rounded-lg p-2"
              />

              <input
                placeholder="Bairro"
                value={addressRequest.bairro}
                onChange={(e) =>
                  setAddressRequest({
                    ...addressRequest,
                    bairro: e.target.value,
                  })
                }
                className="border rounded-lg p-2"
              />

            </div>

            <input
              placeholder="Endereço"
              className="mt-4 border rounded-lg p-2 w-full"
              value={addressRequest.endereco}
              onChange={(e) =>
                setAddressRequest({
                  ...addressRequest,
                  endereco: e.target.value,
                })
              }
            />

            <div className="grid grid-cols-2 gap-4 mt-4">

              <input
                placeholder="Número"
                className="border rounded-lg p-2"
                value={addressRequest.numero}
                onChange={(e) =>
                  setAddressRequest({
                    ...addressRequest,
                    numero: e.target.value.replace(/\D/g, "") // Remove qualquer caractere que não seja número
                  })
                }
              />

              <input
                placeholder="Complemento"
                className="border rounded-lg p-2"
                value={addressRequest.complemento}
                onChange={(e) =>
                  setAddressRequest({
                    ...addressRequest,
                    complemento: e.target.value,
                  })
                }
              />

            </div>

            <select
              value={addressRequest.motivo}
              onChange={(e) =>
                setAddressRequest({
                  ...addressRequest,
                  motivo: e.target.value
                })
              }
              className="mt-4 border rounded-lg p-2 w-full"
            >

              <option value="">
                Selecione um motivo
              </option>

              <option>
                Mudança de unidade
              </option>

              <option>
                Correção cadastral
              </option>

              <option>
                Novo centro de distribuição
              </option>

              <option>
                Outro
              </option>

            </select>

            <div className="flex justify-end gap-3 mt-6">

              <button
                onClick={() => setShowAddressModal(false)}
                className="border px-4 py-2 rounded-lg"
              >
                Cancelar
              </button>

              <button
                onClick={enviarSolicitacao}
                className="bg-primary text-white px-5 py-2 rounded-lg"
              >
                Enviar Solicitação
              </button>

            </div>
          </div>
        </div>
      )}

      {/* Modal Carrinho */}
      {isCartModalOpen && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setIsCartModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">
                Meu Carrinho
              </h2>

              <button onClick={() => setIsCartModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {cartItems.length === 0 ? (
              <p className="text-sm text-stone-500">
                Seu carrinho está vazio.
              </p>
            ) : (
              <>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {cartItems.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 border-b pb-3"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />

                      <div className="flex-1">
                        <p className="font-semibold text-sm">
                          {item.name}
                        </p>

                        <p className="text-xs text-stone-500">
                          {item.packaging?.name}
                        </p>

                        <p className="text-xs text-stone-500">
                          Qtde: {item.qty}
                        </p>
                      </div>

                      <span className="font-bold text-sm">
                        R$ {(item.price * item.qty).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setIsCartModalOpen(false);
                    navigate("/portal/carrinho");
                  }}
                  className="mt-6 w-full bg-primary text-white py-3 rounded-xl font-semibold"
                >
                  Ver Compra
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Profile modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={(e) =>
            e.target === e.currentTarget && setIsModalOpen(false)
          }
        >
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <Building2
                  className="w-5 h-5 text-primary"
                  strokeWidth={1.75}
                />

                <h2 className="text-base font-bold text-stone-900">
                  Perfil
                </h2>
              </div>

              <div className="flex items-center gap-2">

                {/* Botão Editar */}
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing((prev) => !prev)}
                    className={`
                inline-flex items-center gap-2
                px-4 py-2.5
                rounded-xl
                text-sm font-semibold
                transition-all duration-200
                shadow-sm
                ${isEditing
                        ? 'bg-stone-100 text-stone-700 border border-stone-300 hover:bg-stone-200'
                        : 'bg-primary text-white border border-primary hover:bg-primary-hover hover:shadow-md'
                      }
              `}
                  >
                    <Pencil className="w-4 h-4" strokeWidth={2.2} />

                    {isEditing ? 'Cancelar' : 'Editar dados'}
                  </button>
                )}

                {/* Botão Fechar */}
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsEditing(false);
                  }}
                  className="text-stone-400 hover:text-stone-700 transition
                       p-1 rounded-lg hover:bg-stone-100"
                  aria-label="Fechar"
                >
                  <X className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-5 overflow-y-auto max-h-[calc(90vh-76px)]">
              {loadingPerfil && (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-stone-400">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm">Carregando dados cadastrais...</p>
                </div>
              )}

              {erroPerfil && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p>{erroPerfil}</p>
                </div>
              )}

              {!loadingPerfil && (
                <>
                  {/* Nome do responsável */}
                  <div>
                    <label className="text-xs font-bold text-stone-500">
                      Nome do responsável
                    </label>

                {isEditing ? (
                  <input
                    type="text"
                    name="nomeResponsavel"
                    value={empresa.nomeResponsavel}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-stone-300
                         bg-white px-3 py-2.5 font-semibold text-stone-800
                         outline-none focus:border-primary focus:ring-2
                         focus:ring-primary/20"
                  />
                ) : (
                  <div className="mt-1 w-full rounded-lg border border-stone-200 bg-stone-100 px-3 py-2">
                    <p className="font-semibold text-stone-800">
                      {empresa.nomeResponsavel}
                    </p>
                  </div>
                )}
              </div>

              {/* Telefone */}
              <div>
                <label className="text-xs font-bold text-stone-500">
                  Telefone
                </label>

                {isEditing ? (
                  <input
                    type="text"
                    name="telefone"
                    value={empresa.telefone}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-stone-300
                         bg-white px-3 py-2.5 font-semibold text-stone-800
                         outline-none focus:border-primary focus:ring-2
                         focus:ring-primary/20"
                  />
                ) : (
                  <div className="mt-1 w-full rounded-lg border border-stone-200 bg-stone-100 px-3 py-2">
                    <p className="font-semibold text-stone-800">
                      {empresa.telefone}
                    </p>
                  </div>
                )}
              </div>

              {/* E-mail */}
              <div>
                <label className="text-xs font-bold text-stone-500">
                  E-mail
                </label>

                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={empresa.email}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-stone-300
                         bg-white px-3 py-2.5 font-semibold text-stone-800
                         outline-none focus:border-primary focus:ring-2
                         focus:ring-primary/20"
                  />
                ) : (
                  <div className="mt-1 w-full rounded-lg border border-stone-200 bg-stone-100 px-3 py-2">
                    <p className="font-semibold text-stone-800">
                      {empresa.email}
                    </p>
                  </div>
                )}
              </div>

              {/* Nome Fantasia */}
              <div>
                <label className="text-xs font-bold text-stone-500">
                  Nome Fantasia
                </label>

                {isEditing ? (
                  <input
                    type="text"
                    name="nomeFantasia"
                    value={empresa.nomeFantasia}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-stone-300
                         bg-white px-3 py-2.5 font-semibold text-stone-800
                         outline-none focus:border-primary focus:ring-2
                         focus:ring-primary/20"
                  />
                ) : (
                  <div className="mt-1 w-full rounded-lg border border-stone-200 bg-stone-100 px-3 py-2">
                    <p className="font-semibold text-stone-800">
                      {empresa.nomeFantasia}
                    </p>
                  </div>
                )}
              </div>

              {/* Razão Social */}
              <div>
                <label className="text-xs font-bold text-stone-500">
                  Razão Social
                </label>

                {isEditing ? (
                  <input
                    type="text"
                    name="razaoSocial"
                    value={empresa.razaoSocial}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-stone-300
                         bg-white px-3 py-2.5 font-semibold text-stone-800
                         outline-none focus:border-primary focus:ring-2
                         focus:ring-primary/20"
                  />
                ) : (
                  <div className="mt-1 w-full rounded-lg border border-stone-200 bg-stone-100 px-3 py-2">
                    <p className="font-semibold text-stone-800">
                      {empresa.razaoSocial || "Razão Social não disponível"}
                    </p>
                  </div>
                )}
              </div>

              {/* CNPJ - somente visualização */}
              <div>
                <label className="text-xs font-bold text-stone-500">
                  CNPJ
                </label>

                <div className="mt-1 w-full rounded-lg border border-stone-200 bg-stone-100 px-3 py-2">
                  <p className="font-semibold text-stone-800">
                    {empresa.cnpj}
                  </p>
                </div>

                <p className="mt-1 text-[11px] text-stone-400">
                  O CNPJ não pode ser alterado pelo portal.
                </p>
              </div>

              {/* Endereço */}
              <div>
                <label className="text-xs font-bold text-stone-500">
                  Endereço de entrega
                </label>

                <div className="mt-2 rounded-lg border bg-stone-50 p-3">
                  <p className="font-semibold">
                    {empresa.endereco}
                  </p>

                  <p className="text-sm text-stone-500">
                    {empresa.cidade}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setShowAddressModal(true);
                  }}
                  className="
              mt-4
              w-full
              flex
              items-center
              justify-center
              gap-2
              px-4
              py-3
              rounded-xl
              bg-primary
              text-white
              font-semibold
              text-sm
              hover:bg-primary-hover
              transition-all
              duration-200
              shadow-sm
            "
                >
                  <Pencil className="w-4 h-4" />
                  Solicitar alteração de endereço
                </button>
              </div>

              {/* Informativo sobre endereço */}
              <div className="bg-stone-100 rounded-xl p-4">
                <h3 className="text-sm font-semibold mb-2">
                  Endereço atual
                </h3>

                <p>{empresa.endereco}</p>

                <p className="text-sm text-stone-500">
                  {empresa.cidade}
                </p>
              </div>

              <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-4">
                <p className="text-sm">
                  Após o envio, a solicitação será analisada pela equipe comercial.
                </p>

                <p className="text-sm mt-2">
                  O endereço atual continuará sendo utilizado até a aprovação.
                </p>
              </div>

              {/* Limite de crédito */}
              <div>
                <label className="text-xs font-bold text-stone-500">
                  Limite de Crédito
                </label>

                <p className="mt-1 font-semibold">
                  {empresa.limiteCredito}
                </p>
              </div>

              {/* Botões de edição */}
              {isEditing && (
                <div className="flex gap-3 pt-3 border-t border-stone-200">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                    }}
                    className="flex-1 rounded-xl border border-stone-300
                         px-4 py-3 text-sm font-semibold
                         text-stone-700 hover:bg-stone-50 transition"
                  >
                    Cancelar
                  </button>

                  <button
                    onClick={() => {
                      setIsEditing(false);
                      alert('Para alterar dados fiscais ou endereço, utilize a solicitação de alteração.');
                    }}
                    className="flex-1 rounded-xl bg-primary px-4 py-3
                         text-sm font-semibold text-white
                         hover:bg-primary-hover transition"
                  >
                    Salvar alterações
                  </button>
                </div>
              )}
            </>
          )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}