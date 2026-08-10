import { createContext, useContext, useState, useEffect } from 'react';

  const CartContext = createContext(null);

  export function CartProvider({ children }) {

  const [cartItems, setCartItems] = useState(() =>{

    const saved = localStorage.getItem("cart");

    return saved
    ? JSON.parse(saved)
    : [];

  });

  useEffect(() => {

  localStorage.setItem(
    "cart",
    JSON.stringify(cartItems)
    );

    }, [cartItems]);

  function setCart(items) {
    setCartItems(items);
  }


  // Adiciona um produto
  function addItem(item) {

    const guids =
  JSON.parse(localStorage.getItem("productGuids")) || [];

    if (!guids.includes(item.guid)) {
    guids.push(item.guid);

    localStorage.setItem(
    "productGuids",
    JSON.stringify(guids)
      );
    }

    setCartItems((prev) => {

      const exists = prev.find(
        (product) => 
        product.id === item.id &&
        product.packaging?.id === item.packaging?.id
      );


      if (exists) {

        return prev.map((product) =>
          product.id === item.id &&
          product.packaging?.id === item.packaging?.id
            ? {
                ...product,
                qty: product.qty + item.qty
              }
            : product
        );

      }


      return [
        ...prev,
        item
      ];

      });

    }

  // Adiciona vários produtos
  function addItems(items) {

    items.forEach((item) => {
      addItem(item);
      });

    }

  // Atualiza quantidade
  function updateItemQuantity(id, packagingId, quantidade) {

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id &&
        item.packaging?.id === packagingId
          ? {
              ...item,
              qty: quantidade
            }
          : item
      )
    );

  }

  // Remove produto
  function removeItem(id, packagingId) {

    setCartItems((prev) =>
      prev.filter(
        (item) =>
        !(
          item.id === id &&
          item.packaging?.id === packagingId
        )
      )
    );

  }

  // Limpa carrinho
  function clearCart() {

    setCartItems([]);

    localStorage.removeItem("cart");

  }

  // Quantidade total para o badge do carrinho
  const totalItems = cartItems.reduce(
    (total, item) =>
      total + item.qty,
    0
  );

  return (

    <CartContext.Provider
      value={{
        cartItems,
        setCart,
        addItem,
        addItems,
        updateItemQuantity,
        removeItem,
        clearCart,
        totalItems,
      }}
    >

      {children}

    </CartContext.Provider>

  );

}

export function useCart() {

  const context = useContext(CartContext);

  if (!context) {

    throw new Error(
      'useCart deve ser usado dentro de <CartProvider>'
    );

  }

  return context;

}