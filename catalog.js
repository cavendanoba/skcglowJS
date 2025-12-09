// catalog.js
import { products } from "./products.js";
import { addToCart } from "./cart.js";

// Función para manejar el fallback de imágenes
function handleImageError(img) {
    img.src = 'assets/logo-ico.png';
    img.onerror = null; // Evita loop infinito
}

// Función para mostrar el modal del producto con SweetAlert2
export function showProductModal(productId, cartCallback) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    Swal.fire({
        title: product.name,
        html: `
            <div style="text-align: center;">
                <img src="${product.image || 'assets/logo-ico.png'}" 
                     alt="${product.name}" 
                     style="max-width: 100%; max-height: 400px; border-radius: 10px; margin: 10px auto; display: block;"
                     onerror="this.src='assets/logo-ico.png'">
                <p style="margin: 15px 0; font-size: 14px; color: #666;">${product.description || 'Sin descripción disponible'}</p>
                <p style="font-weight: bold; color: #EC407A; margin: 10px 0;">Precio: $${product.price.toLocaleString()}</p>
                <p style="margin: 5px 0; font-size: 13px;">Stock disponible: ${product.stock}</p>
            </div>
        `,
        // icon: 'info',
        confirmButtonText: 'Agregar al carrito',
        cancelButtonText: 'Cerrar',
        showCancelButton: true,
        confirmButtonColor: '#EC407A',
        cancelButtonColor: '#999',
    }).then((result) => {
        if (result.isConfirmed) {
            if (cartCallback) cartCallback(product);
            Swal.fire({
                icon: 'success',
                title: '¡Agregado!',
                text: `${product.name} fue agregado al carrito`,
                timer: 2000
            });
        }
    });
}

// Renderiza los productos en un contenedor (grid)
export function renderCatalog(containerId) {
    const container = document.getElementById(containerId);

    if (!container) {
        console.error("No existe el contenedor del catálogo:", containerId);
        return;
    }

    container.innerHTML = ""; // Limpia por si se recarga

    products.forEach(product => {
        const card = document.createElement("div");
        card.className = "bg-[#F8BBD0] rounded-2xl shadow-xl p-4 text-black border border-yellow-200 flex flex-col h-full";
        card.style.cursor = "pointer";
        card.dataset.productId = product.id;

        card.innerHTML = `
            <img src="${product.image || 'assets/placeholder-product.jpg'}" class="w-full h-32 object-cover rounded-xl mb-3 cursor-pointer hover:opacity-80 transition" alt="${product.name}" onerror="handleImageError(this)" data-product-id="${product.id}" style="cursor: pointer;">
            <div class="flex-1 flex flex-col justify-between">
                <div>
                    <h4 class="font-bold text-lg">${product.name}</h4>
                    <p class="text-sm text-gray-700 mt-2">${product.description || 'Sin descripción'}</p>
                    <p class="text-sm text-gray-700">Stock: ${product.stock}</p>
                    <p class="font-bold mt-2 text-[#EC407A]">$${product.price.toLocaleString()}</p>
                </div>
                <button class="w-full mt-4 bg-black text-white py-2 rounded-xl hover:bg-[#EC407A] add-btn" data-id="${product.id}">
                    Agregar al carrito
                </button>
            </div>
        `;

        container.appendChild(card);
    });

    // Delegación de eventos para los botones
    container.addEventListener("click", (e) => {
        const btn = e.target.closest(".add-btn");
        const img = e.target.closest("img");

        // Si se clickea en la imagen, abrir modal
        if (img && img.dataset.productId) {
            e.stopPropagation();
            showProductModal(parseInt(img.dataset.productId, 10), addToCart);
            return;
        }

        // Si se clickea en el botón "Agregar al carrito"
        if (!btn) return;
        const id = parseInt(btn.dataset.id, 10);
        const product = products.find(p => p.id === id);
        if (product) {
            addToCart(product);
            if (product.stock < 2) {
                Swal.fire({
                    icon: 'warning',
                    title: '¡Stock bajo!',
                    text: `Queda poco stock de ${product.name} (${product.stock} unidades)`,
                    confirmButtonColor: '#EC407A'
                });
            }
        }
    });
}
