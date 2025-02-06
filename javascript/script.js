// Função para mudar ícone do menu mobile
document.addEventListener("DOMContentLoaded", function() {
    const mobileBtn = document.getElementById("mobile-btn");
    const mobileMenu = document.getElementById("mobile-menu");

    mobileBtn.addEventListener("click", function() {
        mobileMenu.classList.toggle("active");
        const icon = mobileBtn.querySelector("i");
        if (icon) {
            icon.classList.toggle("fa-x");
        }
    });
});

// Função para abrir o carrinho
document.getElementById('btn-cart').addEventListener('click', function() {
    // Exibe o carrinho
    document.getElementById('cart-modal').style.display = 'flex';
});

// Função para abrir o carrinho mobile
document.getElementById('btn-cart-mobile').addEventListener('click', function() {
    // Exibe o carrinho
    document.getElementById('cart-modal').style.display = 'flex';
});

// Função para fechar o carrinho
document.getElementById('close-cart-btn').addEventListener('click', function() {
    // Oculta o carrinho
    document.getElementById('cart-modal').style.display = 'none';
});

// Função para abrir o modal de endereço ao clicar em confirmar
document.getElementById('confirm-cart-btn').addEventListener('click', function() {
    // Caso não haja itens no carrinho, não há como avançar
    if (cart.length === 0) {
        // Exibe o aviso com Toastify
        Toastify({
            text: "Carrinho vazio!",
            duration: 3000,
            close: true,
            gravity: "top", 
            position: "center", 
            stopOnFocus: true, 
            style: {
                background: "#EF4444",  // Cor de fundo vermelha para o aviso de erro
            },
        }).showToast();
        return;
    }

    // Se houver itens no carrinho, oculta o carrinho e exibe o modal de endereço
    document.getElementById('cart-modal').style.display = 'none';
    document.getElementById('address-modal').style.display = 'flex';
});

// Função para voltar ao carrinho
document.getElementById('return-address-btn').addEventListener('click', function() {
    // Oculta o modal de endereço e exibe o carrinho
    document.getElementById('address-modal').style.display = 'none';
    document.getElementById('cart-modal').style.display = 'flex';
});

// Array para armazenar os itens do carrinho
const cart = [];

// Seleciona o container onde os itens do carrinho serão exibidos
const cartItemsContainer = document.querySelector("#cart-items");
const cartTotal = document.querySelector("#cart-total");
let cartTotalValue = 0;

// Adiciona evento de clique nos botões de adicionar ao carrinho
document.querySelectorAll(".btn-dish").forEach(button => {
    button.addEventListener("click", function(event) {
        const dishElement = event.target.closest(".dish");

        if (dishElement) {
            const name = dishElement.querySelector(".dish-title").textContent.trim();
            const price = parseFloat(
                dishElement.querySelector(".dish-price h4").textContent.replace("R$ ", "").replace(",", ".").trim()
            );

            addToCart(name, price);
        }
    });
});

// Função para adicionar itens ao carrinho
function addToCart(name, price) {
    // Verifica se o item já está no carrinho
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity += 1; // Incrementa a quantidade se o item já existe
    } else {
        // Adiciona um novo item ao carrinho
        cart.push({
            name,
            price,
            quantity: 1
        });
    }

    // Exibe o aviso de sucesso com Toastify
    Toastify({
        text: "Produto adicionado com sucesso!",
        duration: 3000, // Duração do aviso (em milissegundos)
        close: true, // Adiciona botão para fechar o aviso
        gravity: "top", // Posição no topo
        position: "center", // Posição no centro
        backgroundColor: "green", // Cor de fundo verde
        stopOnFocus: true, // Interrompe o timeout se o aviso for clicado
    }).showToast();

    updateCartModel(); // Atualiza o modal do carrinho
}

// Função para atualizar os itens do carrinho no modal
function updateCartModel() {
    cartItemsContainer.innerHTML = ""; // Limpa os itens atuais no modal
    let total = 0;

    cart.forEach(item => {
        const cartItemElement = document.createElement("div");
        cartItemElement.classList.add("cart-item");

        cartItemElement.innerHTML = `
            <div class="cart-item-details">
                <p class="font-bold">${item.name} <span class="cart-item-quantity">x${item.quantity}</span></p>
                <p class="font-medium">R$ ${(item.price * item.quantity).toFixed(2)}</p>
            </div>
            <button class="btn-remove" data-name="${item.name}">Remover</button>
        `;

        cartItemsContainer.appendChild(cartItemElement);

        total += item.price * item.quantity;
    });

    // Atualiza o total do carrinho
    cartTotal.textContent = total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

    cartTotalValue = total; // Atualiza a variável global
}

