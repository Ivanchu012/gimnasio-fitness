import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, set, push, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Tu configuración de Firebase (reemplaza con la tuya)
const firebaseConfig = {
  apiKey: "AIzaSyBoc1H3z6v0oIbxy7ZJd5tiwlYdLUWpsTI",
  authDomain: "proyecto-fit-ffd45.firebaseapp.com",
  databaseURL: "https://proyecto-fit-ffd45-default-rtdb.firebaseio.com",
  projectId: "proyecto-fit-ffd45",
  storageBucket: "proyecto-fit-ffd45.appspot.com",
  messagingSenderId: "334327777255",
  appId: "1:334327777255:web:c644d7815b9902ddfedf42"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

function registrar() {
  const nombre = document.getElementById('nombre').value;
  const email = document.getElementById('email').value;
  const clave = document.getElementById('password').value;

  createUserWithEmailAndPassword(auth, email, clave)
    .then((userCred) => {
      const user = userCred.user;
      return set(ref(database, 'usuarios/' + user.uid), {
        email: user.email,
        nombre: nombre
      });
    })
    .then(() => {
      alert("Registro exitoso");
      window.location.href = "index.html";
    })
    .catch((e) => {
      alert("Error al registrar: " + e.message);
    });
}

function login() {
  const email = document.getElementById('email').value;
  const clave = document.getElementById('password').value;

  signInWithEmailAndPassword(auth, email, clave)
    .then((userCred) => {
      sessionStorage.setItem('usuarioID', userCred.user.uid);
      alert("Inicio de sesión exitoso");
      window.location.href = "home.html";
    })
    .catch((e) => {
      alert("Error al iniciar sesión: " + e.message);
    });
}

function logout() {
  signOut(auth).then(() => {
    sessionStorage.removeItem('usuarioID');
    window.location.href = "index.html";
  });
}

const clasesDisponibles = [
  { nombre: "Zumba", dias: "Lunes y Miércoles", horario: "18:00" },
  { nombre: "Crossfit", dias: "Martes y Jueves", horario: "19:00" },
  { nombre: "Yoga", dias: "Viernes", horario: "17:00" }
];

function cargarClases() {
  const uid = sessionStorage.getItem('usuarioID');
  if (!uid) {
    window.location.href = "index.html";
    return;
  }

  const usuarioRef = ref(database, 'usuarios/' + uid);
  get(usuarioRef).then(snapshot => {
    if (snapshot.exists()) {
      const datos = snapshot.val();
      // Mostrar nombre o email
      document.getElementById('nombreUsuario').textContent = datos.nombre || datos.email || "Usuario";
    } else {
      document.getElementById('nombreUsuario').textContent = "Usuario";
    }
  }).catch(() => {
    document.getElementById('nombreUsuario').textContent = "Usuario";
  });

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
}

function reservarClase(index) {
  const uid = sessionStorage.getItem('usuarioID');
  const clase = clasesDisponibles[index];
  const datos = {
    nombre: clase.nombre,
    dias: clase.dias,
    horario: clase.horario,
    fechaReserva: new Date().toISOString()
  };
  push(ref(database, 'usuarios/' + uid + '/reservas'), datos)
    .then(() => {
      alert("Clase reservada con éxito");
      mostrarReservas();
    });
}

function mostrarReservas() {
  const uid = sessionStorage.getItem('usuarioID');
  const lista = document.getElementById('misReservas');
  if (!lista) return;
  lista.innerHTML = "";
  get(ref(database, 'usuarios/' + uid + '/reservas'))
    .then(snapshot => {
      if (snapshot.exists()) {
        Object.values(snapshot.val()).forEach(r => {
          const li = document.createElement('li');
          li.textContent = `${r.nombre} - ${r.dias} a las ${r.horario}`;
          lista.appendChild(li);
        });
      } else {
        lista.innerHTML = "<li>No tenés reservas aún</li>";
      }
    });
}

function guardarNuevoNombre() {
  const uid = sessionStorage.getItem('usuarioID');
  const nuevoNombre = document.getElementById('nuevoNombre').value;
  set(ref(database, 'usuarios/' + uid + '/nombre'), nuevoNombre)
    .then(() => {
      alert("Nombre actualizado");
      window.location.href = "home.html";
    });
}

// Registrar eventos al cargar página
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) loginForm.addEventListener("submit", e => { e.preventDefault(); login(); });

  const registroForm = document.getElementById("registroForm");
  if (registroForm) registroForm.addEventListener("submit", e => { e.preventDefault(); registrar(); });

  const editarForm = document.getElementById("editarForm");
  if (editarForm) editarForm.addEventListener("submit", e => { e.preventDefault(); guardarNuevoNombre(); });
});

// Exponer funciones globales para HTML
window.cargarClases = cargarClases;
window.logout = logout;
window.reservarClase = reservarClase;
