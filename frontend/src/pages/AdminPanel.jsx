import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
        <div>
          <h2 className="mb-0">Panel de Administración - Trapped</h2>
          <small className="text-muted">Sesión iniciada como: <strong>{adminUsuario}</strong></small>
        </div>
        <button className="btn btn-outline-danger" onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {mensaje && <div className="alert alert-success">{mensaje}</div>}

      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div className="btn-group" role="group">
          {['Todas', 'Pendiente de pago', 'Confirmada', 'Cancelada', 'Vencida'].map((estado) => (
            <button
              key={estado}
              type="button"
              className={`btn btn-sm ${filtroEstado === estado ? 'btn-dark' : 'btn-outline-dark'}`}
              onClick={() => setFiltroEstado(estado)}
            >
              {estado}
            </button>
          ))}
        </div>

        <button className="btn btn-sm btn-outline-secondary" onClick={cargarReservas}>
          Actualizar lista
        </button>
      </div>

      {cargando ? (
        <p className="text-center my-5">Cargando reservas...</p>
      ) : reservasFiltradas.length === 0 ? (
        <div className="alert alert-info">No hay reservas para mostrar con este filtro.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Sala</th>
                <th>Fecha y Horario</th>
                <th>Cliente</th>
                <th>Contacto</th>
                <th>Jugadores</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservasFiltradas.map((r) => (
                <tr key={r.id_reserva}>
                  <td>{r.id_reserva}</td>
                  <td>{r.nombre_sala}</td>
                  <td>
                    <div>{r.fecha}</div>
                    <small className="text-muted">{r.horario} hs</small>
                  </td>
                  <td>{r.nombre_cliente} {r.apellido_cliente}</td>
                  <td>
                    <div className="small">{r.email_cliente}</div>
                    <div className="small text-muted">{r.telefono_cliente}</div>
                  </td>
                  <td className="text-center">{r.cantidad_participantes}</td>
                  <td>${Number(r.monto_total).toLocaleString('es-AR')}</td>
                  <td>
                    <span className={`badge ${obtenerBadge(r.estado_reserva)}`}>
                        {r.estado_reserva}
                    </span>
                    <div className="small text-muted mt-1">
                        Creada: {formatearFechaCreacion(r.fecha_creacion)}
                    </div>
                    {r.estado_reserva === 'Pendiente de pago' && (
                        <div className="small fw-semibold text-dark">
                        {obtenerTiempoRestante(r.fecha_creacion)}
                        </div>
                    )}
                    </td>
                  <td>
                    <div className="d-flex gap-1">
                      {r.estado_reserva === 'Pendiente de pago' && (
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => cambiarEstado(r.id_reserva, 'Confirmada')}
                        >
                          Confirmar
                        </button>
                      )}
                      {(r.estado_reserva === 'Pendiente de pago' || r.estado_reserva === 'Confirmada') && (
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => cambiarEstado(r.id_reserva, 'Cancelada')}
                        >
                          Cancelar
                        </button>
                      )}
                      {(r.estado_reserva === 'Cancelada' || r.estado_reserva === 'Vencida') && (
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
  );
}

export default AdminPanel;