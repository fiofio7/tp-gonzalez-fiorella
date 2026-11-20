const API_URL = 'https://rickandmortyapi.com/api/character';
const STORAGE_KEY = 'ultima_busqueda_rm';

const form = document.querySelector('#form-busqueda');
const inputNombre = document.querySelector('#input-nombre');
const selectEstado = document.querySelector('#select-estado');
const btnBuscar = document.querySelector('#btn-buscar');
const mensajeEstado = document.querySelector('#mensaje-estado');
const grillaResultados = document.querySelector('#grilla-resultados');

const formatearValor = (valor) => {
  if (!valor || valor.trim() === '' || valor.toLowerCase() === 'unknown') {
    return 'Desconocido';
  }
  return valor;
};

const traducirEstado = (estado) => {
  const mapa = {
    Alive: 'Vivo',
    Dead: 'Muerto',
    unknown: 'Desconocido',
  };
  return mapa[estado] || formatearValor(estado);
};

const mostrarMensaje = (texto) => {
  mensajeEstado.textContent = texto;
};

const crearTarjeta = (personaje) => {
  const article = document.createElement('article');
  article.className = 'tarjeta';

  const img = document.createElement('img');
  img.src = personaje.image;
  img.alt = `Imagen de ${formatearValor(personaje.name)}`;
  img.loading = 'lazy';

  const cuerpo = document.createElement('div');
  cuerpo.className = 'tarjeta-cuerpo';

  const titulo = document.createElement('h2');
  titulo.textContent = formatearValor(personaje.name);

  const estado = document.createElement('p');
  estado.textContent = `Estado: ${traducirEstado(personaje.status)}`;

  const especie = document.createElement('p');
  especie.textContent = `Especie: ${formatearValor(personaje.species)}`;

  const origen = document.createElement('p');
  origen.textContent = `Origen: ${formatearValor(personaje.origin?.name)}`;

  cuerpo.append(titulo, estado, especie, origen);
  article.append(img, cuerpo);
  return article;
};

const renderizarTarjetas = (personajes) => {
  grillaResultados.replaceChildren();
  const fragmento = document.createDocumentFragment();
  personajes.forEach((personaje) => {
    fragmento.appendChild(crearTarjeta(personaje));
  });
  grillaResultados.appendChild(fragmento);
};

const pedirPersonajes = async (nombre, estado) => {
  const url = new URL(API_URL);
  if (nombre) url.searchParams.set('name', nombre);
  if (estado) url.searchParams.set('status', estado);

  const respuesta = await fetch(url);
  if (respuesta.status === 404) {
    return null;
  }
  if (!respuesta.ok) {
    throw new Error(`Error HTTP: ${respuesta.status}`);
  }
  const datos = await respuesta.json();
  return datos.results;
};

const ejecutarBusqueda = async (nombre, estado) => {
  btnBuscar.disabled = true;
  grillaResultados.replaceChildren();
  mostrarMensaje('Buscando...');

  try {
    const resultados = await pedirPersonajes(nombre, estado);
    if (!resultados || resultados.length === 0) {
      mostrarMensaje('Sin resultados para los criterios ingresados.');
      return;
    }
    renderizarTarjetas(resultados);
    mostrarMensaje(`Se encontraron ${resultados.length} personaje(s).`);
  } catch (error) {
    mostrarMensaje('Ocurrió un error al consultar la API. Revisa tu conexión e intenta de nuevo.');
  } finally {
    btnBuscar.disabled = false;
  }
};

const guardarBusqueda = (nombre, estado) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ nombre, estado }));
};

const cargarUltimaBusqueda = () => {
  const guardado = localStorage.getItem(STORAGE_KEY);
  if (!guardado) return;

  const { nombre, estado } = JSON.parse(guardado);
  inputNombre.value = nombre || '';
  selectEstado.value = estado || '';

  if (nombre || estado) {
    ejecutarBusqueda(nombre, estado);
  }
};

form.addEventListener('submit', (evento) => {
  evento.preventDefault();
  const nombre = inputNombre.value.trim();
  const estado = selectEstado.value;

  if (!nombre && !estado) {
    grillaResultados.replaceChildren();
    mostrarMensaje('Ingresa un nombre o elige un estado para buscar.');
    return;
  }

  guardarBusqueda(nombre, estado);
  ejecutarBusqueda(nombre, estado);
});

document.addEventListener('DOMContentLoaded', cargarUltimaBusqueda);