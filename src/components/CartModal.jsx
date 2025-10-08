import React, { useEffect, useRef } from "react";

export default function CartModal({
  cart,
  onClose,
  onConfirm,
  onRemove,
  onAdd,
  removeAll,
  returnFocusRef,
}) {
  const total = cart.reduce((s, it) => s + it.price * it.quantity, 0);
  const firstButtonRef = useRef(null);

  useEffect(() => {
    const prevActive = document.activeElement;
    // focus first actionable button inside modal
    if (firstButtonRef.current) firstButtonRef.current.focus();

    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("keydown", handleKey);
      if (returnFocusRef && returnFocusRef.current)
        returnFocusRef.current.focus();
      else if (prevActive && prevActive.focus) prevActive.focus();
    };
  }, [returnFocusRef, onClose]);

  return (
    <section id="cart" aria-label="Carrinho de Compras">
      <div
        className="cart-background"
        id="cart-modal"
        style={{ display: "flex" }}
      >
        <div className="cart-container" role="dialog" aria-modal="true">
          <h2 className="cart-title">CARRINHO</h2>

          <div id="cart-items">
            {cart.length === 0 ? (
              <p aria-live="polite">Seu carrinho está vazio.</p>
            ) : (
              cart.map((item) => (
                <div className="cart-item" key={item.name}>
                  <div className="cart-item-details">
                    <p className="font-bold">
                      {item.name}{" "}
                      <span className="cart-item-quantity">
                        x{item.quantity}
                      </span>
                    </p>
                    <p className="font-medium">
                      R$ {(item.price * item.quantity).toFixed(2)}
                    </p>
                    <div className="cart-item-controls">
                      <button
                        aria-label={`Remover uma unidade de ${item.name}`}
                        onClick={() => onRemove(item.name)}
                      >
                        -
                      </button>
                      <span aria-hidden>{item.quantity}</span>
                      <button
                        aria-label={`Adicionar unidade de ${item.name}`}
                        onClick={() => onAdd && onAdd(item)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="cart-item-actions">
                    <button
                      className="btn-remove"
                      onClick={() => removeAll && removeAll(item.name)}
                    >
                      Remover tudo
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <p className="cart-total">
            Total:{" "}
            <span id="cart-total" aria-live="polite">
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
            <button
              id="confirm-cart-btn"
              onClick={onConfirm}
              disabled={cart.length === 0}
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
