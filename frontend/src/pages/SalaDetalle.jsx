import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

// Importamos las imágenes
import imgFragmentado from '../assets/fragmentado.jpg';
import imgConexion from '../assets/conexion.jpg';
import imgAcertijo from '../assets/acertijo.jpg';

// Mock de base de datos ajustado a tus reglas de negocio
const salasInfo = {
  'fragmentado': {
    nombre: 'Fragmentado',
    imagen: imgFragmentado,
    descripcion: 'Los participantes están separados por un espejo, pero comparten el mismo espacio visual. Cada lado tiene acceso a pistas que el otro no puede ver. La colaboración y comunicación serán indispensables para reunir las piezas y resolver el misterio.',
    dificultad: 'Alta',
    duracion: '60 minutos',
    capacidad: '2, 4 o 6 personas (Solo grupos pares)',
    precio: 'Según tarifario (varía por cantidad de personas)'
  },
  'conexion-perdida': {
    nombre: 'Conexión Perdida',
    imagen: imgConexion,
    descripcion: 'Los participantes no pueden verse y necesitan comunicarse para compartir pistas e información, simulando una comunicación por walkie-talkie. Solo hablando y conectando las pistas de ambos espacios podrán escapar.',
    dificultad: 'Media',
    duracion: '60 minutos',
    capacidad: '2 a 6 personas',
    precio: 'Según tarifario (varía por cantidad de personas)'
  },
  'el-acertijo': {
    nombre: 'El Acertijo',
    imagen: imgAcertijo,
    descripcion: 'Una experiencia de misterio clásico con acertijos y una ambientación inspirada en un villano enmascarado. Podés enfrentar el desafío en solitario o reunir a tu equipo para desactivar la amenaza.',
    dificultad: 'Alta',
    duracion: '60 minutos',
    capacidad: '1 a 6 personas',
    precio: 'Según tarifario (varía por cantidad de personas)'
  }
};

const SalaDetalle = () => {
  const { id } = useParams();
  const sala = salasInfo[id];

  // Magia para que la página siempre empiece arriba de todo
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Validación: Sala no encontrada
  if (!sala) {
    return (
      <div className="container py-5 mt-5 text-center">
        <h2 className="display-5 fw-bold text-danger mb-4">Sala no encontrada</h2>
        <p className="lead">La sala que estás buscando no existe o el enlace es incorrecto.</p>
        <Link to="/" className="btn btn-dark mt-4 fw-bold">Volver al inicio</Link>
      </div>
    );
  }

  // Renderizado de la sala dinámica (Ajustado para pantalla única)
  return (
    <div className="container py-4 mt-2">
      <div className="row align-items-center">
        
        {/* Imagen: Redujimos la altura de 500px a 380px para que ocupe menos espacio vertical */}
        <div className="col-md-6 mb-3 mb-md-0">
          <img 
            src={sala.imagen} 
            alt={sala.nombre} 
            className="img-fluid rounded shadow-lg w-100" 
            style={{ maxHeight: '380px', objectFit: 'cover' }}
          />
        </div>
        
        {/* Detalles: Cambiamos display-4 por display-5, y achicamos los márgenes (mb) */}
        <div className="col-md-6">
          <h2 className="display-5 fw-bold mb-2">{sala.nombre}</h2>
          <p className="lead text-muted mb-3" style={{ fontSize: '1.1rem' }}>{sala.descripcion}</p>
          
          <ul className="list-group list-group-flush mb-4">
            <li className="list-group-item bg-transparent px-0 py-1">
              <strong>Dificultad:</strong> {sala.dificultad}
            </li>
            <li className="list-group-item bg-transparent px-0 py-1">
              <strong>Duración:</strong> {sala.duracion}
            </li>
            <li className="list-group-item bg-transparent px-0 py-1">
              <strong>Capacidad permitida:</strong> {sala.capacidad}
            </li>
            <li className="list-group-item bg-transparent px-0 py-1 text-primary">
              <strong>Precio total:</strong> {sala.precio}
            </li>
          </ul>

          <div className="d-flex flex-column flex-sm-row gap-2">
            <Link to={`/reserva/${id}`} className="btn btn-danger btn-lg fw-bold w-100">
              Reservar esta sala
            </Link>
            <Link to="/" className="btn btn-outline-dark btn-lg fw-bold w-100">
              Volver al inicio
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SalaDetalle;