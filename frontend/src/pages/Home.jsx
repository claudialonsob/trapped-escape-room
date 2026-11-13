import React from 'react';
import { Link } from 'react-router-dom';
import imgPrincipal from '../assets/principal.jpg';
import imgFragmentado from '../assets/fragmentado.jpg';
import imgConexion from '../assets/conexion.jpg';
import imgAcertijo from '../assets/acertijo.jpg';

const Home = () => {
  return (
    <main>
      {/* Sección Inicio (Hero) */}
      <section id="inicio" className="bg-dark text-white text-center pt-5 pb-5">
        <div className="container pt-5">
          <h1 className="display-4 fw-bold">¿Podrás resolver el misterio?</h1>
          <p className="lead mt-3">
            Una experiencia diferente te está esperando.
          </p>
        </div>

        {/* Imagen principal: Fuera del "container" para que ocupe todo el ancho de la página */}
        <img 
          src={imgPrincipal} 
          alt="Trapped Escape Room" 
          className="w-100 d-block my-4 shadow-lg" 
          style={{ maxHeight: '450px', objectFit: 'cover' }} 
        />

        <div className="container">
          <a href="#salas" className="btn btn-danger btn-lg fw-bold">
            Conoce nuestras salas
          </a>
        </div>
      </section>

      {/* Sección Nosotros */}
      <section id="nosotros" className="py-5 bg-white">
        <div className="container text-center">
          <h2 className="fw-bold mb-4">Nosotros</h2>
          <p className="lead text-muted mx-auto" style={{ maxWidth: '800px' }}>
            En Trapped Escape Room diseñamos experiencias inmersivas que pondrán a prueba tu ingenio, 
            trabajo en equipo y capacidad de comunicación. Cada sala es un universo diferente 
            donde cada segundo cuenta. ¿Estás listo para el desafío?
          </p>
        </div>
      </section>

      {/* Sección Catálogo de Salas */}
      <section id="salas" className="py-5 bg-light">
        <div className="container">
          <h2 className="text-center fw-bold mb-5">Nuestras Salas</h2>
          
          <div className="row g-4">
            {/* Sala 1: Fragmentado */}
            <div className="col-md-4">
              <div className="card h-100 shadow-sm border-0">
                <img 
                  src={imgFragmentado} 
                  className="card-img-top" 
                  alt="Sala Fragmentado" 
                  style={{ height: '220px', objectFit: 'cover' }} 
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title fw-bold">Fragmentado</h5>
                  <p className="card-text text-muted">
                    Los participantes están separados por un espejo y deben colaborar para resolver los acertijos.
                  </p>
                  <Link className="..." to="/sala/fragmentado">Ver detalles</Link>
                </div>
              </div>
            </div>

            {/* Sala 2: Conexión Perdida */}
            <div className="col-md-4">
              <div className="card h-100 shadow-sm border-0">
                <img 
                  src={imgConexion} 
                  className="card-img-top" 
                  alt="Sala Conexión Perdida" 
                  style={{ height: '220px', objectFit: 'cover' }} 
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title fw-bold">Conexión Perdida</h5>
                  <p className="card-text text-muted">
                    Los participantes no pueden verse y necesitan comunicarse para compartir pistas e información.
                  </p>
                  <Link className="..." to="/sala/conexion-perdida">Ver detalles</Link>
                </div>
              </div>
            </div>

            {/* Sala 3: El Acertijo */}
            <div className="col-md-4">
              <div className="card h-100 shadow-sm border-0">
                <img 
                  src={imgAcertijo} 
                  className="card-img-top" 
                  alt="Sala El Acertijo" 
                  style={{ height: '220px', objectFit: 'cover' }} 
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title fw-bold">El Acertijo</h5>
                  <p className="card-text text-muted">
                    Una experiencia de misterio con acertijos y una ambientación inspirada en un villano enmascarado.
                  </p>
                  <Link className="..." to="/sala/el-acertijo">
                    Ver detalles
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección Contacto */}
      <section id="contacto" className="py-5 bg-dark text-white">
        <div className="container text-center">
          <h2 className="fw-bold mb-4">Contacto</h2>
          <p className="mb-1">📍 Ubicación: Av. Ficticia 1234, Ciudad</p>
          <p className="mb-1">📧 Email: info@trappedescaperoom.com</p>
          <p className="mb-0">📞 Teléfono: +54 9 11 1234-5678</p>
        </div>
      </section>
    </main>
  );
};

export default Home;