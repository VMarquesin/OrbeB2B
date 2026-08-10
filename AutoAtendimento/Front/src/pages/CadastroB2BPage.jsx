import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, Building2, User, Mail, Phone, Lock, Eye, EyeOff, UserPlus, ShieldCheck, } from 'lucide-react';
import logo from '../assets/logo.jpg';

export default function CadastroB2BPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    customerType: "",
    company: '',
    fantasyName: '',
    cnpj: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptedTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);

  function handleChange(e) { 
    const { name, value } = e.target;

    let newValue = value;

    if (name === 'cnpj' || name === 'phone') {
      newValue = value.replace(/\D/g, '');
    }
    setForm({
      ...form,
      [name]: newValue,
    });
  }

    function handleSubmit(e) {
      e.preventDefault();

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

      setErrors(newErrors);

      if (Object.keys(newErrors).length > 0) {
        return;
      }
      console.log("Cadastro enviado", form);

      setShowModal(true);
    }

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center px-4">
      <header className="fixed top-0 left-0 w-full h-16 bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto h-full flex items-center px-8">
        <Link to="/" className="flex items-center gap-3">
          <img
           src={logo}
            alt="A Caseira"
            className="h-20 object-contain"
         />
         <span className="text-black font-bold text-lg">A Caseira</span>
        </Link>
        </div>
      </header>
      <div className="flex flex-col items-center justify-center px-4 pt-24 pb-12">

      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg overflow-hidden">

        <div className="h-1.5 bg-primary" />

        <div className="px-8 py-8">

          <div className="flex flex-col items-center mb-6">

            <h1 className="text-2xl font-bold text-stone-800">
              A Caseira
            </h1>

            <p className="text-sm text-stone-400">
              Criar acesso B2B
            </p>

          </div>

          <form 
            onSubmit={handleSubmit}
            className="space-y-4"
          >

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
                  ${
                    errors.customerType
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
                focus:ring-2
                focus:ring-primary/30
              ${
                errors.password
                ? "border border-red-500"
                : "border border-stone-200"
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
                ? <EyeOff className="w-4 h-4"/>
                : <Eye className="w-4 h-4"/>
              }
             </button>
            </div>
          </div>

              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  Informe a senha.
                </p>
              )}

              <div>

                  <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">
                    Confirmar Senha
                  </label>

                  <div className="relative">

                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400"
                    />

                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirme sua senha"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-stone-50 border border-stone-200"
                    />

                  </div>

                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}

                </div>

              <div className="flex items-start gap-3">

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

            <button
              className="
              w-full flex items-center justify-center gap-2
              py-3
              bg-primary
              hover:bg-primary-hover
              text-white
              font-semibold
              rounded-lg
              shadow-md
              "
            >

              Criar acesso

              <UserPlus className="w-4 h-4"/>

            </button>

          </form>

        </div>

      </div>
      <div className="mt-4 flex items-center gap-1.5 text-stone-400 text-xs">
        <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.75} />
        <span>Cadastro Seguro e Criptografado</span>
      </div>

        {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">

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
    placeholder,
    error
  }) {
  return (
    <div>
      <div className="relative">

        <span
          className="
            absolute left-3 top-1/2
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
          placeholder={placeholder}
          className={`
            w-full pl-9 pr-4 py-2.5
            text-sm
            rounded-lg
            bg-stone-50
            focus:outline-none
            focus:ring-2
            focus:ring-primary/30
            ${
              error
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
