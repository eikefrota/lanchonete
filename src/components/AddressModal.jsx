import React, { useEffect, useRef, useState } from "react";

export default function AddressModal({
  address,
  setAddress,
  onReturn,
  onCheckout,
  onCepBlur,
  returnFocusRef,
  showErrors,
}) {
  const cepRef = useRef(null);
  const numberRef = useRef(null);
  const [touched, setTouched] = useState({ cep: false, number: false });
  const [focused, setFocused] = useState({ cep: false, number: false });
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState("");

  function formatCepForDisplay(cepDigits) {
    const d = (cepDigits || "").replace(/\D/g, "");
    if (!d) return "";
    if (d.length <= 5) return d;
    return `${d.slice(0, 5)}-${d.slice(5, 8)}`;
  }

  // keep previous street to detect when CEP lookup populated the street
  const prevStreet = useRef(address.street);

  useEffect(() => {
    // if previously empty and now filled, and number empty -> focus number
    if (
      (!prevStreet.current || prevStreet.current.trim() === "") &&
      address.street &&
      address.street.trim() !== "" &&
      numberRef.current &&
      !focused.number &&
      (!address.number || address.number.trim() === "")
    ) {
      numberRef.current.focus();
    }
    prevStreet.current = address.street;
  }, [address.street, address.number, focused.number]);

  useEffect(() => {
    const prevActive = document.activeElement;
    if (cepRef.current) cepRef.current.focus();

    return () => {
      if (returnFocusRef && returnFocusRef.current)
        returnFocusRef.current.focus();
      else if (prevActive && prevActive.focus) prevActive.focus();
    };
  }, [returnFocusRef]);

  async function handleCepBlur(cep) {
    // cep argument is digits-only
    setCepLoading(true);
    setCepError("");
    try {
      const res = onCepBlur ? onCepBlur(cep) : null;
      if (res && typeof res.then === "function") await res;
    } catch (err) {
      setCepError(err?.message || "Erro ao buscar CEP");
    } finally {
      setCepLoading(false);
    }
  }

  return (
    <section id="address" aria-label="Endereço de Entrega">
      <div
        className="address-background"
        id="address-modal"
        style={{ display: "flex" }}
      >
        <div className="address-container" role="dialog" aria-modal="true">
          <h2 className="address-title">ENDEREÇO</h2>

          <p className="address-label">CEP</p>
          <input
            type="text"
            id="input-cep"
            className="address-input"
            value={formatCepForDisplay(address.cep)}
            ref={cepRef}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 8);
              setAddress((a) => ({ ...a, cep: digits }));
            }}
            onFocus={() => setFocused((f) => ({ ...f, cep: true }))}
            onBlur={(e) => {
              setFocused((f) => ({ ...f, cep: false }));
              setTouched((t) => ({ ...t, cep: true }));
              const cep = e.target.value.replace(/\D/g, "");
              if (cep.length === 8) handleCepBlur(cep);
            }}
          />

          <p
            className="warning-text"
            id="cep-warn"
            style={{
              display:
                (showErrors || touched.cep) &&
                !focused.cep &&
                address.cep.trim() === ""
                  ? "block"
                  : "none",
            }}
          >
            Campo obrigatório!
          </p>

          <p
            className="warning-text"
            style={{ display: cepLoading ? "block" : "none" }}
          >
            Buscando endereço...
          </p>
          <p
            className="warning-text"
            style={{ display: cepError ? "block" : "none" }}
          >
            {cepError}
          </p>

          <p className="address-label">Rua</p>
          <input
            type="text"
            id="input-street"
            className="address-input"
            readOnly
            value={address.street}
          />

          <p className="address-label">Número</p>
          <input
            type="text"
            id="input-number"
            className="address-input"
            ref={numberRef}
            value={address.number}
            onChange={(e) =>
              setAddress((a) => ({ ...a, number: e.target.value }))
            }
            onFocus={() => setFocused((f) => ({ ...f, number: true }))}
            onBlur={() => {
              setFocused((f) => ({ ...f, number: false }));
              setTouched((t) => ({ ...t, number: true }));
            }}
          />
          <p
            className="warning-text"
            id="number-warn"
            style={{
              display:
                (showErrors || touched.number) &&
                !focused.number &&
                address.number.trim() === ""
                  ? "block"
                  : "none",
            }}
          >
            Campo obrigatório!
          </p>

          <p className="address-label">Complemento</p>
          <input
            type="text"
            id="input-complement"
            className="address-input"
            value={address.complement}
            onChange={(e) =>
              setAddress((a) => ({ ...a, complement: e.target.value }))
            }
          />

          <p className="address-label">Bairro</p>
          <input
            type="text"
            id="input-neighborhood"
            className="address-input"
            readOnly
            value={address.neighborhood}
          />

          <p className="address-label">Cidade</p>
          <input
            type="text"
            id="input-city"
            className="address-input"
            readOnly
            value={address.city}
          />

          <p className="address-label">Estado</p>
          <input
            type="text"
            id="input-state"
            className="address-input"
            readOnly
            value={address.state}
          />

          <div className="address-buttons">
            <button id="return-address-btn" onClick={onReturn}>
              Voltar
            </button>
            <button
              id="checkout-btn"
              onClick={onCheckout}
              disabled={cepLoading}
            >
              {cepLoading ? "Aguardando CEP..." : "Finalizar pedido"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
