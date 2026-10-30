// Lógica del formulario de pedidos: valida, guarda en Firestore y redirige a pago.
import { db } from "./firebase.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

// Busca el formulario de la página (no modifica el HTML).
const form = document.querySelector("form");
if (!form) {
  // No hay formulario en esta página; nada que hacer.
} else {
  initPedidoForm(form);
}

function initPedidoForm(form) {
  // Contenedor de mensajes de estado creado en tiempo de ejecución (sin tocar el HTML).
  const estado = document.createElement("div");
  estado.id = "estado-pedido";
  estado.setAttribute("role", "status");
  estado.setAttribute("aria-live", "polite");
  estado.style.marginTop = "12px";
  estado.style.textAlign = "center";
  estado.style.fontWeight = "bold";
  form.appendChild(estado);

  const boton = form.querySelector(".btn-enviar") || form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    limpiarEstado(estado);

    const datos = leerFormulario(form);
    const errorValidacion = validar(datos);
    if (errorValidacion) {
      mostrarEstado(estado, errorValidacion, "error");
      return;
    }

    if (boton) boton.disabled = true;
    mostrarEstado(estado, "Guardando tu pedido, por favor espera...", "info");

    try {
      const pedido = {
        nombre: datos.nombre,
        correo: datos.correo,
        celular: datos.celular,
        productos: [{ nombre: datos.producto, cantidad: 1 }],
        fecha: datos.fecha,
        hora: datos.hora,
        tipoEntrega: datos.entrega,
        direccion: datos.entrega === "Delivery" ? datos.direccion : null,
        indicaciones: datos.indicaciones || null,
        total: null,
        estado: "pendiente",
        creadoEn: serverTimestamp()
      };

      const ref = await addDoc(collection(db, "pedidos"), pedido);
      mostrarEstado(estado, "¡Pedido guardado! Redirigiendo a la pantalla de pago...", "ok");
      // Pequeña espera para que el usuario vea el mensaje.
      setTimeout(() => {
        window.location.href = "pago.html?pedido=" + encodeURIComponent(ref.id);
      }, 600);
    } catch (error) {
      console.error("Error al guardar el pedido:", error);
      mostrarEstado(
        estado,
        "No pudimos guardar tu pedido. Verifica tu conexión e inténtalo de nuevo. Si el problema persiste, escríbenos a contacto@pasteleriadcarmen.pe.",
        "error"
      );
      if (boton) boton.disabled = false;
    }
  });
}

function leerFormulario(form) {
  const get = (id) => {
    const el = form.querySelector("#" + id) || document.getElementById(id);
    return el ? String(el.value || "").trim() : "";
  };
  const entregaRadio = form.querySelector('input[name="entrega"]:checked');
  return {
    nombre: get("nombre"),
    correo: get("correo"),
    celular: get("celular"),
    producto: get("producto"),
    fecha: get("fecha"),
    hora: get("hora"),
    entrega: entregaRadio ? entregaRadio.value : "Recojo en tienda",
    direccion: get("direccion"),
    indicaciones: get("indicaciones")
  };
}

function validar(d) {
  if (!d.nombre) return "El nombre completo es obligatorio.";
  if (d.nombre.length > 120) return "El nombre es demasiado largo.";
  if (!d.correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.correo)) return "Ingresa un correo electrónico válido.";
  if (!/^[0-9]{9}$/.test(d.celular)) return "El celular debe tener 9 dígitos.";
  if (!d.producto) return "Selecciona o escribe un producto.";
  if (!d.fecha) return "La fecha del pedido es obligatoria.";
  // No permitir fechas pasadas.
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const f = new Date(d.fecha + "T00:00:00");
  if (isNaN(f.getTime()) || f < hoy) return "La fecha del pedido no puede ser anterior a hoy.";
  if (!d.hora) return "La hora de entrega es obligatoria.";
  if (d.entrega === "Delivery" && !d.direccion) return "La dirección de entrega es obligatoria para delivery.";
  return null;
}

// Muestra un mensaje escapando el texto (textContent) para evitar XSS.
function mostrarEstado(contenedor, texto, tipo) {
  contenedor.textContent = texto;
  contenedor.className = "rc-mensaje rc-mensaje-" + (tipo === "ok" ? "ok" : tipo === "error" ? "error" : "info");
  contenedor.hidden = false;
  contenedor.style.color = tipo === "error" ? "#a43a3a" : tipo === "ok" ? "#2f7a3a" : "#4a3025";
}

function limpiarEstado(contenedor) {
  contenedor.textContent = "";
  contenedor.hidden = true;
}

// Pequeña ayuda de saneamiento para textos (no HTML).
function esc(texto) {
  return String(texto == null ? "" : texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
