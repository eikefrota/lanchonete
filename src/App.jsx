import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Menu from "./components/Menu";
import CartModal from "./components/CartModal";
import AddressModal from "./components/AddressModal";
import PaymentModal from "./components/PaymentModal";
import useCart from "./hooks/useCart";
import { fetchAddressByCep } from "./utils/viacep";

import "./styles/style.css";

import pizzaCalabresa from "./assets/pizzas/pizza-calabresa.png";
import pizzaCalabresa2 from "./assets/pizzas/pizza-calabresa2.png";
import pizzaBacon from "./assets/pizzas/pizza-bacon.png";
import pizzaMussarela from "./assets/pizzas/pizza-mussarela.png";
import pizzaPepperoni from "./assets/pizzas/pizza-pepperoni.png";
import pizzaPresunto from "./assets/pizzas/pizza-presunto-e-queijo.png";
import pizzaCogumelo from "./assets/pizzas/pizza-cogumelo.png";
import pizzaCogCalabresa from "./assets/pizzas/pizza-cogumelo-e-calabresa.png";
import hamb1 from "./assets/burguers/hambuguer-1.png";
import hamb2 from "./assets/burguers/hambuguer-2.png";
import hamb3 from "./assets/burguers/hamburguer-3.png";
import hamb4 from "./assets/burguers/hambuguer-4.png";
import hambChicken from "./assets/burguers/hamburguer-chicken.png";
import sanduicheBife from "./assets/burguers/sanduiche-bife.png";
import sanduicheIntegral from "./assets/burguers/sanduiche-integral.png";
import coca from "./assets/bebidas/coca.png";
import guarana from "./assets/bebidas/guarana.png";
import sucoLaranja from "./assets/bebidas/suco-laranja.png";
import sucoMorango from "./assets/bebidas/suco-morango.png";
import milkshakeChocolate from "./assets/bebidas/milkshake-chocolate.png";
import milkshakeMorango from "./assets/bebidas/milkshake-morango.png";

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
      {
        name: "Pizza Presunto e Queijo",
        desc: "Fatias generosas de presunto com queijo derretido e massa macia",
        price: 31,
        img: pizzaPresunto,
      },
      {
        name: "Pizza Cogumelo",
        desc: "Cogumelos salteados com queijo cremoso e um toque de ervas",
        price: 33,
        img: pizzaCogumelo,
      },
      {
        name: "Pizza Calabresa com Cogumelo",
        desc: "Combinação de calabresa e cogumelos sobre molho especial",
        price: 34,
        img: pizzaCogCalabresa,
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
      {
        name: "Chicken Crocante",
        desc: "Peito de frango empanado, alface crocante e molho especial no pão brioche",
        price: 26,
        img: hambChicken,
      },
      {
        name: "Sub de Bife",
        desc: "Pão baguete recheado com tiras de bife, queijo e pimentões grelhados",
        price: 34,
        img: sanduicheBife,
      },
      {
        name: "Sanduíche Integral",
        desc: "Pão integral com presunto, queijo, alface e tomate — opção mais leve",
        price: 24,
        img: sanduicheIntegral,
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
      {
        name: "Milkshake Chocolate",
        desc: "Copo 500ml",
        price: 12,
        img: milkshakeChocolate,
      },
      {
        name: "Milkshake Morango",
        desc: "Copo 500ml",
        price: 12,
        img: milkshakeMorango,
      },
    ],
  },
];

