import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Menu from "./components/Menu";
import CartModal from "./components/CartModal";
import AddressModal from "./components/AddressModal";
import useCart from "./hooks/useCart";
import { fetchAddressByCep } from "./utils/viacep";

import "./styles/style.css";

import pizzaCalabresa from "./assets/pizza-calabresa.png";
import pizzaCalabresa2 from "./assets/pizza-calabresa2.png";
import pizzaBacon from "./assets/pizza-bacon.png";
import pizzaMussarela from "./assets/pizza-mussarela.png";
import pizzaPepperoni from "./assets/pizza-pepperoni.png";
import hamb1 from "./assets/hambuguer-1.png";
import hamb2 from "./assets/hambuguer-2.png";
import hamb3 from "./assets/hamburguer-3.png";
import hamb4 from "./assets/hambuguer-4.png";
import coca from "./assets/coca.png";
import guarana from "./assets/guarana.png";
import sucoLaranja from "./assets/suco-laranja.png";
import sucoMorango from "./assets/suco-morango.png";

const dishesData = [
  {
    category: "Pizzas",
    items: [
      {
        name: "Pizza Calabresa",
        desc: "Molho artesanal, fatias de calabresa, cebola, orégano e massa crocante",
        price: 32,
        img: pizzaCalabresa2,
      },
      {
        name: "Pizza Bacon",
        desc: "Molho artesanal, pedaços crocantes de bacon, queijo derretido e toque de orégano",
        price: 30,
        img: pizzaBacon,
      },
      {
        name: "Pizza Mussarela",
        desc: "Molho artesanal, queijo derretido e um toque de orégano",
        price: 28,
        img: pizzaMussarela,
      },
      {
        name: "Pizza Pepperoni",
        desc: "Molho artesanal, fatias de pepperoni levemente picantes, queijo derretido e orégano",
        price: 30,
        img: pizzaPepperoni,
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
        img: hamb1,
      },
      {
        name: "Double Bacon",
        desc: "Pão brioche, dois hambúrgueres, queijo cheddar, alface, tomate bacon",
        price: 30,
        img: hamb2,
      },
      {
        name: "Double Chicken",
        desc: "Pão brioche, duas fatias de frango, queijo cheddar, alface, tomate e cebola",
        price: 25,
        img: hamb3,
      },
      {
        name: "Picles Burguer",
        desc: "Pão brioche, hambúguer, dois queijos cheddar, alface e muito picles",
        price: 29,
        img: hamb4,
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
        img: coca,
      },
      {
        name: "Guaraná Antartica",
        desc: "Lata 350ml",
        price: 5,
        img: guarana,
      },
      {
        name: "Suco de Laranja",
        desc: "Copo 350ml",
        price: 8,
        img: sucoLaranja,
      },
      {
        name: "Suco de Morango",
        desc: "Copo 350ml",
        price: 8,
        img: sucoMorango,
      },
    ],
  },
];

function App() {
  const { cart, add, remove, clear, total, totalQuantity } = useCart();
  const [cartBump, setCartBump] = useState(false);
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
      // non-blocking fallback
      if (success) console.log(text);
      else console.warn(text);
    }
  }
  // persistence moved to useCart

  function addToCart(item) {
    add(item);
    showToast("Produto adicionado com sucesso!", true);
    // trigger bump animation on cart button
    setCartBump(true);
    setTimeout(() => setCartBump(false), 300);
  }
  function removeFromCart(name) {
    remove(name);
  }

  const cartButtonRef = React.useRef(null);
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

  // Accept cep as parameter to avoid race conditions when input changes
  function handleCepBlur(cepParam) {
    const cep = (cepParam || address.cep || "").replace(/\D/g, "");
    if (cep.length !== 8) return;
    fetchAddressByCep(cep)
      .then((data) => setAddress((a) => ({ ...a, ...data })))
      .catch((err) => showToast(err.message, false));
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
    clear();
    setAddressVisible(false);
  }

  return (
    <div>
      <Header
        onOpenCart={openCart}
        cartButtonRef={cartButtonRef}
        cartQuantity={totalQuantity}
        cartBump={cartBump}
      />

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
              <img src={pizzaCalabresa} alt="Foto Pizza" />
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
