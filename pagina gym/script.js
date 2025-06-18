import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, set, push, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBoc1H3z6v0oIbxy7ZJd5tiwlYdLUWpsTI",
  authDomain: "proyecto-fit-ffd45.firebaseapp.com",
  databaseURL: "https://proyecto-fit-ffd45-default-rtdb.firebaseio.com",
  projectId: "proyecto-fit-ffd45",
  storageBucket: "proyecto-fit-ffd45.appspot.com",
  messagingSenderId: "334327777255",
  appId: "1:334327777255:web:c644d7815b9902ddfedf42",
  measurementId: "G-N2QTCJGR56"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

window.registrar = () => {
  const email = document.getElementById('email').value;
  const clave = document.getElementById('password').value;
  createUserWithEmailAndPassword(auth, email, clave)
    .then(userCred => {
      const user = userCred.user;
      set(ref(database, 'usuarios/' + user.uid), { email: user.email });
      alert("Registro exitoso");
      window.location.href = "index.html";
    })
    .catch(e => alert("Error: " + e.message));
};

window.login = () => {
  const email = document.getElementById('email').value;
  const clave = document.getElementById('password').value;
  signInWithEmailAndPassword(auth, email, clave)
    .then(userCred => {
      sessionStorage.setItem('usuarioID', userCred.user.uid);
      window.location.href = "home.html";
    })
    .catch(e => alert("Error: " + e.message));
};

window.logout = () => {
  signOut(auth).then(() => {
    sessionStorage.removeItem('usuarioID');
    window.location.href = "index.html";
  }).catch(() => alert("No se pudo cerrar sesión"));
};

const clasesDisponibles = [
  { nombre: "Zumba", dias: "Lunes y Miércoles", horario: "18:00" },
  { nombre: "Crossfit", dias: "Martes y Jueves", horario: "19:00" },
  { nombre: "Yoga", dias: "Viernes", horario: "17:00" }
];

window.cargarClases = () => {
  const uid = sessionStorage.getItem('usuarioID');
  if (!uid) { window.location.href = "index.html"; return; }
  document.getElementById('nombreUsuario').textContent = uid;
  const contenedor = document.getElementById('clases');
  contenedor.innerHTML = "";
  clasesDisponibles.forEach((c, i) => {
    contenedor.innerHTML += `
      <div>
        <strong>${c.nombre}</strong><br>Días: ${c.dias}<br>Horario: ${c.horario}
        <button onclick="reservarClase(${i})">Reservar</button>
      </div><br>`;
  });
  mostrarReservas();
};

window.reservarClase = index => {
  const uid = sessionStorage.getItem('usuarioID');
  if (!uid) { alert("Logueate"); window.location.href = "index.html"; return; }
  const c = clasesDisponibles[index];
  const datos = { nombre: c.nombre, dias: c.dias, horario: c.horario, fechaReserva: new Date().toISOString() };
  push(ref(database, `usuarios/${uid}/reservas`), datos)
    .then(() => { alert("Clase reservada"); mostrarReservas(); })
    .catch(() => alert("No se pudo reservar"));
};

window.mostrarReservas = () => {
  const uid = sessionStorage.getItem('usuarioID');
  if (!uid) return;
  get(ref(database, `usuarios/${uid}/reservas`))
    .then(snap => {
      const lista = document.getElementById('misReservas');
      lista.innerHTML = "";
      if (snap.exists()) Object.values(snap.val()).forEach(r => {
        const li = document.createElement('li');
        li.textContent = `${r.nombre} - ${r.dias} a las ${r.horario}`;
        lista.appendChild(li);
      });
      else lista.innerHTML = "<li>No tenés reservas aún</li>";
    })
    .catch(console.error);
};

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) loginForm.addEventListener("submit", e => { e.preventDefault(); login(); });

  const registroForm = document.getElementById("registroForm");
  if (registroForm) registroForm.addEventListener("submit", e => { e.preventDefault(); registrar(); });
});
