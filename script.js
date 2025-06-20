// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, set, push, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Configuración de Firebase
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

// Registro
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

// Login
function login() {
  const email = document.getElementById('email').value;
  const clave = document.getElementById('password').value;

  signInWithEmailAndPassword(auth, email, clave)
    .then((userCred) => {
      const uid = userCred.user.uid;
      sessionStorage.setItem('usuarioID', uid);
      alert("Inicio de sesión exitoso");
      window.location.href = "home.html";
    })
    .catch((e) => {
      alert("Error al iniciar sesión: " + e.message);
    });
}

// Logout
function logout() {
  signOut(auth).then(() => {
    sessionStorage.removeItem('usuarioID');
    window.location.href = "index.html";
  });
}

// Clases disponibles
const clasesDisponibles = [
  { nombre: "Zumba", dias: "Lunes y Miércoles", horario: "18:00" },
  { nombre: "Crossfit", dias: "Martes y Jueves", horario: "19:00" },
  { nombre: "Yoga", dias: "Viernes", horario: "17:00" }
];

// Mostrar clases y usuario
function cargarClases() {
  const uid = sessionStorage.getItem('usuarioID');
  if (!uid) {
    window.location.href = "index.html";
    return;
  }

  // Obtener nombre desde Firebase
  const usuarioRef = ref(database, 'usuarios/' + uid);
  get(usuarioRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const datos = snapshot.val();
        document.getElementById('nombreUsuario').textContent = datos.nombre || datos.email;
      } else {
        document.getElementById('nombreUsuario').textContent = "Usuario";
      }
    })
    .catch((error) => {
      console.error("Error al obtener datos del usuario:", error);
      document.getElementById('nombreUsuario').textContent = "Usuario";
    });
  console.log("Datos del usuario:", datos);

  // Mostrar clases
  const contenedor = document.getElementById('clases');
  contenedor.innerHTML = "";
  clasesDisponibles.forEach((clase, index) => {
    contenedor.innerHTML += `
      <div>
        <strong>${clase.nombre}</strong><br>
        Días: ${clase.dias}<br>
        Horario: ${clase.horario}<br>
        <button onclick="reservarClase(${index})">Reservar</button>
      </div><br>
    `;
  });

  mostrarReservas();
}

// Reservar clase
function reservarClase(index) {
  const uid = sessionStorage.getItem('usuarioID');
  if (!uid) return;

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

// Mostrar reservas
function mostrarReservas() {
  const uid = sessionStorage.getItem('usuarioID');
  if (!uid) return;

  const lista = document.getElementById('misReservas');
  if (!lista) return;
  lista.innerHTML = "";

  const reservasRef = ref(database, 'usuarios/' + uid + '/reservas');
  get(reservasRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const reservas = snapshot.val();
        Object.values(reservas).forEach((r) => {
          const li = document.createElement('li');
          li.textContent = `${r.nombre} - ${r.dias} a las ${r.horario}`;
          lista.appendChild(li);
        });
      } else {
        lista.innerHTML = "<li>No tenés reservas aún</li>";
      }
    })
    .catch((error) => {
      console.error("Error al mostrar reservas:", error);
      lista.innerHTML = "<li>Error al obtener reservas</li>";
    });
}

// Guardar nuevo nombre (editar.html)
function guardarNuevoNombre() {
  const uid = sessionStorage.getItem('usuarioID');
  if (!uid) {
    alert("No hay sesión activa.");
    window.location.href = "index.html";
    return;
  }

  const nuevoNombre = document.getElementById('nuevoNombre').value;
  if (!nuevoNombre) {
    alert("Por favor escribí un nuevo nombre.");
    return;
  }

  set(ref(database, 'usuarios/' + uid + '/nombre'), nuevoNombre)
    .then(() => {
      alert("Nombre actualizado correctamente");
      window.location.href = "home.html";
    })
    .catch((error) => {
      alert("Error al actualizar nombre: " + error.message);
    });
}

// Eventos al cargar página
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) loginForm.addEventListener("submit", e => { e.preventDefault(); login(); });

  const registroForm = document.getElementById("registroForm");
  if (registroForm) registroForm.addEventListener("submit", e => { e.preventDefault(); registrar(); });

  const editarForm = document.getElementById("editarForm");
  if (editarForm) editarForm.addEventListener("submit", e => { e.preventDefault(); guardarNuevoNombre(); });
});

// Exportar funciones globales
window.cargarClases = cargarClases;
window.logout = logout;
window.reservarClase = reservarClase;
// Ejecutar automáticamente si estás en home.html
if (window.location.pathname.includes("home.html")) {
  cargarClases();
}
