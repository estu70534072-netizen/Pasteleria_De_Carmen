// Archivo central de Firebase: inicializa la app, Firestore y Auth una sola vez.
// Importa siempre la MISMA versión del SDK web por CDN (módulos ES).
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import { getAnalytics, isSupported as analyticsIsSupported } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyDpWk5dqCPsXBEwdBdtLAke4xa_lUSBQww",
  authDomain: "carmen-postres-caseros.firebaseapp.com",
  projectId: "carmen-postres-caseros",
  storageBucket: "carmen-postres-caseros.firebasestorage.app",
  messagingSenderId: "273888182852",
  appId: "1:273888182852:web:5dcb41e02552cd2ec3f211",
  measurementId: "G-24N7WR6Z4T"
};

// Evita inicializaciones duplicadas si el módulo se importa varias veces.
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

// Analytics: solo si el navegador lo soporta, dentro de try/catch para no romper la página.
let analytics = null;
(async () => {
  try {
    if (await analyticsIsSupported()) {
      analytics = getAnalytics(app);
    }
  } catch (error) {
    console.warn("Analytics no disponible en este navegador:", error);
  }
})();

export { app, db, auth, analytics };
export default app;
