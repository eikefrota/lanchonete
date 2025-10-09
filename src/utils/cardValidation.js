// Card validation helpers: Luhn, brand detection, expiry and CVV checks
export function luhnCheck(number) {
  const digits = String(number).replace(/\D/g, "");
  if (digits.length < 12) return false;
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

export function detectBrand(number) {
  const d = String(number).replace(/\D/g, "");
  if (!d) return null;
  if (/^4/.test(d)) return "visa";
  if (/^5[1-5]/.test(d) || /^2(2[2-9]|[3-6][0-9]|7[01]|720)/.test(d))
    return "mastercard";
  if (/^3[47]/.test(d)) return "amex";
  if (/^6(011|5)/.test(d) || /^64[4-9]/.test(d)) return "discover";
  return "unknown";
}

export function validateExpiry(value) {
  const d = String(value).replace(/\D/g, "");
  if (d.length !== 4 && d.length !== 6) return false;
  const mm = parseInt(d.slice(0, 2), 10);
  let yy = parseInt(d.slice(2), 10);
  if (isNaN(mm) || isNaN(yy)) return false;
  if (mm < 1 || mm > 12) return false;
  // normalize 2-digit year to 2000+yy
  if (d.length === 4) {
    yy = 2000 + yy;
  } else {
    yy = parseInt(d.slice(2), 10);
  }
  const now = new Date();
  const fullYear =
    d.length === 4 ? 2000 + parseInt(d.slice(2), 10) : parseInt(d.slice(2), 10);
  const exp = new Date(fullYear, mm, 0, 23, 59, 59);
  return exp >= now;
}

export function validateCvv(cvv, brand = null) {
  const d = String(cvv).replace(/\D/g, "");
  if (!d) return false;
  const len = d.length;
  if (brand === "amex") return len === 4;
  return len === 3 || len === 4;
}

export function validateCardAll({ name, number, expiry, cvv, type }) {
  const errs = {};
  if (!name || String(name).trim().length < 2)
    errs.cardName = "Nome do titular inválido";
  if (!luhnCheck(number)) errs.cardNumber = "Número do cartão inválido";
  if (!validateExpiry(expiry)) errs.cardExpiry = "Validade inválida ou expirou";
  const brand = detectBrand(number);
  if (!validateCvv(cvv, brand)) errs.cardCvv = "CVV inválido";
  if (!type) errs.cardType = "Selecione crédito ou débito";
  return errs;
}

export default {
  luhnCheck,
  detectBrand,
  validateExpiry,
  validateCvv,
  validateCardAll,
};
