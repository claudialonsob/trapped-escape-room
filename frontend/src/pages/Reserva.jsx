import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';

const Reserva = () => {
  const { id } = useParams();
  
  const paso2Ref = useRef(null);
  const paso3Ref = useRef(null);
  const resumenRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const salasConfig = {
    'fragmentado': { nombre: 'Fragmentado', opciones: [2, 4, 6] },
    'conexion-perdida': { nombre: 'Conexión Perdida', opciones: [2, 3, 4, 5, 6] },
    'el-acertijo': { nombre: 'El Acertijo', opciones: [1, 2, 3, 4, 5, 6] }
  };
  
  // 1. Manejo de sala inexistente (Error 404)
  const sala = salasConfig[id];
  if (!sala) {
    return (
      <div className="container py-5 mt-5 text-center min-vh-100">
        <h2 className="display-5 fw-bold text-danger mb-4">Sala no encontrada</h2>
        <p className="lead">La sala que intentás reservar no existe o el enlace es incorrecto.</p>
        <Link to="/" className="btn btn-dark mt-4 fw-bold">Volver al inicio</Link>
      </div>
    );
  }

  const horariosDisponibles = Array.from({ length: 14 }, (_, i) => `${i + 10}:00`);
  
  // 2. Aclaración de tarifas simuladas
  const calcularPrecio = (cantidad) => {
    // NOTA: Los importes para 4, 5 y 6 participantes son provisorios para pruebas de UI.
    // Estos valores deberán ser reemplazados por la tabla PRECIOS del backend.
    const tarifas = { 1: 20000, 2: 35000, 3: 45000, 4: 55000, 5: 65000, 6: 75000 };
    return tarifas[cantidad] || 0;
  };

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

  const handleChange = (e) => {
    // 3. Filtro en vivo: Solo permite escribir números en el campo teléfono
    if (e.target.name === 'telefono') {
      const soloNumeros = e.target.value.replace(/\D/g, '');
      setFormData({ ...formData, telefono: soloNumeros });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const hoy = new Date();
  const fechaLocal = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const isPaso1Completo = formData.participantes !== '';
  const isPaso2Completo = isPaso1Completo && formData.fecha !== '' && formData.fecha >= fechaLocal && formData.hora !== '';
  
  const telefonoValido = formData.telefono.length >= 8;
  const emailValido = emailRegex.test(formData.email);
  
  const isFormularioListo = isPaso2Completo && formData.nombre.trim().length > 1 && formData.apellido.trim().length > 1 && emailValido && telefonoValido;

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

  // 4. Lógica refinada para los colores de los indicadores
  const getIndicadorClass = (pasoActualCompleto, pasoHabilitado) => {
    if (pasoActualCompleto) return 'bg-danger text-white border-danger shadow-sm'; // Listo (Rojo sólido)
    if (pasoHabilitado) return 'bg-white text-danger border-danger fw-bold shadow-sm'; // Habilitado para escribir (Borde rojo)
    return 'bg-light text-secondary border-secondary opacity-50'; // Bloqueado (Gris)
  };

  return (
    <div className="container py-5 mt-4" style={{ maxWidth: '800px' }}>
      
      <h2 className="mb-2 fw-bold text-center">Reserva tu experiencia</h2>
      <p className="mb-5 lead text-center text-muted">Sala seleccionada: <strong className="text-dark">{sala.nombre}</strong></p>

      {/* Indicadores superiores */}
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
        <h5 className="mb-3">1. Selecciona la cantidad de participantes</h5>
        <select className="form-select w-50" name="participantes" value={formData.participantes} onChange={handleChange}>
          <option value="">Seleccionar...</option>
          {sala.opciones.map(num => (
            <option key={num} value={num}>{num} participantes</option>
          ))}
        </select>
      </div>

      {/* 2. FECHA Y HORARIO */}
      <div ref={paso2Ref} className={`mb-5 p-4 border rounded bg-white shadow-sm transition-all ${!isPaso1Completo ? 'opacity-50 border-light' : 'border-danger'}`} style={{ pointerEvents: !isPaso1Completo ? 'none' : 'auto', scrollMarginTop: '120px' }}>
        <h5 className="mb-3">2. Fecha y horario</h5>
        <div className="d-flex flex-column flex-md-row gap-3">
          <input 
            type="date" 
            className="form-control w-auto" 
            name="fecha" 
            min={fechaLocal}
            value={formData.fecha} 
            onChange={handleChange} 
            disabled={!isPaso1Completo}
          />
          <select 
            className="form-select w-auto" 
            name="hora" 
            value={formData.hora} 
            onChange={handleChange}
            disabled={!isPaso1Completo}
          >
            <option value="">Horario...</option>
            {horariosDisponibles.map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>
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
              <div className="invalid-feedback fw-bold">Ingresá un correo válido (ej: nombre@dominio.com).</div>
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
                <div className="invalid-feedback fw-bold">El número debe tener al menos 8 dígitos.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RESUMEN Y BOTÓN FINAL */}
      <div ref={resumenRef} className={`mt-5 p-4 border rounded bg-light shadow-sm transition-all ${!isFormularioListo ? 'd-none' : 'd-block'}`} style={{ scrollMarginTop: '100px' }}>
        <h4 className="mb-4 fw-bold text-center">Resumen de tu reserva</h4>
        <div className="d-flex justify-content-between border-bottom pb-2 mb-3">
          <span className="text-muted">Sala:</span> <strong>{sala.nombre}</strong>
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
          disabled={!isFormularioListo}
          onClick={() => alert("¡Simulación exitosa! Los datos están listos para enviarse al backend.")}
        >
          CONFIRMAR Y ENVIAR RESERVA
        </button>
      </div>

    </div>
  );
};

export default Reserva;