import React, { useEffect, useRef, useState } from "react";

export default function PaymentModal({
  address,
  setAddress,
  onReturn,
  onConfirm,
  returnFocusRef,
  cart = [],
  total = 0,
}) {
  const containerRef = useRef(null);
  const [localDigits, setLocalDigits] = useState(() => {
    if (!address.changeFor) return "";
    if (address.changeFor === "Já trocado") return "";
    const d = String(address.changeFor).replace(/\D/g, "");
    return d;
  });
  const [localExactChange, setLocalExactChange] = useState(
    address.changeFor === "Já trocado"
  );

  useEffect(() => {
    const prevActive = document.activeElement;
    if (containerRef.current) {
      const first = containerRef.current.querySelector("input,button");
      if (first) first.focus();
    }

    function onKey(e) {
      if (e.key === "Escape") onReturn();
    }
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      if (returnFocusRef && returnFocusRef.current)
        returnFocusRef.current.focus();
      else if (prevActive && prevActive.focus) prevActive.focus();
    };
  }, [returnFocusRef, onReturn]);

  useEffect(() => {
    if (address.changeFor === "Já trocado") {
      setLocalExactChange(true);
      setLocalDigits("");
    } else {
      setLocalExactChange(false);
      const d = address.changeFor
        ? String(address.changeFor).replace(/\D/g, "")
        : "";
      setLocalDigits(d);
    }
  }, [address.changeFor]);

  function formatBRL(digits) {
    const d = String(digits || "").replace(/\D/g, "");
    if (!d) return "R$ 0,00";
    const num = parseInt(d, 10) || 0;
    const cents = String(num % 100).padStart(2, "0");
    const units = Math.floor(num / 100);
    return `R$ ${units.toLocaleString("pt-BR")},${cents}`;
  }

  function handleConfirm() {
    const changeForValue = localExactChange
      ? "Já trocado"
      : localDigits
      ? formatBRL(localDigits)
      : "";
    setAddress((a) => ({ ...a, changeFor: changeForValue }));
    onConfirm();
  }

  return (
    <section id="payment" aria-label="Forma de pagamento">
      <div
        className="address-background"
        id="payment-modal"
        style={{ display: "flex" }}
      >
        <div
          className="address-container"
          role="dialog"
          aria-modal="true"
          ref={containerRef}
        >
          <h2 className="address-title">FORMA DE PAGAMENTO</h2>

          <div
            className="payment-summary"
            style={{
              marginTop: 12,
              borderTop: "1px solid #eee",
              paddingTop: 12,
            }}
          >
            <p className="address-label">Resumo do pedido</p>
            <div style={{ maxHeight: 140, overflowY: "auto", marginTop: 8 }}>
              {cart.length === 0 ? (
                <p>Nenhum item no carrinho.</p>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.name}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "6px 0",
                      borderBottom: "1px solid #fafafa",
                    }}
                  >
                    <div style={{ fontSize: 14 }}>
                      {item.name}{" "}
                      <small style={{ color: "#64748b" }}>
                        x{item.quantity}
                      </small>
                    </div>
                    <div style={{ fontSize: 14 }}>
                      {(item.price * item.quantity).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
            <p style={{ marginTop: 8, textAlign: "right", fontWeight: 700 }}>
              Total:{" "}
              {total.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>
          <p className="address-label" style={{ marginTop: 12 }}>
            Escolha uma opção
          </p>
          <div
            className="payment-methods"
            role="radiogroup"
            aria-label="Formas de pagamento"
          >
            {[
              { id: "Dinheiro", label: "Dinheiro", icon: "fa-money-bill-wave" },
              { id: "Cartão", label: "Cartão", icon: "fa-credit-card" },
              { id: "Pix", label: "Pix", icon: "fa-qrcode" },
            ].map((m) => {
              const selected = address.paymentMethod === m.id;
              return (
                <button
                  type="button"
                  key={m.id}
                  aria-pressed={selected}
                  onClick={() =>
                    setAddress((a) => ({ ...a, paymentMethod: m.id }))
                  }
                  className={"payment-pill" + (selected ? " selected" : "")}
                  style={{ marginRight: 8 }}
                >
                  <i
                    className={`fa-solid ${m.icon}`}
                    aria-hidden="true"
                    style={{ marginRight: 8 }}
                  ></i>
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          {address.paymentMethod === "Dinheiro" && (
            <div style={{ marginTop: 12 }}>
              <label className="address-label" htmlFor="change-for">
                Troco para:
              </label>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  marginTop: 6,
                }}
              >
                <input
                  id="change-for"
                  className="address-input"
                  placeholder="R$ 0,00"
                  value={
                    localExactChange
                      ? "Já trocado"
                      : localDigits
                      ? formatBRL(localDigits)
                      : ""
                  }
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "");
                    const trimmed = digits.slice(0, 12);
                    setLocalDigits(trimmed);
                    if (localExactChange) setLocalExactChange(false);
                  }}
                  disabled={localExactChange}
                />
                <button
                  type="button"
                  className={
                    "already-changed-btn" + (localExactChange ? " active" : "")
                  }
                  onClick={() => {
                    setLocalExactChange((s) => !s);
                    if (!localExactChange) setLocalDigits("");
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      textAlign: "center",
                      minWidth: 100,
                    }}
                  >
                    Dinheiro já trocado
                  </span>
                </button>
              </div>
            </div>
          )}

          <div className="address-buttons" style={{ marginTop: 18 }}>
            <button id="return-payment-btn" onClick={onReturn}>
              Voltar
            </button>
            <button
              id="confirm-payment-btn"
              onClick={handleConfirm}
              disabled={!address.paymentMethod}
            >
              Finalizar pedido
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
