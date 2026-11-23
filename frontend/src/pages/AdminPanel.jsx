import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function AdminPanel() {
  const [reservas, setReservas] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('Todas');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  const token = sessionStorage.getItem('token');
  const adminUsuario = sessionStorage.getItem('adminUsuario');

  const cerrarSesion = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('adminUsuario');
    navigate('/admin/login');
  };

  const cargarReservas = async () => {
    setCargando(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/reservas', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        cerrarSesion();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al cargar las reservas.');
        return;
      }

      setReservas(data);
    } catch (err) {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }
    cargarReservas();
  }, []);

  const cambiarEstado = async (idReserva, nuevoEstado) => {
    const accion = nuevoEstado === 'Confirmada' ? 'confirmar' : 'cancelar';
    if (!window.confirm(`¿Seguro que querés ${accion} la reserva #${idReserva}?`)) {
      return;
    }

    setError('');
    setMensaje('');

    try {
      const response = await fetch(`http://localhost:3000/api/reservas/${idReserva}/estado`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nuevo_estado: nuevoEstado }),
      });

      if (response.status === 401 || response.status === 403) {
        cerrarSesion();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'No se pudo actualizar el estado.');
        return;
      }

      setMensaje(data.mensaje);
      cargarReservas();
    } catch (err) {
      setError('Error de conexión al actualizar la reserva.');
    }
  };

  const obtenerBadge = (estado) => {
    switch (estado) {
      case 'Confirmada':
        return 'bg-success';
      case 'Pendiente de pago':
        return 'bg-warning text-dark';
      case 'Cancelada':
        return 'bg-danger';
      case 'Vencida':
        return 'bg-secondary';
      default:
        return 'bg-light text-dark';
    }
  };

  const reservasFiltradas =
    filtroEstado === 'Todas'
      ? reservas
      : reservas.filter((r) => r.estado_reserva === filtroEstado);

  const formatearFechaCreacion = (fechaCreacion) => {
    if (!fechaCreacion) return '—';
    const fecha = new Date(fechaCreacion);
    if (isNaN(fecha.getTime())) return '—';

    return fecha.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const obtenerTiempoRestante = (fechaCreacion) => {
    if (!fechaCreacion) return '';
    const fecha = new Date(fechaCreacion);
    if (isNaN(fecha.getTime())) return '';

    const vencimiento = fecha.getTime() + 48 * 60 * 60 * 1000;
    const diferenciaMs = vencimiento - Date.now();

    if (diferenciaMs <= 0) return 'Plazo cumplido';

    const horas = Math.floor(diferenciaMs / (1000 * 60 * 60));
    const minutos = Math.floor((diferenciaMs % (1000 * 60 * 60)) / (1000 * 60));

    if (horas > 0) return `Vence en ${horas}h ${minutos}m`;
    return `Vence en ${minutos}m`;
  };

  // Contadores rápidos para las tarjetas de resumen
  const totalPendientes = reservas.filter((r) => r.estado_reserva === 'Pendiente de pago').length;
  const totalConfirmadas = reservas.filter((r) => r.estado_reserva === 'Confirmada').length;
  const totalCanceladasOVencidas = reservas.filter(
    (r) => r.estado_reserva === 'Cancelada' || r.estado_reserva === 'Vencida'
  ).length;

  return (
    <div className="bg-light min-vh-100 pb-5">
      {/* Encabezado oscuro con estética Trapped */}
      <header className="bg-dark text-white py-3 border-bottom border-danger border-3 shadow-sm">
        <div className="container d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h1 className="h4 fw-bold mb-0 text-uppercase">Trapped Escape Room</h1>
            <small className="text-secondary">
              Panel de Administración · Sesión iniciada como{' '}
              <strong className="text-white">{adminUsuario}</strong>
            </small>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Link to="/" className="btn btn-outline-light btn-sm">
              Ver sitio público
            </Link>
            <button className="btn btn-danger btn-sm fw-bold" onClick={cerrarSesion}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="container py-4">
        {/* Tarjetas de resumen */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="small text-muted text-uppercase fw-semibold">Total reservas</div>
                <div className="h3 fw-bold mb-0 mt-1 text-dark">{reservas.length}</div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm h-100 border-start border-warning border-4">
              <div className="card-body">
                <div className="small text-muted text-uppercase fw-semibold">Pendientes</div>
                <div className="h3 fw-bold mb-0 mt-1 text-dark">{totalPendientes}</div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm h-100 border-start border-success border-4">
              <div className="card-body">
                <div className="small text-muted text-uppercase fw-semibold">Confirmadas</div>
                <div className="h3 fw-bold mb-0 mt-1 text-dark">{totalConfirmadas}</div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm h-100 border-start border-secondary border-4">
              <div className="card-body">
                <div className="small text-muted text-uppercase fw-semibold">Canceladas / Vencidas</div>
                <div className="h3 fw-bold mb-0 mt-1 text-dark">{totalCanceladasOVencidas}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Alertas de estado */}
        {error && (
          <div className="alert alert-danger shadow-sm border-0" role="alert">
            {error}
          </div>
        )}
        {mensaje && (
          <div className="alert alert-success shadow-sm border-0" role="alert">
            {mensaje}
          </div>
        )}

        {/* Contenedor principal de filtros y tabla */}
        <div className="card border-0 shadow-sm overflow-hidden">
          <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div className="d-flex flex-wrap gap-1" role="group">
              {['Todas', 'Pendiente de pago', 'Confirmada', 'Cancelada', 'Vencida'].map((estado) => (
                <button
                  key={estado}
                  type="button"
                  className={`btn btn-sm fw-semibold ${
                    filtroEstado === estado ? 'btn-dark' : 'btn-outline-dark'
                  }`}
                  onClick={() => setFiltroEstado(estado)}
                >
                  {estado}
                </button>
              ))}
            </div>

            <button className="btn btn-sm btn-outline-secondary fw-semibold" onClick={cargarReservas}>
              Actualizar lista
            </button>
          </div>

          <div className="card-body p-0">
            {cargando ? (
              <div className="text-center py-5 text-muted">
                <div className="spinner-border spinner-border-sm text-danger me-2" role="status" />
                Cargando reservas...
              </div>
            ) : reservasFiltradas.length === 0 ? (
              <div className="text-center py-5 text-muted">
                No hay reservas para mostrar con este filtro.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th className="ps-3">#</th>
                      <th>Sala</th>
                      <th>Fecha y Horario</th>
                      <th>Cliente</th>
                      <th>Contacto</th>
                      <th className="text-center">Jugadores</th>
                      <th>Monto</th>
                      <th>Estado</th>
                      <th className="pe-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservasFiltradas.map((r) => (
                      <tr key={r.id_reserva}>
                        <td className="ps-3 text-muted fw-semibold">#{r.id_reserva}</td>
                        <td className="fw-semibold text-dark">{r.nombre_sala}</td>
                        <td>
                          <div className="fw-semibold">{r.fecha}</div>
                          <small className="text-muted">{r.horario} hs</small>
                        </td>
                        <td>
                          {r.nombre_cliente} {r.apellido_cliente}
                        </td>
                        <td>
                          <div className="small">{r.email_cliente}</div>
                          <div className="small text-muted">{r.telefono_cliente}</div>
                        </td>
                        <td className="text-center">{r.cantidad_participantes}</td>
                        <td className="fw-semibold">
                          ${Number(r.monto_total).toLocaleString('es-AR')}
                        </td>
                        <td>
                          <span className={`badge ${obtenerBadge(r.estado_reserva)}`}>
                            {r.estado_reserva}
                          </span>
                          <div className="small text-muted mt-1">
                            Creada: {formatearFechaCreacion(r.fecha_creacion)}
                          </div>
                          {r.estado_reserva === 'Pendiente de pago' && (
                            <div className="small fw-semibold text-danger">
                              {obtenerTiempoRestante(r.fecha_creacion)}
                            </div>
                          )}
                        </td>
                        <td className="pe-3">
                          <div className="d-flex gap-1">
                            {r.estado_reserva === 'Pendiente de pago' && (
                              <button
                                className="btn btn-sm btn-success fw-semibold"
                                onClick={() => cambiarEstado(r.id_reserva, 'Confirmada')}
                              >
                                Confirmar
                              </button>
                            )}
                            {(r.estado_reserva === 'Pendiente de pago' ||
                              r.estado_reserva === 'Confirmada') && (
                              <button
                                className="btn btn-sm btn-outline-danger fw-semibold"
                                onClick={() => cambiarEstado(r.id_reserva, 'Cancelada')}
                              >
                                Cancelar
                              </button>
                            )}
                            {(r.estado_reserva === 'Cancelada' ||
                              r.estado_reserva === 'Vencida') && (
                              <span className="text-muted small">—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminPanel;