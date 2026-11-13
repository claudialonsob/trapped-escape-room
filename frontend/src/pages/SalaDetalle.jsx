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

  // Para que la página siempre empiece arriba de todo
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

  // Renderizado de la sala dinámica (Quitamos min-vh-100 a pedido de Chat)
  return (
    <div className="container py-5 mt-4">
      <div className="row align-items-center mb-5">
        
        {/* Imagen */}
        <div className="col-md-6 mb-4 mb-md-0">
          <img 
            src={sala.imagen} 
            alt={sala.nombre} 
            className="img-fluid rounded shadow-lg w-100" 
            style={{ maxHeight: '500px', objectFit: 'cover' }}
          />
        </div>
        
        {/* Detalles */}
        <div className="col-md-6">
          <h2 className="display-4 fw-bold mb-3">{sala.nombre}</h2>
          <p className="lead text-muted mb-4">{sala.descripcion}</p>
          
          <ul className="list-group list-group-flush mb-5">
            <li className="list-group-item bg-transparent px-0">
              <strong>Dificultad:</strong> {sala.dificultad}
            </li>
            <li className="list-group-item bg-transparent px-0">
              <strong>Duración:</strong> {sala.duracion}
            </li>
            <li className="list-group-item bg-transparent px-0">
              <strong>Capacidad permitida:</strong> {sala.capacidad}
            </li>
            <li className="list-group-item bg-transparent px-0 text-primary">
              <strong>Precio total:</strong> {sala.precio}
            </li>
          </ul>

          <div className="d-flex flex-column flex-sm-row gap-3">
            {/* Botón provisorio, luego lo conectaremos al formulario */}
            <button className="btn btn-danger btn-lg fw-bold w-100">
              Reservar esta sala
            </button>
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