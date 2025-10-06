import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchAddressByCep } from "./viacep";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("fetchAddressByCep", () => {
  it("retorna endereço para um CEP válido", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            logradouro: "Rua Teste",
            bairro: "Centro",
            localidade: "Cidade",
            uf: "ST",
          }),
      })
    );

    const addr = await fetchAddressByCep("12345-678");
    expect(addr).toEqual({
      street: "Rua Teste",
      neighborhood: "Centro",
      city: "Cidade",
      state: "ST",
    });
  });

  it("lança erro para CEP inexistente", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({ json: () => Promise.resolve({ erro: true }) })
    );

    await expect(fetchAddressByCep("00000000")).rejects.toThrow(
      "CEP não encontrado"
    );
  });

  it("lança erro para formato de CEP inválido", async () => {
    await expect(fetchAddressByCep("123")).rejects.toThrow("CEP inválido");
  });
});