function App() {
  const { cart, add, remove, removeAll, clear, total, totalQuantity } =
    useCart();
  const [cartBump, setCartBump] = useState(false);
  const [cartVisible, setCartVisible] = useState(false);
  const [paymentVisible, setPaymentVisible] = useState(false);
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
    paymentMethod: "",
    changeFor: "",
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

  function openAddressFromPayment() {
    setPaymentVisible(false);
    setAddressVisible(true);
  }

  function returnPayment() {
    setPaymentVisible(false);
    setCartVisible(true);
  }

  function openPaymentFromAddress() {
    setAddressVisible(false);
    setPaymentVisible(true);
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
    const now = new Date();
    const datetime = now.toLocaleString("pt-BR");
    const orderId = `#${String(now.getTime()).slice(-6)}`;

    const cartLines = cart
      .map((item, idx) => {
        const unit = item.price.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });
        const lineTotal = (item.price * item.quantity).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });
        return `${idx + 1}. ${item.name} — ${
          item.quantity
        } x ${unit} = ${lineTotal}`;
      })
      .join("\n");

    const totalMsg = total.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    const addressLines = `${address.street}, ${address.number}${
      address.complement ? ` — ${address.complement}` : ""
    }\n${address.neighborhood} — ${address.city}-${address.state}\nCEP: ${
      address.cep
    }`;

    const paymentInfo = address.paymentMethod
      ? `*Pagamento:* ${address.paymentMethod}${
          address.paymentMethod === "Dinheiro" && address.changeFor
            ? ` — Troco para: ${address.changeFor}`
            : ""
        }`
      : "*Pagamento:* Não especificado";

    const plainMessage = `🍽️ *Novo pedido — FastDish* ${orderId}\n🕒 ${datetime}\n━━━━━━━━━━━━━━━━━━━━\n*Itens:*\n${cartLines}\n━━━━━━━━━━━━━━━━━━━━\n*Resumo:* ${totalMsg}\n\n*Entrega:*\n${addressLines}\n\n${paymentInfo}\n\n*Obrigado!* 🙌\n`;

    const message = encodeURIComponent(plainMessage);
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
            onAdd={add}
            removeAll={removeAll}
            returnFocusRef={cartButtonRef}
          />
        )}
        {paymentVisible && (
          <PaymentModal
            address={address}
            setAddress={setAddress}
            onReturn={openAddressFromPayment}
            onConfirm={checkout}
            returnFocusRef={cartButtonRef}
            cart={cart}
            total={total}
          />
        )}
        {addressVisible && (
          <AddressModal
            address={address}
            setAddress={setAddress}
            onReturn={returnAddress}
            onCheckout={openPaymentFromAddress}
            onCepBlur={handleCepBlur}
            returnFocusRef={cartButtonRef}
            showErrors={showAddressErrors}
          />
        )}
      </main>

      <footer>
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-brand">
              <i className="fa-solid fa-burger" id="footer-logo">
                {" "}
                FastDish
              </i>
              <p className="footer-desc">
                O melhor sabor da cidade. Pizzas, hambúgueres e bebidas geladas
                entregues rápido.
              </p>
              <div className="footer-socials">
                <a href="#" aria-label="Instagram">
                  <i className="fa-brands fa-instagram"></i>
                </a>
                <a href="#" aria-label="Facebook">
                  <i className="fa-brands fa-facebook"></i>
                </a>
                <a href="#" aria-label="WhatsApp">
                  <i className="fa-brands fa-whatsapp"></i>
                </a>
              </div>
            </div>

            <div className="footer-links">
              <h4>Links rápidos</h4>
              <ul>
                <li>
                  <a href="#home">Início</a>
                </li>
                <li>
                  <a href="#pizzas">Pizzas</a>
                </li>
                <li>
                  <a href="#hambugueres">Hambúgueres</a>
                </li>
                <li>
                  <a href="#bebidas">Bebidas</a>
                </li>
              </ul>
            </div>

            <div className="footer-contact">
              <h4>Contato</h4>
              <address>
                Rua Exemplo, 123
                <br />
                Cidade - Estado
                <br />
                <a href="tel:+5585999062339">(85) 99906-2339</a>
              </address>
            </div>

            <div className="footer-newsletter">
              <h4>Newsletter</h4>
              <p>Receba promoções e novidades por e-mail.</p>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="newsletter-form"
              >
                <input
                  type="email"
                  placeholder="Seu e-mail"
                  aria-label="Seu e-mail"
                />
                <button type="submit">Inscrever</button>
              </form>
            </div>
          </div>

          <div className="footer-bottom">
            <span className="footer-copyright">
              &copy; 2025 FastDish. Todos os direitos reservados.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