// Função para remover itens do carrinho
function removeItemCart(name) {
    const index = cart.findIndex(item => item.name === name);

    if (index !== -1) {
        const item = cart[index];

        if (item.quantity > 1) {
            item.quantity -= 1; // Decrementa a quantidade se for maior que 1
        } else {
            cart.splice(index, 1); // Remove o item completamente se a quantidade for 1
        }

        updateCartModel();
    }
}

// Adiciona evento de clique nos botões de remover no modal
cartItemsContainer.addEventListener("click", function(event) {
    if (event.target.classList.contains("btn-remove")) {
        const name = event.target.getAttribute("data-name");
        removeItemCart(name);
    }
});


// Função para validar os campos obrigatórios do endereço
function validateAddressFields() {
    let isValid = true;

    // Função auxiliar para verificar e destacar campos vazios
    function checkField(field) {
        if (field.value.trim() === "") {
            field.classList.add("error-border"); // Adicionar borda vermelha para destacar erro
            const warning = field.nextElementSibling;
            if (warning && warning.classList.contains("warning-text")) {
                warning.style.display = "block"; // Mostrar aviso de campo obrigatório
            }
            isValid = false;
        } else {
            field.classList.remove("error-border");
            const warning = field.nextElementSibling;
            if (warning && warning.classList.contains("warning-text")) {
                warning.style.display = "none"; // Ocultar aviso se o campo estiver preenchido
            }
        }
    }

    // Captura dos elementos do formulário
    const inputCep = document.getElementById("input-cep");
    const inputNumber = document.getElementById("input-number");

    // Validar cada campo obrigatório
    checkField(inputCep);
    checkField(inputNumber);

    return isValid;
}


// Referências aos campos do formulário
const inputCep = document.getElementById("input-cep");
const inputStreet = document.getElementById("input-street");
const inputNumber = document.getElementById("input-number");
const inputComplement = document.getElementById("input-complement");
const inputNeighborhood = document.getElementById("input-neighborhood");
const inputCity = document.getElementById("input-city");
const inputState = document.getElementById("input-state");

// Buscar endereço via CEP
inputCep.addEventListener("blur", () => {
    const cep = inputCep.value;

    if (cep.length === 8) {
        fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then(response => response.json())
            .then(data => {
                if (!data.erro) {
                    inputStreet.value = data.logradouro || "";
                    inputNeighborhood.value = data.bairro || "";
                    inputCity.value = data.localidade || "";
                    inputState.value = data.uf || "";
                } else {
                    alert("CEP não encontrado!");
                }
            })
            .catch(() => {
                alert("Erro ao buscar o CEP. Verifique sua conexão!");
            });
    } else {
        alert("CEP inválido! O CEP deve conter 8 dígitos.");
    }
});

// Permitir apenas números e limitar a 8 caracteres no campo CEP
inputCep.addEventListener("input", () => {
    inputCep.value = inputCep.value.replace(/\D/g, "").slice(0, 8);
});


// Função de finalizar o pedido
const checkoutBtn = document.getElementById("checkout-btn");
checkoutBtn.addEventListener("click", function() {

    // Validar campos de endereço
    if (!validateAddressFields()) {
        Toastify({
            text: "Por favor, preencha todos os campos obrigatórios!",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "center",
            stopOnFocus: true,
            style: {
                background: "#EF4444",
            },
        }).showToast();
        return;
    }

    // Criar mensagem com os itens do carrinho
    const cartItems = cart.map((item) => {
        return `\n*${item.name}*\n*Quantidade:* ${item.quantity}\n*Preço:* R$${item.price}\n-------------------------------------------\n`;
    }).join("");

    // Adicionar o valor total ao final da mensagem
    const totalMessage = `*VALOR TOTAL:* R$ ${cartTotalValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}\n`;

    // Criar mensagem de endereço
    const addressMessage = `*ENDEREÇO DE ENTREGA:* ${inputStreet.value}, ${inputNumber.value}, ${inputComplement.value || "N/A"} - ${inputNeighborhood.value}, ${inputCity.value}-${inputState.value}, ${inputCep.value}`;

    // Unir todas as partes da mensagem
    const message = encodeURIComponent(`\n${cartItems}\n${totalMessage}\n${addressMessage}`);
    const phone = "+5585999062339"; // Número do WhatsApp para envio

    // Abrir a janela do WhatsApp com a mensagem pré-formatada
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");

    // Limpar o carrinho e atualizar a exibição
    cart = [];
    updateCartModel();
});
