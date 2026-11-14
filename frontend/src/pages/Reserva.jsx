import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Reserva = () => {
  const { id } = useParams();
  const navigate = useNavigate(); 
  
  const paso2Ref = useRef(null);
  const paso3Ref = useRef(null);
  const resumenRef = useRef(null);

  // --- ESTADOS PARA DATOS DEL BACKEND ---
  const [salaDB, setSalaDB] = useState(null);
  const [preciosDB, setPreciosDB] = useState({});
  const [horariosOcupados, setHorariosOcupados] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [loadingHorarios, setLoadingHorarios] = useState(false); 
  const [isSubmitting, setIsSubmitting] = useState(false); 
  
  const [errorSala, setErrorSala] = useState(false);
  const [errorServidor, setErrorServidor] = useState(false);
  const [errorHorarios, setErrorHorarios] = useState(false); 

  const [formData, setFormData] = useState({
    participantes: '',
    fecha: '',
    hora: '',
    nombre: '',
    apellido: '',
    email: '',
    prefijo: '+56', 
    telefono: ''
  });

  // 1. Cargar la sala y sus tarifas
  useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchDatosIniciales = async () => {
      try {
        const [salasRes, preciosRes] = await Promise.all([
          axios.get('http://localhost:3000/api/salas'),
          axios.get('http://localhost:3000/api/precios')
        ]);

        const salaEncontrada = salasRes.data.find(s => s.id_sala === id);
        if (!salaEncontrada) {
          setErrorSala(true);
          setLoading(false);
          return;
        }
        setSalaDB(salaEncontrada);

        const preciosDeSala = preciosRes.data.filter(p => p.id_sala === id);
        const mapaPrecios = {};
        preciosDeSala.forEach(p => {
          mapaPrecios[p.cantidad_participantes] = parseFloat(p.precio);
        });
        setPreciosDB(mapaPrecios);

        setLoading(false);
      } catch (err) {
        console.error('Error conectando al backend:', err);
        setErrorServidor(true);
        setLoading(false);
      }
    };

    fetchDatosIniciales();
  }, [id]);

  // 2. Consultar disponibilidad con AbortController
  useEffect(() => {
    if (!formData.fecha) {
      setHorariosOcupados([]);
      return;
    }

    setFormData(prev => ({ ...prev, hora: '' }));
    setLoadingHorarios(true);
    setErrorHorarios(false);

    const controller = new AbortController();

    axios.get(`http://localhost:3000/api/reservas/disponibilidad?id_sala=${id}&fecha=${formData.fecha}`, {
      signal: controller.signal
    })
      .then(res => {
        setHorariosOcupados(res.data); 
      })
      .catch(err => {
        if (axios.isCancel(err)) return; 
        console.error('Error consultando horarios:', err);
        setErrorHorarios(true);
      })
      .finally(() => {
        setLoadingHorarios(false);
      });

    return () => controller.abort();
  }, [formData.fecha, id]);


  // --- VARIABLES Y CÁLCULOS (Ahora están ARRIBA de los returns) ---
  const calcularPrecio = (cantidad) => preciosDB[cantidad] || 0;
  
  const hoy = new Date();
  const fechaLocal = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const isPaso1Completo = formData.participantes !== '';
  const isPaso2Completo = isPaso1Completo && formData.fecha !== '' && formData.fecha >= fechaLocal && formData.hora !== '' && calcularPrecio(formData.participantes) > 0;
  
  const telefonoValido = formData.telefono.length >= 8;
  const emailValido = emailRegex.test(formData.email);
  
  const isFormularioListo = isPaso2Completo && formData.nombre.trim().length > 1 && formData.apellido.trim().length > 1 && emailValido && telefonoValido;

  // 3. Auto-scrolls (Ahora respetan las reglas de los Hooks al estar acá arriba)
  useEffect(() => {
    if (isPaso1Completo && !isPaso2Completo) {
      paso2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isPaso1Completo, isPaso2Completo]);

  useEffect(() => {
    if (isPaso2Completo && !isFormularioListo) {
      paso3Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isPaso2Completo, isFormularioListo]);

  useEffect(() => {
    if (isFormularioListo) {
      resumenRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isFormularioListo]);


  // --- FUNCIONES AUXILIARES ---
  const getOpcionesParticipantes = () => {
    if (!salaDB) return []; // Protección en caso de que aún no cargue
    const opciones = [];
    for (let i = salaDB.capacidad_minima; i <= salaDB.capacidad_maxima; i++) {
      if (id === 'fragmentado' && i % 2 !== 0) continue; 
      opciones.push(i);
    }
    return opciones;
  };

  const horariosDisponibles = Array.from({ length: 14 }, (_, i) => `${i + 10}:00`);

  const handleChange = (e) => {
    if (e.target.name === 'telefono') {
      const soloNumeros = e.target.value.replace(/\D/g, '');
      setFormData({ ...formData, telefono: soloNumeros });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const getIndicadorClass = (pasoActualCompleto, pasoHabilitado) => {
    if (pasoActualCompleto) return 'bg-danger text-white border-danger shadow-sm'; 
    if (pasoHabilitado) return 'bg-white text-danger border-danger fw-bold shadow-sm'; 
    return 'bg-light text-secondary border-secondary opacity-50'; 
  };

  const enviarReserva = async () => {
    setIsSubmitting(true);
    try {
      const nuevaReserva = {
        id_sala: id,
        fecha: formData.fecha,
        horario: formData.hora,
        cantidad_participantes: parseInt(formData.participantes),
        monto_total: calcularPrecio(formData.participantes),
        nombre_cliente: formData.nombre,
        apellido_cliente: formData.apellido,
        email_cliente: formData.email,
        telefono_cliente: `${formData.prefijo} ${formData.telefono}`
      };

      const response = await axios.post('http://localhost:3000/api/reservas', nuevaReserva);
      
      alert(response.data.mensaje); 
      navigate('/'); 
      
    } catch (error) {
      alert(error.response?.data?.error || 'Error de conexión con el servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };


  // --- PANTALLAS DE CARGA Y ERRORES (Los "Returns" tempranos siempre van a lo último de la lógica) ---
  
  if (loading) return <div className="container py-5 mt-5 text-center min-vh-100">Cargando datos de la sala...</div>;

  if (errorServidor) {
    return (
      <div className="container py-5 mt-5 text-center min-vh-100">
        <h2 className="display-5 fw-bold text-danger mb-4">Error de conexión</h2>
        <p className="lead">No pudimos conectar con el servidor. Por favor, intentá nuevamente en unos minutos.</p>
        <button onClick={() => window.location.reload()} className="btn btn-dark mt-4 fw-bold">Reintentar</button>
      </div>
    );
  }

  if (errorSala || !salaDB) {
    return (
      <div className="container py-5 mt-5 text-center min-vh-100">
        <h2 className="display-5 fw-bold text-danger mb-4">Sala no encontrada</h2>
        <p className="lead">La sala que intentás reservar no existe o el enlace es incorrecto.</p>
        <Link to="/" className="btn btn-dark mt-4 fw-bold">Volver al inicio</Link>
      </div>
    );
  }

  // --- RENDERIZADO PRINCIPAL ---
  return (
    <div className="container py-5 mt-4" style={{ maxWidth: '800px' }}>
      
      <h2 className="mb-2 fw-bold text-center">Reserva tu experiencia</h2>
      <p className="mb-5 lead text-center text-muted">Sala seleccionada: <strong className="text-dark">{salaDB.nombre}</strong></p>

      {/* INDICADORES */}
      <div className="d-flex justify-content-between mb-5 px-0 px-md-3 text-center" style={{ fontSize: '0.95rem' }}>
        <div className={`border rounded px-2 py-2 w-100 mx-1 transition-all ${getIndicadorClass(isPaso1Completo, true)}`}>
          1. Participantes
        </div>
        <div className={`border rounded px-2 py-2 w-100 mx-1 transition-all ${getIndicadorClass(isPaso2Completo, isPaso1Completo)}`}>
          2. Fecha y horario
        </div>
        <div className={`border rounded px-2 py-2 w-100 mx-1 transition-all ${getIndicadorClass(isFormularioListo, isPaso2Completo)}`}>
          3. Tus datos
        </div>
      </div>

      {/* 1. PARTICIPANTES */}
      <div className="mb-5 p-4 border rounded bg-white shadow-sm" style={{ scrollMarginTop: '100px' }}>
        <h5 className="mb-3">Selecciona la cantidad de participantes</h5>
        <select className="form-select w-50" name="participantes" value={formData.participantes} onChange={handleChange}>
          <option value="">Seleccionar...</option>
          {getOpcionesParticipantes().map(num => (
            <option key={num} value={num}>{num} participantes</option>
          ))}
        </select>
        {formData.participantes !== '' && calcularPrecio(formData.participantes) === 0 && (
           <div className="text-danger mt-2 fw-bold">Error: No hay tarifa configurada para esta cantidad.</div>
        )}
      </div>

      {/* 2. FECHA Y HORARIO (Grilla) */}
      <div ref={paso2Ref} className={`mb-5 p-4 border rounded bg-white shadow-sm transition-all ${!isPaso1Completo ? 'opacity-50 border-light' : 'border-danger'}`} style={{ pointerEvents: !isPaso1Completo ? 'none' : 'auto', scrollMarginTop: '120px' }}>
        <h5 className="mb-3">2. Fecha y horario</h5>
        
        <div className="mb-4">
          <label className="form-label text-muted">Seleccioná una fecha:</label>
          <input 
            type="date" 
            className="form-control" 
            style={{ maxWidth: '250px' }}
            name="fecha" 
            min={fechaLocal}
            value={formData.fecha} 
            onChange={handleChange} 
            disabled={!isPaso1Completo}
          />
        </div>

        {formData.fecha && (
          <div>
            <label className="form-label text-muted mb-3">Horarios disponibles:</label>
            
            {loadingHorarios ? (
              <div className="text-primary fw-bold">Consultando disponibilidad...</div>
            ) : errorHorarios ? (
              <div className="text-danger fw-bold">Hubo un error al cargar los horarios. Cambiá la fecha para reintentar.</div>
            ) : (
              <div className="d-flex flex-wrap gap-2">
                {horariosDisponibles.map(h => {
                  const estaOcupado = horariosOcupados.includes(h);
                  if (estaOcupado) return null; 
                  
                  return (
                    <button
                      key={h}
                      type="button"
                      className={`btn ${formData.hora === h ? 'btn-danger shadow-sm' : 'btn-outline-secondary'} px-4 py-2 fw-bold`}
                      onClick={() => setFormData({ ...formData, hora: h })}
                    >
                      {h}
                    </button>
                  );
                })}
                
                {horariosDisponibles.every(h => horariosOcupados.includes(h)) && (
                  <div className="text-danger fw-bold w-100">No quedan turnos disponibles para este día.</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. DATOS DEL CLIENTE */}
      <div ref={paso3Ref} className={`mb-5 p-4 border rounded bg-white shadow-sm transition-all ${!isPaso2Completo ? 'opacity-50 border-light' : 'border-danger'}`} style={{ pointerEvents: !isPaso2Completo ? 'none' : 'auto', scrollMarginTop: '120px' }}>
        <h5 className="mb-4">3. Tus Datos</h5>
        <div className="row g-3">
          <div className="col-md-6">
            <input type="text" className="form-control" name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} disabled={!isPaso2Completo} />
          </div>
          <div className="col-md-6">
            <input type="text" className="form-control" name="apellido" placeholder="Apellido" value={formData.apellido} onChange={handleChange} disabled={!isPaso2Completo} />
          </div>
          
          <div className="col-md-6">
            <input type="email" className={`form-control ${formData.email.length > 0 && !emailValido ? 'is-invalid' : ''}`} name="email" placeholder="Correo electrónico" value={formData.email} onChange={handleChange} disabled={!isPaso2Completo} />
            {formData.email.length > 0 && !emailValido && (
              <div className="invalid-feedback fw-bold">Ingresá un correo válido.</div>
            )}
          </div>

          <div className="col-md-6">
            <div className="input-group has-validation">
              <select className="form-select" style={{ maxWidth: '120px' }} name="prefijo" value={formData.prefijo} onChange={handleChange} disabled={!isPaso2Completo}>
                <option value="+56">🇨🇱 +56</option>
                <option value="+54">🇦🇷 +54</option>
                <option value="+598">🇺🇾 +598</option>
                <option value="+57">🇨🇴 +57</option>
                <option value="+51">🇵🇪 +51</option>
                <option value="+1">🇺🇸 +1</option>
              </select>
              <input type="tel" className={`form-control ${formData.telefono.length > 0 && !telefonoValido ? 'is-invalid' : ''}`} name="telefono" placeholder="Número" value={formData.telefono} onChange={handleChange} disabled={!isPaso2Completo} />
              {formData.telefono.length > 0 && !telefonoValido && (
                <div className="invalid-feedback fw-bold">Al menos 8 dígitos.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RESUMEN Y BOTÓN FINAL */}
      <div ref={resumenRef} className={`mt-5 p-4 border rounded bg-light shadow-sm transition-all ${!isFormularioListo ? 'd-none' : 'd-block'}`} style={{ scrollMarginTop: '100px' }}>
        <h4 className="mb-4 fw-bold text-center">Resumen de tu reserva</h4>
        <div className="d-flex justify-content-between border-bottom pb-2 mb-3">
          <span className="text-muted">Sala:</span> <strong>{salaDB?.nombre}</strong>
        </div>
        <div className="d-flex justify-content-between border-bottom pb-2 mb-3">
          <span className="text-muted">Participantes:</span> <strong>{formData.participantes} personas</strong>
        </div>
        <div className="d-flex justify-content-between border-bottom pb-2 mb-3">
          <span className="text-muted">Fecha y Turno:</span> <strong>{formData.fecha} a las {formData.hora} hs</strong>
        </div>
        <div className="d-flex justify-content-between border-bottom pb-2 mb-3">
          <span className="text-muted">Contacto:</span> <strong>{formData.email} | {formData.prefijo} {formData.telefono}</strong>
        </div>
        <div className="d-flex justify-content-between text-danger fs-4 mt-4 fw-bold">
          <span>Precio Total:</span> <span>${calcularPrecio(formData.participantes)}</span>
        </div>
        
        <button 
          className="btn btn-danger btn-lg w-100 py-3 mt-4 fw-bold shadow-sm" 
          disabled={!isFormularioListo || isSubmitting || calcularPrecio(formData.participantes) === 0}
          onClick={enviarReserva}
        >
          {isSubmitting ? 'PROCESANDO RESERVA...' : 'CONFIRMAR Y ENVIAR RESERVA'}
        </button>
      </div>

    </div>
  );
};

export default Reserva;