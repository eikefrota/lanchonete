import React, { useEffect, useRef } from "react";

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

  useEffect(() => {
    const prevActive = document.activeElement;
    if (cepRef.current) cepRef.current.focus();
    return () => {
      if (returnFocusRef && returnFocusRef.current)
        returnFocusRef.current.focus();
      else if (prevActive && prevActive.focus) prevActive.focus();
    };
  }, [returnFocusRef]);
  return (
    <section id="address" aria-label="Endereço de Entrega">
      <div
        className="address-background"
        id="address-modal"
        style={{ display: "flex" }}
      >
        <div className="address-container">
          <h2 className="address-title">ENDEREÇO</h2>

          <p className="address-label">CEP</p>
          <input
            type="text"
            id="input-cep"
            className="address-input"
            value={address.cep}
            ref={cepRef}
            onChange={(e) =>
              setAddress((a) => ({
                ...a,
                cep: e.target.value.replace(/\D/g, "").slice(0, 8),
              }))
            }
            onBlur={onCepBlur}
          />
          <p
            className="warning-text"
            id="cep-warn"
            style={{
              display:
                showErrors && address.cep.trim() === "" ? "block" : "none",
            }}
          >
            Campo obrigatório!
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
            value={address.number}
            onChange={(e) =>
              setAddress((a) => ({ ...a, number: e.target.value }))
            }
          />
          <p
            className="warning-text"
            id="number-warn"
            style={{
              display:
                showErrors && address.number.trim() === "" ? "block" : "none",
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
            <button id="checkout-btn" onClick={onCheckout}>
              Finalizar pedido
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
