import React, { useEffect, useRef } from "react";

export default function CartModal({
  cart,
  onClose,
  onConfirm,
  onRemove,
  returnFocusRef,
}) {
  const total = cart.reduce((s, it) => s + it.price * it.quantity, 0);
  const firstButtonRef = useRef(null);

  useEffect(() => {
    const prevActive = document.activeElement;
    // focus first actionable button inside modal
    if (firstButtonRef.current) firstButtonRef.current.focus();
    return () => {
      if (returnFocusRef && returnFocusRef.current)
        returnFocusRef.current.focus();
      else if (prevActive && prevActive.focus) prevActive.focus();
    };
  }, [returnFocusRef]);

  return (
    <section id="cart" aria-label="Carrinho de Compras">
      <div
        className="cart-background"
        id="cart-modal"
        style={{ display: "flex" }}
      >
        <div className="cart-container">
          <h2 className="cart-title">CARRINHO</h2>
          <div id="cart-items">
            {cart.map((item) => (
              <div className="cart-item" key={item.name}>
                <div className="cart-item-details">
                  <p className="font-bold">
                    {item.name}{" "}
                    <span className="cart-item-quantity">x{item.quantity}</span>
                  </p>
                  <p className="font-medium">
                    R$ {(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
                <button
                  className="btn-remove"
                  onClick={() => onRemove(item.name)}
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
          <p className="cart-total">
            Total:{" "}
            <span id="cart-total">
              {total.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </span>
          </p>
          <div className="cart-buttons">
            <button id="close-cart-btn" onClick={onClose} ref={firstButtonRef}>
              Fechar
            </button>
            <button id="confirm-cart-btn" onClick={onConfirm}>
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
