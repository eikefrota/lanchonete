import {
  luhnCheck,
  detectBrand,
  validateExpiry,
  validateCvv,
  validateCardAll,
} from "./cardValidation";

describe("cardValidation helpers", () => {
  test("luhnCheck accepts known valid card", () => {
    expect(luhnCheck("4242424242424242")).toBe(true); // visa
  });

  test("luhnCheck rejects invalid number", () => {
    expect(luhnCheck("4111111111111112")).toBe(false);
  });

  test("detectBrand recognizes brands", () => {
    expect(detectBrand("4242424242424242")).toBe("visa");
    expect(detectBrand("378282246310005")).toBe("amex");
    expect(detectBrand("5105105105105100")).toBe("mastercard");
  });

  test("validateExpiry accepts future date and rejects past", () => {
    // assuming tests run before year 2099, pick a far future
    expect(validateExpiry("12/99")).toBe(true);
    expect(validateExpiry("01/20")).toBe(false);
  });

  test("validateCvv respects amex 4-digit and others 3-digit", () => {
    expect(validateCvv("123", "visa")).toBe(true);
    expect(validateCvv("1234", "amex")).toBe(true);
    expect(validateCvv("12", "visa")).toBe(false);
  });

  test("validateCardAll aggregates errors", () => {
    const errs = validateCardAll({
      name: "",
      number: "1234",
      expiry: "01/20",
      cvv: "12",
      type: "",
    });
    expect(Object.keys(errs).length).toBeGreaterThan(0);
  });
});
