import React from "react";

export default function Header({ onOpenCart }) {
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

        <button id="btn-cart" onClick={onOpenCart}>
          <i className="fa-solid fa-bag-shopping"></i>Carrinho
        </button>

        <button id="mobile-btn">
          <i className="fa-solid fa-bars"></i>
        </button>
      </nav>
    </header>
  );
}
