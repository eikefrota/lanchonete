import React, { useState } from "react";

export default function Header({ onOpenCart, cartButtonRef }) {
  const [mobileActive, setMobileActive] = useState(false);

  function toggleMobile() {
    setMobileActive((v) => !v);
  }

  return (
    <header>
      <nav id="nav-bar">
        <i className="fa-solid fa-burger" id="nav-logo">
          {" "}
          Frota
        </i>

        <ul id="nav-list">
          <li className="nav-item">
            <a href="#home">Início</a>
          </li>
          <li className="nav-item">
            <a href="#menu">Cardápio</a>
          </li>
        </ul>

        <button
          id="btn-cart"
          onClick={onOpenCart}
          ref={cartButtonRef}
          aria-haspopup="dialog"
        >
          <i className="fa-solid fa-bag-shopping"></i>Carrinho
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
            <a href="#home">Início</a>
          </li>
          <li className="nav-item">
            <a href="#menu">Cardápio</a>
          </li>
        </ul>

        <button id="btn-cart-mobile" onClick={onOpenCart}>
          <i className="fa-solid fa-bag-shopping"></i>Carrinho
        </button>
      </div>
    </header>
  );
}
