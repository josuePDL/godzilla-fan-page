const URL_API = "https://script.google.com/macros/s/AKfycbxEtlbfGZXZ8lU2fvX-jsK0wwIx9mXlnl_lzyoHs0Ay24k2XKlC8f0-k4VtyvXY86qp1A/exec"; 

let peliculasGlobales = []; // Para guardar las películas y poder filtrarlas

document.addEventListener("DOMContentLoaded", () => {
    cargarPeliculas();
    
    // Escuchadores para el buscador y el filtro
    document.getElementById('buscador-input').addEventListener('input', filtrarPeliculas);
    document.getElementById('filtro-era').addEventListener('change', filtrarPeliculas);
});

async function cargarPeliculas() {
    const contenedor = document.getElementById('contenedor-peliculas');
    try {
        // En algunos entornos estrictos, fetch directo puede fallar. 
        let respuesta = await fetch(URL_API);
        let datos = await respuesta.json();
        
        peliculasGlobales = datos.filter(p => p.Visible === "SI");
        mostrarPeliculas(peliculasGlobales);
        
    } catch (error) {
        console.error("Error al cargar:", error);
        contenedor.innerHTML = "<p style='text-align:center; color:red;'>Error conectando con Monarch. Asegúrate de estar en un servidor web y no en 'file:///'</p>";
    }
}

function mostrarPeliculas(peliculasAMostrar) {
    const contenedor = document.getElementById('contenedor-peliculas');
    contenedor.innerHTML = "";

    if (peliculasAMostrar.length === 0) {
        contenedor.innerHTML = "<p style='text-align:center; width:100%;'>No se encontraron archivos clasificados.</p>";
        return;
    }

    // Clonamos y revertimos para no afectar el array original
    [...peliculasAMostrar].reverse().forEach(p => {
        // Asignamos una etiqueta de Era si existe
        let etiquetaEra = p.Era ? `<span class="categoria-tag" style="background:#f39c12; color:#fff; top:10px; left:10px;">${p.Era}</span>` : '';

        contenedor.innerHTML += `
            <div class="tarjeta-pelicula">
                ${etiquetaEra}
                <img src="${p.URL_Imagen}" alt="${p.Titulo}">
                <div class="tarjeta-info">
                    <h3>${p.Titulo}</h3>
                    <div class="meta-info"><span>Dir: ${p.Director}</span><span>Año: ${p.Año}</span></div>
                    <p>${p.Sinopsis}</p>
                    <button onclick="abrirReproductor('${p.Titulo}', '${p.URL_Pelicula}')" class="btn-ver-pelicula">
                        <i class="fa-solid fa-play"></i> Reproducir Archivo
                    </button>
                </div>
            </div>
        `;
    });
}

function filtrarPeliculas() {
    const textoBusqueda = document.getElementById('buscador-input').value.toLowerCase();
    const eraSeleccionada = document.getElementById('filtro-era').value;

    let peliculasFiltradas = peliculasGlobales.filter(p => {
        // Verifica si el texto está en el título, sinopsis o año
        const coincideTexto = p.Titulo.toLowerCase().includes(textoBusqueda) || 
                              p.Sinopsis.toLowerCase().includes(textoBusqueda) ||
                              p.Año.toString().includes(textoBusqueda);
                              
        // Verifica si coincide con la Era
        const coincideEra = (eraSeleccionada === "Todas") || (p.Era === eraSeleccionada);

        return coincideTexto && coincideEra;
    });

    mostrarPeliculas(peliculasFiltradas);
}

// Control del Reproductor
function abrirReproductor(titulo, url) {
    document.getElementById('reproductor-titulo').textContent = titulo;
    document.getElementById('video-frame').src = url;
    document.getElementById('reproductor-modal').style.display = 'flex';
}

function cerrarReproductor() {
    document.getElementById('reproductor-modal').style.display = 'none';
    document.getElementById('video-frame').src = ""; // Corta el video al cerrar
}