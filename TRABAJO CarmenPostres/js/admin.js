import { db, auth } from "./firebase.js";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import { collection, getDocs, doc, updateDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

const ADMIN_UID = "1j5vqmzXjFaCznEHJENdigEC6k92";

const loginSection = document.getElementById("admin-login");
const panelSection = document.getElementById("admin-panel");
const loginForm = document.getElementById("form-login");
const loginEstado = document.getElementById("login-estado");
const logoutBtn = document.getElementById("btn-logout");
const pedidosCont = document.getElementById("lista-pedidos");
const compCont = document.getElementById("lista-comprobantes");
const refreshBtn = document.getElementById("btn-refresh");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("admin-email").value.trim();
    const password = document.getElementById("admin-password").value;
    limpiar(loginEstado);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error(err);
      mostrar(loginEstado, "Correo o contraseña incorrectos.", "error");
    }
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
  });
}

if (refreshBtn) {
  refreshBtn.addEventListener("click", async () => {
    await cargarTodo();
  });
}

onAuthStateChanged(auth, async (user) => {
  if (user && user.uid === ADMIN_UID) {
    if (loginSection) loginSection.style.display = "none";
    if (panelSection) panelSection.style.display = "block";
    await cargarTodo();
  } else {
    if (loginSection) loginSection.style.display = "block";
    if (panelSection) panelSection.style.display = "none";
    if (user && user.uid !== ADMIN_UID) {
      await signOut(auth);
      mostrar(loginEstado, "Esta cuenta no tiene permisos de administrador.", "error");
    }
  }
});

async function cargarTodo() {
  await Promise.all([cargarPedidos(), cargarComprobantes()]);
}

async function cargarPedidos() {
  if (!pedidosCont) return;
  pedidosCont.textContent = "Cargando pedidos...";
  try {
    const q = query(collection(db, "pedidos"), orderBy("creadoEn", "desc"));
    const snap = await getDocs(q);
    if (snap.empty) {
      pedidosCont.textContent = "No hay pedidos.";
      return;
    }
    pedidosCont.innerHTML = "";
    snap.forEach((d) => {
      const data = d.data();
      const card = document.createElement("div");
      card.className = "admin-card";
      const titulo = document.createElement("h3");
      titulo.textContent = "Pedido " + d.id;
      card.appendChild(titulo);
      const info = document.createElement("pre");
      info.style.whiteSpace = "pre-wrap";
      info.textContent = JSON.stringify(data, null, 2);
      card.appendChild(info);
      const estadoActual = document.createElement("p");
      estadoActual.textContent = "Estado actual: " + (data.estado || "pendiente");
      card.appendChild(estadoActual);
      const select = document.createElement("select");
      ["pendiente", "pagado", "entregado", "cancelado"].forEach((est) => {
        const opt = document.createElement("option");
        opt.value = est;
        opt.textContent = est;
        if (est === (data.estado || "pendiente")) opt.selected = true;
        select.appendChild(opt);
      });
      card.appendChild(select);
      const btn = document.createElement("button");
      btn.textContent = "Actualizar estado";
      btn.className = "btn-enviar";
      btn.addEventListener("click", async () => {
        try {
          await updateDoc(doc(db, "pedidos", d.id), { estado: select.value });
          estadoActual.textContent = "Estado actual: " + select.value;
          mostrar(document.getElementById("admin-estado") || loginEstado, "Estado del pedido actualizado.", "ok");
        } catch (err) {
          console.error(err);
          mostrar(document.getElementById("admin-estado") || loginEstado, "No se pudo actualizar el pedido.", "error");
        }
      });
      card.appendChild(btn);
      pedidosCont.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    pedidosCont.textContent = "Error al cargar pedidos. Verifica permisos.";
  }
}
async function cargarComprobantes() {
  if (!compCont) return;
  compCont.textContent = "Cargando comprobantes...";
  try {
    const q = query(collection(db, "comprobantes"), orderBy("creadoEn", "desc"));
    const snap = await getDocs(q);
    if (snap.empty) {
      compCont.textContent = "No hay comprobantes.";
      return;
    }
    compCont.innerHTML = "";
    snap.forEach((d) => {
      const data = d.data();
      const card = document.createElement("div");
      card.className = "admin-card";
      const titulo = document.createElement("h3");
      titulo.textContent = "Comprobante " + d.id;
      card.appendChild(titulo);
      const info = document.createElement("pre");
      info.style.whiteSpace = "pre-wrap";
      info.textContent = JSON.stringify(data, null, 2);
      card.appendChild(info);
      const select = document.createElement("select");
      ["pendiente", "revisado"].forEach((est) => {
        const opt = document.createElement("option");
        opt.value = est;
        opt.textContent = est;
        if (est === (data.estado || "pendiente")) opt.selected = true;
        select.appendChild(opt);
      });
      card.appendChild(select);
      const btn = document.createElement("button");
      btn.textContent = "Actualizar estado";
      btn.className = "btn-enviar";
      btn.addEventListener("click", async () => {
        try {
          await updateDoc(doc(db, "comprobantes", d.id), { estado: select.value });
          mostrar(document.getElementById("admin-estado") || loginEstado, "Estado del comprobante actualizado.", "ok");
        } catch (err) {
          console.error(err);
          mostrar(document.getElementById("admin-estado") || loginEstado, "No se pudo actualizar el comprobante.", "error");
        }
      });
      card.appendChild(btn);
      compCont.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    compCont.textContent = "Error al cargar comprobantes. Verifica permisos.";
  }
}

function mostrar(contenedor, texto, tipo) {
  if (!contenedor) return;
  contenedor.textContent = texto;
  contenedor.hidden = false;
  contenedor.style.color = tipo === "error" ? "#a43a3a" : tipo === "ok" ? "#2f7a3a" : "#4a3025";
}

function limpiar(contenedor) {
  if (!contenedor) return;
  contenedor.textContent = "";
  contenedor.hidden = true;
}

