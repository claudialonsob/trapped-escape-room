import React from 'react';

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top py-3">
      <div className="container d-flex flex-column">

        {/* Título arriba, centrado */}
        <a className="navbar-brand fw-bold navbar-brand-title mx-auto mb-2" href="#inicio">
          Trapped Escape Room
        </a>

        {/* Botón hamburguesa */}
        <button
          className="navbar-toggler align-self-center mb-2"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Abrir o cerrar menú de navegación"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Enlaces centrados */}
        <div className="collapse navbar-collapse justify-content-center w-100" id="navbarNav">
          <ul className="navbar-nav text-center">
            <li className="nav-item mx-2">
              <a className="nav-link active" href="#inicio">Inicio</a>
            </li>
            <li className="nav-item mx-2">
              <a className="nav-link" href="#nosotros">Nosotros</a>
            </li>
            <li className="nav-item mx-2">
              <a className="nav-link" href="#salas">Salas</a>
            </li>
            <li className="nav-item mx-2">
              <a className="nav-link" href="#contacto">Contacto</a>
            </li>
          </ul>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;