import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Menu from "./components/Menu";
import CartModal from "./components/CartModal";
import AddressModal from "./components/AddressModal";
import useCart from "./hooks/useCart";
import { fetchAddressByCep } from "./utils/viacep";

import "./styles/style.css";

const dishesData = [
  {
    category: "Pizzas",
    items: [
      {
        name: "Pizza Calabresa",
        desc: "Molho artesanal, fatias de calabresa, cebola, orégano e massa crocante",
        price: 32,
        img: "/images/pizza-calabresa2.png",
      },
      {
        name: "Pizza Bacon",
        desc: "Molho artesanal, pedaços crocantes de bacon, queijo derretido e toque de orégano",
        price: 30,
        img: "/images/pizza-bacon.png",
      },
      {
        name: "Pizza Mussarela",
        desc: "Molho artesanal, queijo derretido e um toque de orégano",
        price: 28,
        img: "/images/pizza-mussarela.png",
      },
      {
        name: "Pizza Pepperoni",
        desc: "Molho artesanal, fatias de pepperoni levemente picantes, queijo derretido e orégano",
        price: 30,
        img: "/images/pizza-pepperoni.png",
      },
    ],
  },
  {
    category: "Hambúgueres",
    items: [
      {
        name: "Burguer Salad",
        desc: "Pão brioche, hambúrguer, queijo cheddar, alface, tomate e cebola roxa",
        price: 27,
        img: "/images/hambuguer-1.png",
      },
      {
        name: "Double Bacon",
        desc: "Pão brioche, dois hambúrgueres, queijo cheddar, alface, tomate bacon",
        price: 30,
        img: "/images/hambuguer-2.png",
      },
      {
        name: "Double Chicken",
        desc: "Pão brioche, duas fatias de frango, queijo cheddar, alface, tomate e cebola",
        price: 25,
        img: "/images/hamburguer-3.png",
      },
      {
        name: "Picles Burguer",
        desc: "Pão brioche, hambúguer, dois queijos cheddar, alface e muito picles",
        price: 29,
        img: "/images/hambuguer-4.png",
      },
    ],
  },
  {
    category: "Bebidas",
    items: [
      {
        name: "Coca-Cola",
        desc: "Lata 350ml",
        price: 5,
        img: "/images/coca.png",
      },
      {
        name: "Guaraná Antartica",
        desc: "Lata 350ml",
        price: 5,
        img: "/images/guarana.png",
      },
      {
        name: "Suco de Laranja",
        desc: "Copo 350ml",
        price: 8,
        img: "/images/suco-laranja.png",
      },
      {
        name: "Suco de Morango",
        desc: "Copo 350ml",
        price: 8,
        img: "/images/suco-morango.png",
      },
    ],
  },
];

function App() {
  const { cart, add, remove, clear, total } = useCart();
  const [cartVisible, setCartVisible] = useState(false);
  const [addressVisible, setAddressVisible] = useState(false);
  const [showAddressErrors, setShowAddressErrors] = useState(false);
  const [address, setAddress] = useState({
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  });

  useEffect(() => {}, []);

  function showToast(text, success = true) {
    const globalToast =
      typeof window !== "undefined" && window.Toastify ? window.Toastify : null;
    if (globalToast) {
      globalToast({
        text,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "center",
        style: { background: success ? "green" : "#EF4444" },
      }).showToast();
    } else {
      alert(text);
    }
  }
  // persistence moved to useCart

  function addToCart(item) {
    add(item);
    showToast("Produto adicionado com sucesso!", true);
  }
  function removeFromCart(name) {
    remove(name);
  }

  const cartButtonRef = React.createRef();
  function openCart() {
    setCartVisible(true);
  }
  function closeCart() {
    setCartVisible(false);
  }

  function confirmCart() {
    if (cart.length === 0) {
      showToast("Carrinho vazio!", false);
      return;
    }
    setCartVisible(false);
    setShowAddressErrors(false);
    setAddressVisible(true);
  }

  function returnAddress() {
    setAddressVisible(false);
    setCartVisible(true);
  }

  function handleCepBlur() {
    const cep = address.cep.replace(/\D/g, "");
    if (cep.length === 0) return;
    fetchAddressByCep(cep)
      .then((data) => setAddress((a) => ({ ...a, ...data })))
      .catch((err) => alert(err.message));
  }

  function validateAddress() {
    let valid = true;
    if (address.cep.trim() === "") valid = false;
    if (address.number.trim() === "") valid = false;
    return valid;
  }

  function checkout() {
    if (!validateAddress()) {
      setShowAddressErrors(true);
      showToast("Por favor, preencha todos os campos obrigatórios!", false);
      return;
    }

    const cartTotal = total;
    const cartItems = cart
      .map(
        (item) =>
          `\n*${item.name}*\n*Quantidade:* ${item.quantity}\n*Preço:* R$${item.price}\n-------------------------------------------\n`
      )
      .join("");
    const totalMessage = `*VALOR TOTAL:* R$ ${cartTotal.toLocaleString(
      "pt-BR",
      { style: "currency", currency: "BRL" }
    )}\n`;
    const addressMessage = `*ENDEREÇO DE ENTREGA:* ${address.street}, ${
      address.number
    }, ${address.complement || "N/A"} - ${address.neighborhood}, ${
      address.city
    }-${address.state}, ${address.cep}`;
    const message = encodeURIComponent(
      `\n${cartItems}\n${totalMessage}\n${addressMessage}`
    );
    const phone = "+5585999062339";
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
    setCart([]);
    setAddressVisible(false);
  }

  return (
    <div>
      <Header onOpenCart={openCart} cartButtonRef={cartButtonRef} />

      <main id="content">
        <section id="home">
          <div id="cta">
            <h1 className="title">
              ENCONTRE O <span>MELHOR</span> SABOR PARA VOCÊ
            </h1>
            <p className="description">
              Da pizza ao hambúguer, temos a comida perfeita para você. Somos o
              melhor da cidade!
            </p>

            <div id="cta-area">
              <button id="cta-btn">
                <a href="#menu">Ver cardápio</a>
              </button>
            </div>
          </div>

          <div id="banner">
            <div className="banner-image-container">
              <img src="/images/pizza-calabresa.png" alt="Foto Pizza" />
            </div>
          </div>
        </section>

        <Menu groups={dishesData} onAdd={addToCart} />

        {cartVisible && (
          <CartModal
            cart={cart}
            onClose={closeCart}
            onConfirm={confirmCart}
            onRemove={removeFromCart}
            returnFocusRef={cartButtonRef}
          />
        )}
        {addressVisible && (
          <AddressModal
            address={address}
            setAddress={setAddress}
            onReturn={returnAddress}
            onCheckout={checkout}
            onCepBlur={handleCepBlur}
            returnFocusRef={cartButtonRef}
            showErrors={showAddressErrors}
          />
        )}
      </main>

      <footer>
        <div id="footer-items">
          <span id="copyright">&copy; 2025 Todos os direitos reservados</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
