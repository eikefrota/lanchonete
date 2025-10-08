import React, { useState } from "react";

export default function Header({
  onOpenCart,
  cartButtonRef,
  cartQuantity = 0,
  cartBump = false,
}) {
  const [mobileActive, setMobileActive] = useState(false);

  function toggleMobile() {
    setMobileActive((v) => !v);
  }

  return (
    <header>
      <nav id="nav-bar">
        <i className="fa-solid fa-burger" id="nav-logo">
          {" "}
          FastDish
        </i>

        <ul id="nav-list">
          <li className="nav-item">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
                setMobileActive(false);
              }}
            >
              Início
            </a>
          </li>
          <li className="nav-item">
            <a href="#pizzas">Pizzas</a>
          </li>
          <li className="nav-item">
            <a href="#hambugueres">Hambúgueres</a>
          </li>
          <li className="nav-item">
            <a href="#bebidas">Bebidas</a>
          </li>
        </ul>

        <button
          id="btn-cart"
          onClick={onOpenCart}
          ref={cartButtonRef}
          aria-haspopup="dialog"
          className={cartBump ? "cart-bump" : ""}
        >
          <i className="fa-solid fa-bag-shopping"></i>
          Carrinho
          <span
            className="cart-badge"
            aria-label={`${cartQuantity} itens no carrinho`}
          >
            {cartQuantity}
          </span>
        </button>

        <button
          id="mobile-btn"
          aria-label="Abrir menu"
          aria-expanded={mobileActive}
          onClick={toggleMobile}
        >
          <i className="fa-solid fa-bars"></i>
        </button>
      </nav>

      <div
        id="mobile-menu"
        className={mobileActive ? "active" : ""}
        aria-hidden={!mobileActive}
      >
        <ul id="mobile-nav-list">
          <li className="nav-item">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
                setMobileActive(false);
              }}
            >
              Início
            </a>
          </li>
          <li className="nav-item">
            <a href="#pizzas">Pizzas</a>
          </li>
          <li className="nav-item">
            <a href="#hambugueres">Hambúgueres</a>
          </li>
          <li className="nav-item">
            <a href="#bebidas">Bebidas</a>
          </li>
        </ul>

        <button id="btn-cart-mobile" onClick={onOpenCart}>
          <i className="fa-solid fa-bag-shopping"></i>
          Carrinho
          <span className="cart-badge">{cartQuantity}</span>
        </button>
      </div>
    </header>
  );
}
