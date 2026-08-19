import { useState } from 'react';
import { useCart } from '../contexts/CartContext'
import { Link, useNavigate } from 'react-router-dom';
import {
  Store,
  ArrowLeft,
  ArrowRight,
  Truck,
  Package,
  CreditCard,
  ShieldCheck,
  Lock,
  CheckCircle2,
  X,
} from 'lucide-react';

const mockDelivery = {
  company: 'Supermercado Dois Irmãos',
  cnpj: '12.345.678/0001-90',
  address: 'Av. Central, 1500 - Galpão 3, Centro Comercial',
  city: 'São Paulo, SP - 01000-000',
};

const paymentOptions = [
  {
    id: 'boleto',
    label: 'Boleto Faturado',
    description: '30 / 60 / 90 dias',
  },
  {
    id: 'pix',
    label: 'Pix (À vista)',
    description: '5% de desconto',
  },
];

export default function CheckoutB2BPage() {
  const [selectedPayment, setSelectedPayment] = useState('boleto');
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const { cartItems, clearCart } = useCart();
  const [addressForm, setAddressForm] = useState({
    address: mockDelivery.address,
    city: mockDelivery.city});
  const navigate = useNavigate();
  const subtotal = cartItems.reduce(
  (total,item)=>
    total + ((item.price || 0) * item.qty),
  0
);

  function handleAddressChange(e) {
    const { name, value } = e.target;
    setAddressForm((prev) => ({
       ...prev, [name]: value, }));
    }

    function handleAddressRequest() {

  if (!addressForm.address.trim() || !addressForm.city.trim()) {
    alert('Preencha o endereço e a cidade.');
    return;
  }

  const request = {
    cliente: mockDelivery.company,
    cnpj: mockDelivery.cnpj,

    enderecoAnterior: {
      endereco: mockDelivery.address,
      cidade: mockDelivery.city,
    },

    novoEndereco: {
      endereco: addressForm.address,
      cidade: addressForm.city,
    },

    status: 'Alteração de endereço para pedido',
    origem: 'Portal B2B',
    data: new Date().toISOString(),
  };

  console.log(
    'Alteração de endereço do pedido:',
    request
  );

  setIsAddressModalOpen(false);
}

    function handleFinalize(e) {

      e.preventDefault();

      const order = {

        id: Date.now,
        items: cartItems,
        payment: selectedPayment,
        date: new Date(),
        total: subtotal,

      };

      const orders = JSON.parse(localStorage.getItem('orders')) || [];

      orders.unshift(order);

      localStorage.setItem('Caseira_orders', JSON.stringify(orders));

      console.log(
        'Encomenda finalizada',
        order
      );


      clearCart();


      navigate(
        '/portal/confirmado',
        {
          state:{
            orderId:'10493'
          }
        }
      );

}

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Checkout-specific header */}
      <header className="bg-white border-b border-stone-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/portal" className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" strokeWidth={1.75} />
              <span className="text-base font-bold text-stone-900">
                A Caseira{' '}
                <span className="text-primary">| Portal B2B</span>
              </span>
            </Link>
            <div className="flex items-center gap-6 text-sm text-stone-500">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" strokeWidth={1.75} />
                Checkout Seguro
              </span>
              <Link to="/portal/suporte" className="hover:text-stone-900 transition">
                Suporte
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Back link */}
        <Link
          to="/portal"
          className="
            inline-flex
            items-center
            gap-2
            px-4
            py-2.5
            mb-6
            rounded-xl
            bg-primary/10
            text-primary
            text-sm
            font-semibold
            hover:bg-primary
            hover:text-white
            transition-all
            duration-200
          "
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          Voltar para o Catálogo
        </Link>

        <h1 className="text-2xl font-bold text-stone-900 mb-8">
          Finalizar Pedido
        </h1>

        <form
          onSubmit={handleFinalize}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
        >
          {/* ── Left column ── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Delivery data */}
           {/* Delivery data */}
