import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, Building2, User, Mail, Phone, Lock, Eye, EyeOff, UserPlus, ShieldCheck, CheckCircle2 } from 'lucide-react';
import logo from '../assets/logo.jpg';
import { registrar } from '../services/cadastroService';
import api from '../services/api';

export default function CadastroB2BPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erroApi, setErroApi] = useState('');
  const [form, setForm] = useState({
  customerType: "",
  company: '',
  fantasyName: '',
  cnpj: '',
  name: '',
  email: '',
  phone: '',
  cep: '',
  logradouro: '',
  numero: '',
  bairro: '',
  uf: '',
  cidadeNome: '',
  cidadeId: '',
  password: '',
  confirmPassword: '',
  acceptedTerms: false,
});
  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    let newValue = value;

    if (name === 'cnpj' || name === 'phone' || name === 'cep') {
      newValue = value.replace(/\D/g, '');
    }
    setForm({
      ...form,
      [name]: newValue,
    });
  }

async function handleBuscarCep(cep) {
  const cleanCep = cep.replace(/\D/g, '');

  setErroApi('');

  if (cleanCep.length !== 8) {
    return;
  }

  try {
    const res = await api.get(`/api/Ceps/${cleanCep}`);

    setForm((prev) => ({
      ...prev,
      cep: cleanCep,
      logradouro: res.data.logradouro || '',
      bairro: res.data.bairro || '',
      uf: res.data.uf || '',
      cidadeNome: res.data.cidadeNome || '',
      cidadeId: res.data.cidadeId || '',
    }));

    setErrors((prev) => ({
      ...prev,
      cep: '',
    }));

  } catch (err) {

    setForm((prev) => ({
      ...prev,
      cidadeId: '',
      uf: '',
      cidadeNome: '',
      logradouro: '',
      bairro: '',
    }));

    const mensagem =
      err.response?.data?.mensagem ||
      'Não foi possível consultar o CEP. Verifique o CEP informado.';

    setErroApi(mensagem);

    setErrors((prev) => ({
      ...prev,
      cep: 'Não foi possível localizar este CEP.',
    }));
  }
}

  async function handleSubmit(e) {
    e.preventDefault();
    setErroApi('');

    const newErrors = {};

    if (!form.customerType) {
      newErrors.customerType = "Selecione o tipo de cliente.";
    }

    if (!form.company.trim()) {
      newErrors.company = "Informe a razão social.";
    }

    if (!form.cnpj.trim()) {
      newErrors.cnpj = "Informe o CNPJ.";
    } else if (form.cnpj.length !== 14) {
      newErrors.cnpj = "CNPJ inválido. Deve conter 14 dígitos.";
    }

    if (!form.name.trim()) {
      newErrors.name = "Informe o nome do responsável.";
    }

    if (!form.email.trim()) {
      newErrors.email = "Informe o e-mail.";
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Informe o telefone.";
    } else if (form.phone.length < 10 || form.phone.length > 11) {
      newErrors.phone = "Telefone inválido.";
    }

    if (!form.cep.trim()) {
      newErrors.cep = "Informe o CEP.";
    } else if (form.cep.length !== 8) {
      newErrors.cep = "CEP inválido. Deve conter 8 dígitos.";
    }

    if (!form.password.trim()) {
      newErrors.password = "Informe a senha.";
    }

    if (form.password && form.password.length < 6) {
      newErrors.password = "A senha deve ter pelo menos 6 caracteres.";
    }

    if (!form.confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirme sua senha.";
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem.";
    }

    if (!form.acceptedTerms) {
      newErrors.acceptedTerms = "Aceite os Termos de Uso.";
    }
    if (!form.cidadeId) {
      newErrors.cep = "Informe um CEP válido para identificar a cidade.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // ── Integração com a API real ──────────────────────────────────────────
    setLoading(true);
    try {

      await registrar({
        cidadeId: form.cidadeId,
        cnpj: form.cnpj,           // já limpo (só dígitos)
        razaoSocial: form.company,
        nomeFantasia: form.fantasyName || form.company,
        cep: form.cep,            // já limpo
        logradouro: form.logradouro || 'A informar',
        numero: form.numero || 'S/N',
        bairro: form.bairro || 'A informar',
        emailAcesso: form.email,
        senhaAcesso: form.password,
      });

      setShowModal(true);
    } catch (err) {
      setErroApi(err.mensagemNormalizada ?? 'Erro ao realizar cadastro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-100">
      <header className="fixed top-0 left-0 w-full h-[72px] bg-white/95 backdrop-blur-md border-b border-stone-200/80 z-50">
        <div className="max-w-7xl mx-auto h-full px-6 lg:px-8 flex items-center justify-between">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group"
          >
            <div className="h-[52px] w-[52px] rounded-xl overflow-hidden flex items-center justify-center bg-stone-50 border border-stone-200">
              <img
                src={logo}
                alt="A Caseira"
                className="h-full w-full object-contain"
              />
            </div>

            <div className="flex flex-col leading-tight">
              <span className="text-lg font-bold text-stone-900">
                A Caseira
              </span>

              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                Portal B2B
              </span>
            </div>
          </Link>

          {/* Lado direito */}
          <div className="flex items-center gap-4">

            <div className="hidden sm:flex items-center gap-2 text-sm text-stone-500">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Ambiente seguro</span>
            </div>

            <div className="h-6 w-px bg-stone-200 hidden sm:block" />

            <Link
              to="/login"
              className="text-sm font-semibold text-stone-600 hover:text-primary transition-colors"
            >
              Já tenho acesso
            </Link>

            <Link
              to="/login"
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-lg border border-stone-200 text-sm font-semibold text-stone-700 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
            >
              Entrar
            </Link>

          </div>

        </div>
      </header>
      <div className="max-w-6xl mx-auto px-4 pt-28 pb-12">

        <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-8 items-start">

          {/* Painel institucional */}
          <div className="hidden lg:flex flex-col justify-center bg-primary rounded-3xl p-10 text-white min-h-[600px]">

            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
              <Store className="w-7 h-7" />
            </div>

            <p className="text-sm font-semibold text-white/70 uppercase tracking-wider">
              Portal B2B
            </p>

            <h2 className="text-3xl font-bold mt-2 leading-tight">
              Venda e compre com a A Caseira.
            </h2>

            <p className="mt-4 text-sm text-white/75 leading-relaxed">
              Crie seu acesso empresarial para consultar nosso catálogo,
              realizar pedidos e acompanhar suas compras.
            </p>

            <div className="mt-8 space-y-4">

              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm">
                  Catálogo exclusivo para empresas
                </span>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm">
                  Condições comerciais B2B
                </span>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm">
                  Acompanhamento de pedidos
                </span>
              </div>

            </div>

          </div>

          {/* Cadastro */}
          <div className="w-full bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden">

            <div className="px-8 pt-8 pb-5 border-b border-stone-100">
              <h1 className="text-2xl font-bold text-stone-900">
                Criar acesso B2B
              </h1>

              <p className="mt-1 text-sm text-stone-500">
                Preencha os dados da sua empresa para solicitar acesso ao portal.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4 px-8 pt-5 pb-8"
            >

              <div className="mb-2">
                <h2 className="text-sm font-bold text-stone-800">
                  Dados da empresa
                </h2>

                <p className="text-xs text-stone-400 mt-1">
                  Informe os dados cadastrais da empresa.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">
                  Tipo de Cliente
                </label>

                <select
                  name="customerType"
                  value={form.customerType}
                  onChange={handleChange}
                  className={`
                  w-full py-2.5 px-3
                  rounded-lg
                  bg-stone-50
                  border
                  ${errors.customerType
                      ? "border-red-500"
                      : "border-stone-200"
                    }
                `}
                >
                  <option value="">Selecione</option>
                  <option value="varejo">Varejo</option>
                  <option value="atacado">Atacado</option>
                </select>

                {errors.customerType && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.customerType}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">
                    Razão Social
                  </label>

                  <Input
                    icon={<Building2 />}
                    name="company"
                    placeholder="Razão Social"
                    value={form.company}
                    onChange={handleChange}
                    error={errors.company}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">
                    Nome Fantasia
                  </label>

                  <Input
                    icon={<Store />}
                    name="fantasyName"
                    placeholder="Nome Fantasia"
                    value={form.fantasyName}
                    onChange={handleChange}
                    error={errors.fantasyName}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">
                  CNPJ
                </label>

                <Input
                  icon={<Building2 />}
                  name="cnpj"
                  placeholder="00.000.000/0000-00"
                  value={form.cnpj}
                  onChange={handleChange}
                  error={errors.cnpj}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">
                  CEP
                </label>

                <Input
                  icon={<Building2 />} 
                  name="cep" 
                  placeholder="00000-000" 
                  value={form.cep} 
                  onChange={handleChange}
                  onBlur={(e) => handleBuscarCep(e.target.value)}
                  error={errors.cep} 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">
                    Estado
                  </label>

                  <input
                    type="text"
                    value={form.uf}
                    disabled
                    placeholder="Preenchido pelo CEP"
                    className="w-full py-3 px-3 rounded-xl bg-stone-100 border border-stone-200 text-sm text-stone-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">
                    Cidade
                  </label>

                  <input
                    type="text"
                    value={form.cidadeNome}
                    disabled
                    placeholder="Preenchido pelo CEP"
                    className="w-full py-3 px-3 rounded-xl bg-stone-100 border border-stone-200 text-sm text-stone-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 mb-2">
                <h2 className="text-sm font-bold text-stone-800">
                  Dados do responsável
                </h2>

                <p className="text-xs text-stone-400 mt-1">
                  Informe os dados da pessoa responsável pelo acesso.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>

                  <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">
                    Nome do Responsável
                  </label>

                  <Input
                    icon={<User />}
                    name="name"
                    placeholder="Nome do responsável"
                    value={form.name}
                    onChange={handleChange}
                    error={errors.name}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">
                    Telefone
                  </label>
                  <Input
                    icon={<Phone />}
                    name="phone"
                    placeholder="(00) 00000-0000"
                    value={form.phone}
                    onChange={handleChange}
                    error={errors.phone}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">
                    E-mail
                  </label>

                  <Input
                    icon={<Mail />}
                    name="email"
                    placeholder="  E-mail"
                    value={form.email}
                    onChange={handleChange}
                    error={errors.email}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Senha */}
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">
                    Senha
                  </label>

                  <div className="relative">
                    <Lock
                      className="
          absolute left-3 top-1/2
          -translate-y-1/2
          w-4 h-4 text-stone-400
        "
                    />

                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Senha"
                      value={form.password}
                      onChange={handleChange}
                      className={`
          w-full pl-9 pr-10 py-2.5
          text-sm
          rounded-lg
          bg-stone-50
          focus:outline-none
          focus:ring-2
          focus:ring-primary/20
          ${errors.password
                          ? "border-red-500"
                          : "border-stone-200"
                        }
        `}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="
          absolute right-3 top-1/2
          -translate-y-1/2
          text-stone-400
        "
                    >
                      {showPassword
                        ? <EyeOff className="w-4 h-4" />
                        : <Eye className="w-4 h-4" />
                      }
                    </button>
                  </div>

                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirmar senha */}
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">
                    Confirmar Senha
                  </label>

                  <div className="relative">
                    <Lock
                      className="
          absolute left-3 top-1/2
          -translate-y-1/2
          w-4 h-4 text-stone-400
        "
                    />

                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirme sua senha"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      className={`
          w-full pl-9 pr-10 py-2.5
          rounded-lg
          bg-stone-50
          border
          ${errors.confirmPassword
                          ? "border-red-500"
                          : "border-stone-200"
                        }
        `}
                    />
                  </div>

                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 sm:col-span-2">

                <input
                  type="checkbox"
                  id="acceptedTerms"
                  checked={form.acceptedTerms}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      acceptedTerms: e.target.checked,
                    })
                  }
                  className="mt-1 h-4 w-4 rounded border-stone-300"
                />

                <label
                  htmlFor="acceptedTerms"
                  className="text-sm text-stone-600 leading-relaxed"
                >
                  Li e aceito os{" "}
                  <Link
                    to="/termos"
                    className="text-primary hover:underline font-medium"
                  >
                    Termos de Uso
                  </Link>{" "}
                  e a{" "}
                  <Link
                    to="/privacidade"
                    className="text-primary hover:underline font-medium"
                  >
                    Política de Privacidade
                  </Link>.
                </label>

              </div>

              {errors.acceptedTerms && (
                <p className="text-red-500 text-xs">
                  {errors.acceptedTerms}
                </p>
              )}

              {/* Erro da API */}
              {erroApi && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-600 text-center">
                  {erroApi}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="
              w-full
              flex items-center justify-center gap-2
              py-3.5
              mt-2
              bg-primary
              hover:bg-primary-hover
              active:scale-[0.99]
              text-white
              font-semibold
              rounded-xl
              shadow-lg
              shadow-primary/20
              disabled:opacity-60 disabled:cursor-not-allowed
              transition
              transition-all
            "
              >


                {loading ? 'Enviando...' : 'Criar acesso'}

                <UserPlus className="w-4 h-4" />

              </button>

            </form>

          </div>

        </div>
        <div className="mt-4 flex items-center gap-1.5 text-stone-400 text-xs">
          <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.75} />
          <span>Cadastro Seguro e Criptografado</span>
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center border border-stone-100">

              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-5">
                <ShieldCheck className="w-8 h-8 text-green-600" />
              </div>

              <h2 className="text-2xl font-bold text-stone-800">
                Solicitação enviada!
              </h2>

              <p className="mt-4 text-stone-500 leading-relaxed">
                Recebemos sua solicitação de cadastro.
                <br /><br />
                Nossa equipe analisará os dados da empresa.
                <br /><br />
                Assim que o cadastro for aprovado você receberá um e-mail com as instruções de acesso ao Portal B2B.
              </p>

              <button
                onClick={() => {
                  setShowModal(false);
                  navigate("/");
                }}
                className="mt-8 w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-semibold"
              >
                Entendi
              </button>

            </div>

          </div>
        )}

      </div>
    </div>


  );
}

function Input({
  icon,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  error
}) {
  return (
    <div>
      <div className="relative">

        <span
          className="
            absolute left-3.5 top-1/2
            -translate-y-1/2
            text-stone-400
          "
        >
          {icon}
        </span>

        <input
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`
            w-full
            pl-10 pr-4
            py-3
            text-sm
            rounded-xl
            bg-stone-50
            border
            transition
            focus:outline-none
            focus:bg-white
            focus:ring-2
            focus:ring-primary/20
            ${error
              ? "border border-red-500"
              : "border border-stone-200"
            }
          `}
        />

      </div>

      {error && (
        <p className="text-red-500 text-xs mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
