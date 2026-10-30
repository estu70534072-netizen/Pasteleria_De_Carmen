// Lógica de la pantalla de pago: muestra el ID del pedido y guarda el comprobante.
import { db } from "./firebase.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const pedidoId = (params.get("pedido") || "").trim();

const pedidoEl = document.getElementById("pedido-id");
if (pedidoEl) {
  pedidoEl.textContent = pedidoId || "No se recibió un ID de pedido.";
}

const form = document.getElementById("form-comprobante") || document.querySelector("form");
if (form) {
  initComprobanteForm(form, pedidoId);
}

function initComprobanteForm(form, pedidoId) {
  const estado = document.createElement("div");
  estado.id = "estado-comprobante";
  estado.setAttribute("role", "status");
  estado.setAttribute("aria-live", "polite");
  estado.style.marginTop = "12px";
  estado.style.textAlign = "center";
  estado.style.fontWeight = "bold";
  form.appendChild(estado);

  const boton = form.querySelector(".btn-enviar") || form.querySelector('button[type="submit"]');

  if (!pedidoId) {
    mostrarEstado(estado, "Falta el ID del pedido. Vuelve a realizar tu pedido.", "error");
    if (boton) boton.disabled = true;
  }

  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    limpiarEstado(estado);

    const datos = {
      numeroOperacion: valor(form, "numeroOperacion"),
      fecha: valor(form, "fecha"),
      monto: valor(form, "monto"),
      titular: valor(form, "titular")
    };

    const error = validar(datos);
    if (error) {
      mostrarEstado(estado, error, "error");
      return;
    }

    if (boton) boton.disabled = true;
    mostrarEstado(estado, "Registrando tu comprobante, por favor espera...", "info");

    try {
      const comprobante = {
        pedidoId: pedidoId,
        numeroOperacion: datos.numeroOperacion,
        fecha: datos.fecha,
        monto: Number(datos.monto),
        titular: datos.titular,
        creadoEn: serverTimestamp()
      };
      await addDoc(collection(db, "comprobantes"), comprobante);
      mostrarEstado(estado, "¡Comprobante registrado! Gracias. Nos pondremos en contacto contigo.", "ok");
      form.reset();
    } catch (error) {
      console.error("Error al guardar el comprobante:", error);
      mostrarEstado(
        estado,
        "No pudimos registrar tu comprobante. Verifica tu conexión e inténtalo de nuevo.",
        "error"
      );
    } finally {
      if (boton) boton.disabled = false;
    }
  });
}

function valor(form, id) {
  const el = form.querySelector("#" + id) || document.getElementById(id);
  return el ? String(el.value || "").trim() : "";
}

function validar(d) {
  if (!d.numeroOperacion) return "El número de operación es obligatorio.";
  if (d.numeroOperacion.length > 60) return "El número de operación es demasiado largo.";
  if (!d.fecha) return "La fecha del pago es obligatoria.";
  const f = new Date(d.fecha + "T00:00:00");
  if (isNaN(f.getTime())) return "La fecha del pago no es válida.";
  if (!d.monto || isNaN(Number(d.monto)) || Number(d.monto) <= 0) return "Ingresa un monto válido mayor a cero.";
  if (!d.titular) return "El nombre del titular es obligatorio.";
  if (d.titular.length > 120) return "El nombre del titular es demasiado largo.";
  return null;
}

function mostrarEstado(contenedor, texto, tipo) {
  contenedor.textContent = texto;
  contenedor.hidden = false;
  contenedor.style.color = tipo === "error" ? "#a43a3a" : tipo === "ok" ? "#2f7a3a" : "#4a3025";
}

function limpiarEstado(contenedor) {
  contenedor.textContent = "";
  contenedor.hidden = true;
}
