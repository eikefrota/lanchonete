import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import useCart from "./useCart";

describe("Hook useCart", () => {
  it("Adiciona um item ao carrinho e incrementa a quantidade", () => {
    const { result } = renderHook(() => useCart());
    act(() => {
      result.current.add({ name: "Hamburguer", price: 10 });
    });
    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0].quantity).toBe(1);

    act(() => {
      result.current.add({ name: "Hamburguer", price: 10 });
    });
    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0].quantity).toBe(2);
  });

  it("Remove um item do carrinho e diminui a quantidade", () => {
    const { result } = renderHook(() => useCart());
    act(() => {
      result.current.add({ name: "Coca", price: 5 });
      result.current.add({ name: "Coca", price: 5 });
    });
    expect(result.current.cart[0].quantity).toBe(2);

    act(() => {
      result.current.remove("Coca");
    });
    expect(result.current.cart[0].quantity).toBe(1);

    act(() => {
      result.current.remove("Coca");
    });
    expect(result.current.cart).toHaveLength(0);
  });

  it("Limpa o carrinho e persiste no localStorage", () => {
    const { result } = renderHook(() => useCart());
    act(() => {
      result.current.add({ name: "Pizza", price: 20 });
    });
    expect(JSON.parse(localStorage.getItem("cart"))).toBeTruthy();

    act(() => {
      result.current.clear();
    });
    expect(result.current.cart).toHaveLength(0);
    expect(JSON.parse(localStorage.getItem("cart"))).toEqual([]);
  });
});
