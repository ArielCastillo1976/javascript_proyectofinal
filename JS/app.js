class Servicio {
    constructor(nombre, descripcion, precio) {
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.precio = parseFloat(precio);
    }
}

const servicios = [
    new Servicio("Chequeo General", "Consulta médica completa, presión, peso, historial clínico", 4500),
    new Servicio("Análisis de Sangre", "Perfil lipídico, glucosa, hemograma completo", 6200),
    new Servicio("Control Pediátrico", "Consulta para menores de edad, incluye vacunación (si aplica)", 5000),
    new Servicio("Evaluación Ginecológica", "Papanicolau, examen mamario, consulta general", 7200),
    new Servicio("Tomografía Computada", "Estudio por imágenes de alta precisión", 18000),
    new Servicio("Colonoscopía Virtual", "Estudio no invasivo del colon con imágenes 3D", 21000),
    new Servicio("Hemodinamia", "Diagnóstico y tratamiento de enfermedades cardiovasculares", 32000)
];

const contenedor = document.getElementById("contenedorProductos");
const listaCarrito = document.getElementById("listaCarrito");
const totalDisplay = document.getElementById("total");
const botonVaciar = document.getElementById("vaciar");

let carrito = [];

if (localStorage.getItem("carrito")) {
    carrito = JSON.parse(localStorage.getItem("carrito"));
    renderizarCarrito();
}

servicios.forEach((servicio, index) => {
    const card = document.createElement("div");
    card.classList.add("producto");
    card.innerHTML = `
        <h3>${servicio.nombre}</h3>
        <p>${servicio.descripcion}</p>
        <p><strong>$${servicio.precio.toLocaleString("es-AR")}</strong></p>
        <button data-index="${index}">Agregar</button>
    `;
    contenedor.appendChild(card);
});

contenedor.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
        const index = e.target.getAttribute("data-index");
        const servicio = servicios[index];
        carrito.push(servicio);
        actualizarStorage();
        renderizarCarrito();

        const card = e.target.closest(".producto");
        card.classList.add("agregado");
        setTimeout(() => card.classList.remove("agregado"), 600);
    }
});

botonVaciar.addEventListener("click", () => {
    carrito = [];
    actualizarStorage();
    renderizarCarrito();
});

function renderizarCarrito() {
    listaCarrito.innerHTML = "";
    let total = 0;

    carrito.forEach((item, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            ${item.nombre} - $${item.precio.toLocaleString("es-AR")}
            <button class="eliminar" data-index="${index}">❌</button>
        `;
        listaCarrito.appendChild(li);
        total += item.precio;
    });

    totalDisplay.textContent = `Total: $${total.toLocaleString("es-AR")}`;
}

listaCarrito.addEventListener("click", (e) => {
    if (e.target.classList.contains("eliminar")) {
        const index = e.target.dataset.index;
        carrito.splice(index, 1);
        actualizarStorage();
        renderizarCarrito();
    }
});

function actualizarStorage() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

async function enviarCarritoAlServidor() {
    try {
        Swal.fire({
            title: "Enviando solicitud...",
            text: "Por favor espera",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ carrito, fecha: new Date().toISOString() })
        });

        if (!response.ok) throw new Error("Error en la solicitud");

        Swal.fire({
            icon: "success",
            title: "¡Solicitud enviada!",
            text: "Gracias por elegirnos",
            timer: 2000,
            showConfirmButton: false
        });

        carrito = [];
        actualizarStorage();
        renderizarCarrito();
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo enviar la solicitud. Intenta de nuevo."
        });
        console.error("❌ Error:", error);
    }
}

document.getElementById("finalizarCompra").addEventListener("click", () => {
    if (carrito.length === 0) {
        Swal.fire({
            icon: "info",
            title: "Carrito vacío",
            text: "Agrega al menos un servicio antes de continuar"
        });
    } else {
        enviarCarritoAlServidor();
    }
});
