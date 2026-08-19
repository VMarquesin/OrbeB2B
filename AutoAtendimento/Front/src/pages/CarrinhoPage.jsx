import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Minus, Plus, ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export default function CarrinhoPage() {

  const {
    cartItems,
    updateItemQuantity,
    removeItem,
  } = useCart();

  const navigate = useNavigate();

  function alterarQuantidade(id, packagingId, quantidade){

    if(quantidade <= 0){
      removerItem(id, packagingId);
      return;
    }

    updateItemQuantity(id, packagingId ,quantidade);

  }

  function removerItem(id, packagingId){ (
    removeItem(id, packagingId)
    );

  }

 const total = cartItems.reduce(
(acc,item)=> 
 acc + (item.price * item.qty),
0
);

  if(cartItems.length === 0){

    return (

      <div className="py-20 text-center">

        <ShoppingCart
          className="mx-auto w-10 h-10 text-stone-300"
        />

        <h2 className="mt-4 text-lg font-bold text-stone-800">
          Seu carrinho está vazio
        </h2>

        <Link
          to="/portal"
          className="
          inline-flex
          mt-5
          text-primary
          font-semibold
          "
        >
          Voltar ao catálogo
        </Link>

      </div>

    );

  }

  return (

    <div className="space-y-6">

      <Link
        to="/portal"
        className="
          inline-flex
          items-center
          gap-2
          px-5
          py-3
          bg-primary
          text-white
          rounded-xl
          text-sm
          font-semibold
          hover:bg-primary-hover
          transition-all
          duration-200
          shadow-md
        "
      >
        <ArrowLeft className="w-4 h-4" />
        Continuar comprando
      </Link>
    
      <h1 className="
        text-2xl
        font-bold
        text-stone-900
      ">
        Carrinho
      </h1>

      <div className="
        grid
        grid-cols-1
        lg:grid-cols-3
        gap-6
      ">

        {/* Produtos */}

        <div className="
          lg:col-span-2
          bg-white
          rounded-2xl
          border
          border-stone-200
          p-6
          space-y-5
        ">

        {
          cartItems.map(item=>(

            <div
              key={`${item.id}-${item.packaging?.id}`}
              className="
              flex
              items-center
              gap-4
              border-b
              border-stone-100
              pb-5
              "
            >

              <img
                src={item.image}
                alt={item.name}
                className="
                w-20
                h-20
                rounded-xl
                object-cover
                "
              />

              <div className="flex-1">

                <h3 className="
                font-semibold
                text-stone-800
                ">
                  {item.name}
                </h3>

                <p className="text-xs text-stone-400">
                  {item.packaging?.name}
                </p>

                <p className="
                text-xs
                text-stone-400
                ">
                  Código: {item.id}
                </p>

                <p className="text-xs text-stone-400">
                Quantidade de caixas: {item.qty}
                </p>

                <div className="
                flex
                items-center
                gap-3
                mt-3
                ">

                  <button
                    onClick={() =>
                      alterarQuantidade(
                        item.id,
                        item.packaging?.id,
                        item.qty - 1
                      )
                    }
                    className="
                    border
                    rounded-lg
                    p-1
                    "
                  >

                    <Minus className="w-4 h-4"/>

                  </button>

                  <span className="
                  font-semibold
                  ">
                    {item.qty}
                  </span>

                  <button

                    onClick={() =>
                      alterarQuantidade(
                        item.id,
                        item.packaging?.id,
                        item.qty + 1
                      )
                    }

                    className="
                    border
                    rounded-lg
                    p-1
                    "
                  >

                    <Plus className="w-4 h-4"/>

                  </button>

                </div>

              </div>

              <div className="text-right">

                <p className="
                font-bold
                text-stone-900
                ">
                  R$ {(item.price * item.qty).toFixed(2)}
                </p>

                <button

                  onClick={() =>
                    removerItem(item.id, item.packaging?.id)
                  }

                  className="
                  mt-3
                  text-red-500
                  "
                >

                  <Trash2 className="w-4 h-4"/>

                </button>

              </div>

            </div>

          ))
        }

        </div>

        {/* Resumo */}

        <div
        className="
        bg-white
        rounded-2xl
        border
        border-stone-200
        p-6
        h-fit
        "
        >

          <h2 className="
          font-bold
          text-stone-800
          border-b
          pb-4
          ">
            Resumo
          </h2>

          <div className="
          flex
          justify-between
          mt-5
          text-sm
          ">

            <span>
              Produtos
            </span>

            <span>
              {cartItems.length}
            </span>

          </div>

          <div className="
          flex
          justify-between
          mt-4
          font-bold
          ">

            <span>
              Total
            </span>

            <span className="
            text-primary
            text-xl
            ">
              R$ {total.toFixed(2)}
            </span>

          </div>

          <button

            onClick={()=>
              navigate('/portal/checkout')
            }

            className="
            mt-6
            w-full
            bg-primary
            text-white
            py-3
            rounded-xl
            font-semibold
            "
          >

            Ir para Checkout

          </button>

        </div>

      </div>

    </div>

  );

}