<section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">

  <div className="flex items-center justify-between pb-4 border-b border-stone-100">

    <h2 className="flex items-center gap-2 text-base font-semibold text-stone-800">
      <Truck
        className="w-4 h-4 text-primary"
        strokeWidth={1.75}
      />
      Dados de Entrega
    </h2>

    <button
      type="button"
      onClick={() => setIsAddressModalOpen(true)}
      className="
        inline-flex
        items-center
        gap-2
        px-3
        py-2
        rounded-lg
        bg-primary/10
        text-primary
        text-xs
        font-semibold
        border
        border-primary/20
        hover:bg-primary
        hover:text-white
        transition-all
      "
    >
      Alterar endereço
    </button>

  </div>

  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">

    <div>
      <p className="text-xs text-stone-400 mb-0.5">
        Empresa
      </p>

      <p className="font-semibold text-stone-800">
        {mockDelivery.company}
      </p>
    </div>

    <div>
      <p className="text-xs text-stone-400 mb-0.5">
        CNPJ
      </p>

      <p className="font-semibold text-stone-800">
        {mockDelivery.cnpj}
      </p>
    </div>

    <div className="sm:col-span-2">

      <p className="text-xs text-stone-400 mb-1">
        Endereço de entrega
      </p>

      <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">

        <p className="font-semibold text-stone-800">
          {addressForm.address}
        </p>

        <p className="text-sm text-stone-500 mt-1">
          {addressForm.city}
        </p>

      </div>

    </div>

  </div>

  <div className="mt-4 flex items-start gap-2 text-xs text-stone-400">

    <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />

    <p>
      O endereço informado será utilizado para a entrega deste pedido.
    </p>

  </div>

</section>

            {/* Cart summary */}
            <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-base font-semibold text-stone-800 pb-4 border-b border-stone-100">
                <Package className="w-4 h-4 text-primary" strokeWidth={1.75} />
                Resumo do Carrinho
              </h2>
                  <div className="mt-4 space-y-4">

                  {
                  cartItems.map(item => (

                  <div
                  key={`${item.id}-${item.packaging?.id}`}
                  className="flex items-center gap-4"
                  >

                  <img
                  src={item.image}
                  alt={item.name}
                  className="
                  w-14
                  h-14
                  rounded-lg
                  object-cover
                  border
                  border-stone-100
                  "
                  />

                  <div className="flex-1">

                  <p className="text-sm font-semibold text-stone-800">
                  {item.name}
                  </p>

                  <p className="text-xs text-stone-400">
                  {item.packaging?.name}
                  </p>

                  <p className="text-xs text-stone-400">
                  Quantidade: {item.qty}
                  </p>

                  </div>

                  </div>

                  ))

                  }

                  </div>
            </section>

            {/* Payment */}
            <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-base font-semibold text-stone-800 pb-4 border-b border-stone-100">
                <CreditCard
                  className="w-4 h-4 text-primary"
                  strokeWidth={1.75}
                />
                Forma de Pagamento
              </h2>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {paymentOptions.map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${
                      selectedPayment === opt.id
                        ? 'border-primary bg-primary/5'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={opt.id}
                      checked={selectedPayment === opt.id}
                      onChange={() => setSelectedPayment(opt.id)}
                      className="accent-primary w-4 h-4 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-stone-800">
                        {opt.label}
                      </p>
                      <p className="text-xs text-stone-500">{opt.description}</p>
                    </div>
                    {selectedPayment === opt.id && (
                      <CheckCircle2
                        className="w-4 h-4 text-primary shrink-0"
                        strokeWidth={2}
                      />
                    )}
                  </label>
                ))}
              </div>
            </section>
          </div>

          {/* ── Right column: order summary ── */}
          <div className="lg:sticky lg:top-24">
            <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
              <h2 className="text-base font-semibold text-stone-800 pb-4 border-b border-stone-100">
                Resumo da Compra
              </h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>
                  Subtotal ({cartItems.reduce((t,item)=>t+item.qty, 0)} caixas)
                  </span>

                  <span>
                  R$ {subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Frete (Logística A Caseira)</span>
                  <span className="font-semibold text-emerald-600">Grátis</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Descontos</span>
                  <span>R$ 0,00</span>
                </div>
                <div className="border-t border-stone-100 pt-3 flex justify-between items-end">
                  <span className="font-bold text-stone-900">Total</span>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">
                      R$ {subtotal.toFixed(2)}
                    </p>
                    <p className="text-xs text-stone-400">
                      Faturamento em até 3x no boleto
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="mt-5 w-full flex items-center justify-center gap-2 py-3.5
                  bg-primary hover:bg-primary-hover active:scale-[0.98]
                  text-white font-semibold rounded-xl
                  shadow-md shadow-primary/25 transition-all duration-150"
              >
                Finalizar Encomenda
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </button>

              <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-stone-400">
                <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.75} />
                Ambiente seguro e criptografado
              </p>
            </section>
          </div>
        </form>

        {/* Modal de alteração de endereço */}
{isAddressModalOpen && (
  <div
    className="
      fixed
      inset-0
      z-[70]
      bg-black/40
      flex
      items-center
      justify-center
      p-4
    "
    onClick={(e) => {
      if (e.target === e.currentTarget) {
        setIsAddressModalOpen(false);
      }
    }}
  >

    <div
      className="
        bg-white
        rounded-3xl
        shadow-2xl
        w-full
        max-w-lg
        max-h-[90vh]
        overflow-y-auto
      "
    >

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100">

        <div>
          <h2 className="text-lg font-bold text-stone-900">
            Alterar endereço de entrega
          </h2>

          <p className="text-xs text-stone-400 mt-1">
            Informe o endereço que deseja utilizar neste pedido.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddressModalOpen(false)}
          className="
            p-2
            rounded-lg
            text-stone-400
            hover:text-stone-700
            hover:bg-stone-100
            transition
          "
        >
          <X className="w-5 h-5" />
        </button>

      </div>

      {/* Conteúdo */}
      <div className="p-6 space-y-5">

        {/* Endereço */}
        <div>

          <label className="block text-xs font-bold text-stone-500 mb-1.5">
            Endereço
          </label>

          <input
            type="text"
            name="address"
            value={addressForm.address}
            onChange={handleAddressChange}
            placeholder="Rua, avenida, número..."
            className="
              w-full
              px-3
              py-2.5
              rounded-lg
              border
              border-stone-200
              bg-white
              text-sm
              text-stone-800
              outline-none
              focus:border-primary
              focus:ring-2
              focus:ring-primary/10
            "
          />

        </div>

        {/* Cidade */}
        <div>

          <label className="block text-xs font-bold text-stone-500 mb-1.5">
            Cidade / Estado / CEP
          </label>

          <input
            type="text"
            name="city"
            value={addressForm.city}
            onChange={handleAddressChange}
            placeholder="São Paulo, SP - 01000-000"
            className="
              w-full
              px-3
              py-2.5
              rounded-lg
              border
              border-stone-200
              bg-white
              text-sm
              text-stone-800
              outline-none
              focus:border-primary
              focus:ring-2
              focus:ring-primary/10
            "
          />

        </div>

        {/* Aviso */}
        <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-4">

          <div className="flex gap-3">

            <ShieldCheck className="w-5 h-5 text-yellow-700 shrink-0" />

            <div>

              <p className="text-sm font-semibold text-stone-800">
                Atenção
              </p>

              <p className="text-xs text-stone-600 mt-1">
                A alteração será registrada para este pedido.
                O endereço cadastrado da empresa não será alterado.
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-stone-100">

        <button
          type="button"
          onClick={() => setIsAddressModalOpen(false)}
          className="
            px-4
            py-2.5
            rounded-lg
            border
            border-stone-200
            text-sm
            font-semibold
            text-stone-600
            hover:bg-stone-50
            transition
          "
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={handleAddressRequest}
          className="
            px-5
            py-2.5
            rounded-lg
            bg-primary
            text-white
            text-sm
            font-semibold
            hover:bg-primary-hover
            transition
          "
        >
          Confirmar endereço
        </button>

      </div>

    </div>

  </div>
)}
        

      </div>  

  </div>
)}
  
