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
  // card fields (local state to avoid parent re-renders while typing)
  const [cardName, setCardName] = useState(address.card?.cardHolder || "");
  const [cardNumber, setCardNumber] = useState(address.card?.cardNumber || ""); // digits only
  const [cardExpiry, setCardExpiry] = useState(address.card?.cardExpiry || ""); // MM/YY
  const [cardCvv, setCardCvv] = useState("");
  const [cardType, setCardType] = useState(address.card?.type || ""); // 'Crédito' | 'Débito'
  const [cardErrors, setCardErrors] = useState({});

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

  function formatCardDisplay(digits) {
    if (!digits) return "";
    return String(digits).replace(/(\d{4})(?=\d)/g, "$1 ");
  }

  function formatExpiryDisplay(digits) {
    const d = String(digits).replace(/\D/g, "").slice(0, 4);
    if (d.length <= 2) return d;
    return `${d.slice(0, 2)}/${d.slice(2)}`;
  }

  function handleConfirm() {
    const changeForValue = localExactChange
      ? "Já trocado"
      : localDigits
      ? formatBRL(localDigits)
      : "";
    // validate before saving
    if (address.paymentMethod === "Cartão") {
      const errs = validateCardAll();
      if (Object.keys(errs).length > 0) {
        setCardErrors(errs);
        return;
      }
    }

    // build card summary if cartão selected
    const cardSummary =
      address.paymentMethod === "Cartão"
        ? {
            cardHolder: cardName || "",
            cardLast4: cardNumber ? String(cardNumber).slice(-4) : "",
            cardExpiry: cardExpiry || "",
            type: cardType || "",
          }
        : undefined;

    setAddress((a) => ({ ...a, changeFor: changeForValue, card: cardSummary }));
    onConfirm();
  }

  // validation helpers
  function validateCardNumberLuhn(num) {
    const digits = String(num).replace(/\D/g, "");
    if (digits.length < 12) return false; // too short
    let sum = 0;
    let shouldDouble = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let d = parseInt(digits.charAt(i), 10);
      if (shouldDouble) {
        d *= 2;
        if (d > 9) d -= 9;
      }
      sum += d;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  }

  function validateExpiry(mmYY) {
    const d = String(mmYY).replace(/\D/g, "");
    if (d.length !== 4) return false;
    const mm = parseInt(d.slice(0, 2), 10);
    const yy = parseInt(d.slice(2), 10);
    if (isNaN(mm) || isNaN(yy)) return false;
    if (mm < 1 || mm > 12) return false;
    const now = new Date();
    const fullYear = 2000 + yy;
    const exp = new Date(fullYear, mm, 0, 23, 59, 59); // last day of month
    return exp >= now;
  }

  function validateCvv(cvv) {
    const d = String(cvv).replace(/\D/g, "");
    return d.length === 3 || d.length === 4;
  }

  function validateCardAll() {
    const errs = {};
    if (!cardName || cardName.trim().length < 2)
      errs.cardName = "Nome do titular inválido";
    if (!validateCardNumberLuhn(cardNumber))
      errs.cardNumber = "Número do cartão inválido";
    if (!validateExpiry(cardExpiry))
      errs.cardExpiry = "Validade inválida ou expirou";
    if (!validateCvv(cardCvv)) errs.cardCvv = "CVV inválido";
    if (!cardType) errs.cardType = "Selecione crédito ou débito";
    return errs;
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

          {address.paymentMethod === "Cartão" && (
            <div style={{ marginTop: 12 }}>
              <p className="address-label">Dados do cartão</p>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <button
                  type="button"
                  className={
                    "payment-pill" + (cardType === "Crédito" ? " selected" : "")
                  }
                  onClick={() => setCardType("Crédito")}
                >
                  Crédito
                </button>
                <button
                  type="button"
                  className={
                    "payment-pill" + (cardType === "Débito" ? " selected" : "")
                  }
                  onClick={() => setCardType("Débito")}
                >
                  Débito
                </button>
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                <input
                  type="text"
                  placeholder="Nome no cartão"
                  className="address-input"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />
                {cardErrors.cardName && (
                  <p className="warning-text" style={{ color: "#ef4444" }}>
                    {cardErrors.cardName}
                  </p>
                )}
                <input
                  type="text"
                  placeholder="Número do cartão"
                  className="address-input"
                  value={formatCardDisplay(cardNumber)}
                  onChange={(e) => {
                    const digits = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 16);
                    setCardNumber(digits);
                  }}
                />
                {cardErrors.cardNumber && (
                  <p className="warning-text" style={{ color: "#ef4444" }}>
                    {cardErrors.cardNumber}
                  </p>
                )}
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    placeholder="MM/AA"
                    className="address-input"
                    value={formatExpiryDisplay(cardExpiry)}
                    onChange={(e) => {
                      const digits = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 4);
                      setCardExpiry(digits);
                    }}
                  />
                  {cardErrors.cardExpiry && (
                    <p className="warning-text" style={{ color: "#ef4444" }}>
                      {cardErrors.cardExpiry}
                    </p>
                  )}
                  <input
                    type="text"
                    placeholder="CVV"
                    className="address-input"
                    value={cardCvv}
                    onChange={(e) => {
                      const digits = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 4);
                      setCardCvv(digits);
                    }}
                  />
                  {cardErrors.cardCvv && (
                    <p className="warning-text" style={{ color: "#ef4444" }}>
                      {cardErrors.cardCvv}
                    </p>
                  )}
                </div>
                {cardErrors.cardType && (
                  <p className="warning-text" style={{ color: "#ef4444" }}>
                    {cardErrors.cardType}
                  </p>
                )}
              </div>
            </div>
          )}

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
              disabled={
                !address.paymentMethod ||
                (address.paymentMethod === "Cartão" &&
                  Object.keys(validateCardAll()).length > 0)
              }
            >
              Finalizar pedido
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
