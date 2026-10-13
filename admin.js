const URL_API = "https://script.google.com/macros/s/AKfycbxEtlbfGZXZ8lU2fvX-jsK0wwIx9mXlnl_lzyoHs0Ay24k2XKlC8f0-k4VtyvXY86qp1A/exec"; 


let claveAcceso = null;
let peliculasGlobales = [];

function verificarLogin(e) {
    e.preventDefault();
    claveAcceso = document.getElementById('input-password').value;
    document.getElementById('login-seccion').style.display = 'none';
    document.getElementById('panel-seccion').style.display = 'block';
    cargarTablaAdmin();
}

async function cargarTablaAdmin() {
    const tabla = document.getElementById('tabla-registros');
    tabla.innerHTML = "<p>Cargando registros...</p>";
    try {
        let respuesta = await fetch(URL_API);
        peliculasGlobales = await respuesta.json();
        tabla.innerHTML = "";
        
        peliculasGlobales.reverse().forEach(p => {
            let claseOculto = p.Visible === "NO" ? "oculto" : "";
            let textoOculto = p.Visible === "NO" ? "Mostrar" : "Ocultar";

            tabla.innerHTML += `
                <div class="admin-item ${claseOculto}">
                    <div>
                        <strong>${p.Titulo} (${p.Año})</strong><br>
                        <small style="color:#aaa;">Era: ${p.Era || 'Sin definir'} | Estado: ${p.Visible === "NO" ? "Oculto" : "Público"}</small>
                    </div>
                    <div class="acciones">
                        <button class="btn-edit" onclick="cargarEdicion(${p.ID})"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-hide" onclick="cambiarVisibilidad(${p.ID})">${textoOculto}</button>
                        <button class="btn-delete" onclick="eliminarPelicula(${p.ID})"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        tabla.innerHTML = "<p style='color:red;'>Error de conexión.</p>";
    }
}

async function guardarPelicula(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-submit');
    btn.textContent = "Procesando...";
    
    let idPelicula = document.getElementById('pel-id').value;
    let accion = idPelicula ? 'editarPelicula' : 'agregarPelicula';

    const payload = {
        accion: accion,
        id: idPelicula,
        payload: {
            titulo: document.getElementById('pel-titulo').value,
            ano: document.getElementById('pel-ano').value,
            era: document.getElementById('pel-era').value, // El nuevo campo
            director: document.getElementById('pel-director').value,
            sinopsis: document.getElementById('pel-sinopsis').value,
            imagen: document.getElementById('pel-img').value,
            urlPelicula: document.getElementById('pel-url').value 
        }
    };

    await enviarPeticion(payload);
    limpiarFormulario();
}

function cargarEdicion(id) {
    let p = peliculasGlobales.find(pel => pel.ID.toString() === id.toString());
    if(p) {
        document.getElementById('form-titulo').textContent = "Editando: " + p.Titulo;
        document.getElementById('pel-id').value = p.ID;
        document.getElementById('pel-titulo').value = p.Titulo;
        document.getElementById('pel-ano').value = p.Año;
        
        // Manejo de la Era por si algún registro viejo no la tiene
        document.getElementById('pel-era').value = p.Era || ""; 
        
        document.getElementById('pel-director').value = p.Director;
        document.getElementById('pel-sinopsis').value = p.Sinopsis;
        document.getElementById('pel-img').value = p.URL_Imagen;
        document.getElementById('pel-url').value = p.URL_Pelicula;
        document.getElementById('btn-submit').textContent = "Actualizar Película";
        document.getElementById('btn-cancelar').style.display = 'block';
        
        window.scrollTo(0, 0); // Sube al principio para ver el formulario
    }
}

function limpiarFormulario() {
    document.getElementById('form-titulo').textContent = "Subir Nueva Película";
    document.getElementById('pel-id').value = "";
    document.querySelector('form').reset();
    document.getElementById('btn-submit').textContent = "Guardar en Base de Datos";
    document.getElementById('btn-cancelar').style.display = 'none';
}

function cambiarVisibilidad(id) {
    enviarPeticion({ accion: 'cambiarVisibilidad', id: id });
}

function eliminarPelicula(id) {
    if(confirm("¿Seguro que quieres eliminar este archivo permanentemente?")) {
        enviarPeticion({ accion: 'eliminarPelicula', id: id });
    }
}

async function enviarPeticion(payload) {
    if(!claveAcceso) { mostrarToast("No tienes permiso"); return; }
    payload.password = claveAcceso; 
    
    mostrarToast("Transmitiendo datos...");
    
    try {
        await fetch(URL_API, { 
            method: 'POST', 
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(payload) 
        });
        
        mostrarToast("¡Registro procesado en Monarch!");
        setTimeout(() => cargarTablaAdmin(), 1500); 
        
    } catch (error) {
        mostrarToast("Error de conexión con la Red.");
        console.error(error);
    }
}

function mostrarToast(mensaje) {
    const toast = document.getElementById("toast");
    toast.textContent = mensaje;
    toast.className = "toast mostrar";
    setTimeout(() => { toast.className = toast.className.replace("mostrar", ""); }, 3000);
}