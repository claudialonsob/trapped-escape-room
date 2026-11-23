import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function AdminLogin() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const response = await fetch('http://localhost:3000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al iniciar sesión');
        setCargando(false);
        return;
      }

      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('adminUsuario', data.usuario);

      navigate('/admin');
    } catch (err) {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="bg-dark min-vh-100 d-flex align-items-center justify-content-center py-5 px-3">
      <div className="card shadow-lg border-0 w-100 overflow-hidden" style={{ maxWidth: '420px' }}>
        {/* Encabezado con estética Trapped */}
        <div className="bg-black text-white text-center py-4 px-3 border-bottom border-danger border-3">
          <h1 className="h4 fw-bold mb-1 text-uppercase">Trapped Escape Room</h1>
          <p className="small text-secondary mb-0">Panel de Administración</p>
        </div>

        {/* Cuerpo del formulario */}
        <div className="card-body p-4 bg-white">
          <h2 className="h5 fw-bold text-center text-dark mb-4">Iniciar sesión</h2>

          {error && (
            <div className="alert alert-danger py-2 small" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold text-dark">Usuario</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ingresá tu usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold text-dark">Contraseña</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-danger btn-lg fw-bold w-100"
              disabled={cargando}
            >
              {cargando ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <div className="text-center mt-4 pt-3 border-top">
            <Link to="/" className="text-decoration-none text-muted small">
              ← Volver al sitio público
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default AdminLogin;