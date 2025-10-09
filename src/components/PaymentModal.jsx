import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { validateCardAll, detectBrand } from "../utils/cardValidation";
import visaSrc from "../assets/brands/visa.svg";
import mcSrc from "../assets/brands/mastercard.svg";
import amexSrc from "../assets/brands/amex.svg";
import discSrc from "../assets/brands/discover.svg";

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
  const [cardBrand, setCardBrand] = useState(() => detectBrand(cardNumber));
  const DEFAULT_PIX_KEY = "85999062338";
  const [pixCopied, setPixCopied] = useState(false);
  const [showPayload, setShowPayload] = useState(false);
  const [payloadCopied, setPayloadCopied] = useState(false);
  const [pixDataUrl, setPixDataUrl] = useState(null);

  // Helper to build EMV-like payload for PIX (BR Code)
  function tag(id, value) {
    const len = String(value).length.toString().padStart(2, "0");
    return `${id}${len}${value}`;
  }

  function crc16(str) {
    let crc = 0xffff;
    for (let c = 0; c < str.length; c++) {
      crc ^= str.charCodeAt(c) << 8;
      for (let i = 0; i < 8; i++) {
        if ((crc & 0x8000) !== 0) crc = ((crc << 1) ^ 0x1021) & 0xffff;
        else crc = (crc << 1) & 0xffff;
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, "0");
  }

  function buildPixPayload({
    key,
    amount,
    merchantName = "FastDish",
    merchantCity = "SAO PAULO",
    txid = "*",
  } = {}) {
    const amountStr = amount ? String(Number(amount).toFixed(2)) : undefined;
    let payload = "";
    payload += tag("00", "01"); // payload format indicator
    payload += tag("01", "12"); // point of initiation method (dynamic)

    // Merchant Account Information - Pix (GUI + key)
    let mai = "";
    mai += tag("00", "BR.GOV.BCB.PIX");
    mai += tag("01", key);
    payload += tag("26", mai);

    payload += tag("52", "0000"); // Merchant Category Code
    payload += tag("53", "986"); // Currency BRL
    if (amountStr) payload += tag("54", amountStr);
    payload += tag("58", "BR");
    payload += tag("59", merchantName.substring(0, 25));
    payload += tag("60", merchantCity.substring(0, 15));

    // Additional data field template - txid
    let additional = tag("05", txid.substring(0, 25));
    payload += tag("62", additional);

    // CRC (63) - compute over payload + '6304'
    const crc = crc16(payload + "6304");
    payload += tag("63", crc);
    return payload;
  }

  // Build QR image URL using a simple external QR generation service
  function buildPixQrUrlFromPayload(payload) {
    const encoded = encodeURIComponent(payload);
    return `https://api.qrserver.com/v1/create-qr-code/?data=${encoded}&size=300x300`;
  }

  // Generate QR locally using `qrcode` lib; fallback to external service
  useEffect(() => {
    if (address.paymentMethod !== "Pix") return;
    // Build payload using the default key + amount
    const payload = buildPixPayload({ key: DEFAULT_PIX_KEY, amount: total });
    // Store the payload in a local variable so UI can copy it
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setTimeout(() => {
      QRCode.toDataURL(payload, { margin: 1, width: 300 })
        .then((url) => setPixDataUrl(url))
        .catch(() => setPixDataUrl(buildPixQrUrlFromPayload(payload)));
    }, 0);
  }, [address.paymentMethod, address.pixKey, total]);

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
      const errs = validateCardAllLocal();
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

    // if Pix, build payload and include in address before confirming
    if (address.paymentMethod === "Pix") {
      const payload = buildPixPayload({ key: DEFAULT_PIX_KEY, amount: total });
      setAddress((a) => ({
        ...a,
        changeFor: changeForValue,
        card: cardSummary,
        pixPayload: payload,
      }));
      onConfirm(payload);
      return;
    }

    setAddress((a) => ({ ...a, changeFor: changeForValue, card: cardSummary }));
    onConfirm();
  }

  // validation will use shared helpers from utils/cardValidation
  function validateCardAllLocal() {
    return validateCardAll({
      name: cardName,
      number: cardNumber,
      expiry: cardExpiry,
      cvv: cardCvv,
      type: cardType,
    });
  }

  // realtime validation + brand detection
  useEffect(() => {
    const brand = detectBrand(cardNumber);
    setCardBrand(brand);

    // only validate realtime when cartão is selected
    if (address.paymentMethod === "Cartão") {
      const errs = validateCardAllLocal();
      setCardErrors(errs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    cardName,
    cardNumber,
    cardExpiry,
    cardCvv,
    cardType,
    address.paymentMethod,
  ]);

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
                    setAddress((a) => ({
                      ...a,
                      paymentMethod: m.id,
                    }))
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
                <div style={{ position: "relative" }}>
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
                    style={{ paddingRight: 44 }}
                  />
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      right: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: 16,
                      color: "#64748b",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                    aria-label={
                      cardBrand
                        ? `Bandeira do cartão: ${cardBrand}`
                        : "Bandeira do cartão desconhecida"
                    }
                  >
                    {cardBrand === "visa" && (
                      <img
                        src={visaSrc}
                        alt="Visa"
                        title="Visa"
                        style={{ height: 20 }}
                      />
                    )}
                    {cardBrand === "mastercard" && (
                      <img
                        src={mcSrc}
                        alt="MasterCard"
                        title="MasterCard"
                        style={{ height: 20 }}
                      />
                    )}
                    {cardBrand === "amex" && (
                      <img
                        src={amexSrc}
                        alt="American Express"
                        title="American Express"
                        style={{ height: 20 }}
                      />
                    )}
                    {cardBrand === "discover" && (
                      <img
                        src={discSrc}
                        alt="Discover"
                        title="Discover"
                        style={{ height: 20 }}
                      />
                    )}
                    {cardBrand === "unknown" && (
                      <i
                        className="fa-solid fa-credit-card"
                        aria-hidden="true"
                        title="Cartão"
                      ></i>
                    )}
                  </span>
                </div>
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
                  {/* CVV input: max length depends on card brand (Amex=4, others=3) */}
                  {(() => {
                    const cvvMax = cardBrand === "amex" ? 4 : 3;
                    return (
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder={
                          cardBrand === "amex" ? "CVV (4)" : "CVV (3)"
                        }
                        className="address-input"
                        value={cardCvv}
                        maxLength={cvvMax}
                        onChange={(e) => {
                          const digits = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, cvvMax);
                          setCardCvv(digits);
                        }}
                        aria-label={`CVV, use ${cvvMax} digits`}
                      />
                    );
                  })()}
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

          {address.paymentMethod === "Pix" && (
            <div style={{ marginTop: 12 }}>
              <p className="address-label">Pagamento via Pix</p>
              <div className="pix-box" style={{ display: "flex", gap: 12 }}>
                <div>
                  <img
                    src={
                      pixDataUrl ||
                      buildPixQrUrlFromPayload(
                        buildPixPayload({ key: DEFAULT_PIX_KEY, amount: total })
                      )
                    }
                    alt="QR code do Pix"
                    width={120}
                    height={120}
                    style={{ borderRadius: 6, border: "1px solid #e2e8f0" }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 14, marginBottom: 6 }}>
                    Pix — Copia & Cola (BR Code)
                  </p>
                  <div style={{ marginTop: 6 }}>
                    <textarea
                      readOnly
                      value={buildPixPayload({
                        key: DEFAULT_PIX_KEY,
                        amount: total,
                      })}
                      style={{
                        width: "100%",
                        minHeight: 92,
                        padding: 8,
                        fontFamily: "monospace",
                      }}
                      aria-label="Payload Pix Copia e Cola"
                    />
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <button
                        type="button"
                        className="already-changed-btn"
                        onClick={() => {
                          const payload = buildPixPayload({
                            key: DEFAULT_PIX_KEY,
                            amount: total,
                          });
                          if (
                            navigator.clipboard &&
                            navigator.clipboard.writeText
                          ) {
                            navigator.clipboard.writeText(payload).then(() => {
                              setPayloadCopied(true);
                              setTimeout(() => setPayloadCopied(false), 1800);
                            });
                          }
                        }}
                      >
                        {payloadCopied ? "Copiado" : "Copiar"}
                      </button>
                      <p
                        style={{ color: "#64748b", marginTop: 6, fontSize: 13 }}
                      >
                        Após o pagamento, envie o comprovante pelo WhatsApp
                      </p>
                    </div>
                  </div>
                </div>
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
                  Object.keys(validateCardAllLocal()).length > 0)
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
