import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top py-3">
      <div className="container d-flex flex-column">

        {/* Título */}
        <Link
          className="navbar-brand fw-bold navbar-brand-title mx-auto mb-2"
          to="/#inicio"
        >
          Trapped Escape Room
        </Link>

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

        {/* Enlaces de navegación */}
        <div
          className="collapse navbar-collapse justify-content-center w-100"
          id="navbarNav"
        >
          <ul className="navbar-nav text-center">
            <li className="nav-item mx-2">
              <Link className="nav-link" to="/#inicio">Inicio</Link>
            </li>
            <li className="nav-item mx-2">
              <Link className="nav-link" to="/#nosotros">Nosotros</Link>
            </li>
            <li className="nav-item mx-2">
              <Link className="nav-link" to="/#salas">Salas</Link>
            </li>
            <li className="nav-item mx-2">
              <Link className="nav-link" to="/#contacto">Contacto</Link>
            </li>
          </ul>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;