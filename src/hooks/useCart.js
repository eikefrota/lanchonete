import { useState, useEffect } from "react";

export default function useCart() {
  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem("cart");
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  function add(item) {
    setCart((prev) => {
      const found = prev.find((p) => p.name === item.name);
      if (found)
        return prev.map((p) =>
          p.name === item.name ? { ...p, quantity: p.quantity + 1 } : p
        );
      return [...prev, { ...item, quantity: 1 }];
    });
  }

  function remove(name) {
    setCart((prev) => {
      const idx = prev.findIndex((p) => p.name === name);
      if (idx === -1) return prev;
      const item = prev[idx];
      if (item.quantity > 1)
        return prev.map((p) =>
          p.name === name ? { ...p, quantity: p.quantity - 1 } : p
        );
      return prev.filter((p) => p.name !== name);
    });
  }

  function clear() {
    setCart([]);
  }

  const total = cart.reduce((s, it) => s + it.price * it.quantity, 0);

  return { cart, add, remove, clear, total };
}
