import { useState, useEffect } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "moment/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button, Container, Row, Col, Form } from "react-bootstrap";
import {
  Building,
  DoorOpen,
  Calendar as CalendarIcon,
  Clock,
  Person,
  InfoCircle,
  People,
  Key,
  ChevronLeft,
  ChevronRight,
  CalendarCheck
} from "react-bootstrap-icons";
import axios from "axios";
import "./Calendario.css";

// Configuración de moment.js en español
moment.locale("es", {
  months: 'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split('_'),
  monthsShort: 'Ene_Feb_Mar_Abr_May_Jun_Jul_Ago_Sep_Oct_Nov_Dic'.split('_'),
  weekdays: 'Domingo_Lunes_Martes_Miércoles_Jueves_Viernes_Sábado'.split('_'),
  weekdaysShort: 'Dom_Lun_Mar_Mié_Jue_Vie_Sáb'.split('_'),
  weekdaysMin: 'Do_Lu_Ma_Mi_Ju_Vi_Sá'.split('_')
});

const localizer = momentLocalizer(moment);

const Calendario = () => {
  const [reservas, setReservas] = useState([]);
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState("");
  const [salaSeleccionada, setSalaSeleccionada] = useState("");
  const [vista, setVista] = useState(Views.MONTH);
  const [fechaActual, setFechaActual] = useState(new Date());
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalPassword, setMostrarModalPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [modoAccion, setModoAccion] = useState("");
  const [formData, setFormData] = useState({
    ubicacion: "",
    sala: "",
    fecha: "",
    nombre: "",
    correo: "",
    motivo: "",
    invitados: [],
    contraseña: "",
    horaInicio: "",
    horaFin: ""
  });
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [formularioEdicion, setFormularioEdicion] = useState({
    fecha: "",
    horaInicio: "",
    horaFin: "",
    ubicacion: "",
    sala: "",
    motivo: "",
    invitados: []
  });
  
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [reservasExistentesEdicion, setReservasExistentesEdicion] = useState([]);
  const [salas, setSalas] = useState([]);
  const [naves, setNaves] = useState([]);
  const [salasPorUbicacion, setSalasPorUbicacion] = useState({});

  useEffect(() => {
    const obtenerReservas = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/reservations');
        // Datos recibidos de la API
        const reservasProcesadas = response.data.map(reserva => {
          // Procesando reserva individual
          return {
            id: reserva._id,
            title: `${reserva.motivo} - ${reserva.nombre}`,
            start: new Date(`${reserva.fecha}T${reserva.horaInicio}`),
            end: new Date(`${reserva.fecha}T${reserva.horaFin}`),
            sala: reserva.sala,
            ubicacion: reserva.ubicacion || "Nave no especificada",
            nombre: reserva.nombre,
            motivo: reserva.motivo,
            estado: reserva.estado
          };
        });
        // Reservas procesadas
        setReservas(reservasProcesadas);
      } catch (error) {
        console.error('Error al obtener las reservas:', error);
      }
    };

    obtenerReservas();
  }, []);

  useEffect(() => {
    const cargarSalas = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/rooms');
        // Respuesta de salas recibida
        const salasData = response.data;

        // Extraer ubicaciones únicas y filtrar valores nulos o vacíos
        const ubicacionesUnicas = [...new Set(salasData.map(sala => sala.ubicacion))].filter(Boolean);
        // Ubicaciones únicas identificadas
        setNaves(ubicacionesUnicas);

        // Agrupar salas por ubicación
        const salasPorUbicacion = {};
        salasData.forEach(sala => {
          if (sala.ubicacion) {
            if (!salasPorUbicacion[sala.ubicacion]) {
              salasPorUbicacion[sala.ubicacion] = [];
            }
            salasPorUbicacion[sala.ubicacion].push(sala.nombre);
          }
        });

        // Salas agrupadas por ubicación
        setSalas(salasData);
        setSalasPorUbicacion(salasPorUbicacion);
      } catch (error) {
        console.error('Error al cargar las salas:', error);
      }
    };

    cargarSalas();
  }, []);

  // Filtrar salas basado en la ubicación seleccionada
  const salasFiltradas = ubicacionSeleccionada ? salasPorUbicacion[ubicacionSeleccionada] || [] : [];

  // Filtrar eventos basado en ubicación y sala seleccionadas
  const eventosFiltrados = reservas.filter((evento) => {
    const ubicacionCoincide = ubicacionSeleccionada ? evento.ubicacion === ubicacionSeleccionada : true;
    const salaCoincide = salaSeleccionada ? evento.sala === salaSeleccionada : true;
    return ubicacionCoincide && salaCoincide;
  });

  const getColorPorUbicacion = (ubicacion) => {
    const colores = {
      "Nave 1": "#4A90E2",
      "Nave 4": "#50E3C2",
      "Nave no especificada": "#B8B8B8"
    };
    return colores[ubicacion] || "#B8B8B8";
  };

  const eventStyleGetter = (event) => {
    const color = getColorPorUbicacion(event.ubicacion);
    return {
      style: {
        backgroundColor: color,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'black',
        border: '0px',
        display: 'block'
      }
    };
  };

  const cambiarFecha = (accion) => {
    let nuevaFecha;
    if (accion === "anterior") {
      nuevaFecha = moment(fechaActual).subtract(1, vista === Views.MONTH ? "months" : vista === Views.WEEK ? "weeks" : "days").toDate();
    } else if (accion === "siguiente") {
      nuevaFecha = moment(fechaActual).add(1, vista === Views.MONTH ? "months" : vista === Views.WEEK ? "weeks" : "days").toDate();
    } else {
      nuevaFecha = new Date();
    }
    setFechaActual(nuevaFecha);
  };

  const mostrarDia = () => vista === Views.DAY ? moment(fechaActual).format("D [de] MMMM [de] YYYY") : null;
  const mostrarMes = () => vista === Views.MONTH ? moment(fechaActual).format("MMMM [de] YYYY") : null;

  const handleSelectEvent = (event) => {
    setReservaSeleccionada(event);
    setFormData({
      ubicacion: event.ubicacion,
      sala: event.sala,
      fecha: event.fecha,
      nombre: event.nombre,
      correo: event.correo,
      motivo: event.motivo,
      invitados: event.invitados || [],
      contraseña: event.contraseña || "",
      horaInicio: event.horaInicio,
      horaFin: event.horaFin
    });
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setReservaSeleccionada(null);
  };

  const solicitarPassword = (accion) => {
    // Procesando acción con la reserva seleccionada
    setModoAccion(accion);
    setPasswordInput("");
    setMostrarModal(false);
    setMostrarModalPassword(true);
  };

  const confirmarAccion = async () => {
    try {
      if (modoAccion === "eliminar") {
        // Intentando eliminar reserva
        const response = await axios.delete(`http://localhost:5000/api/reservations/${reservaSeleccionada.id}`, {
          data: { contraseña: passwordInput }
        });

        if (response.status === 200) {
          setReservas(reservas.filter((r) => r.id !== reservaSeleccionada.id));
          setMostrarModalPassword(false);
          alert("Reserva eliminada correctamente.");
        }
      } else if (modoAccion === "editar") {
        try {
          // Verificando contraseña para edición

          const response = await axios.post(
            `http://localhost:5000/api/reservations/${reservaSeleccionada.id}/verificar-password`,
            { contraseña: passwordInput }
          );

          // Respuesta de verificación recibida

          if (response.status === 200) {
            setMostrarModalPassword(false);
            abrirModalEdicion();
          }
        } catch (error) {
          console.error('Error al verificar contraseña:', error);
          console.error('Detalles del error:', error.response?.data);
          if (error.response?.status === 403) {
            alert("Contraseña incorrecta");
          } else if (error.response?.status === 404) {
            alert("Reserva no encontrada");
          } else {
            alert("Error al verificar la contraseña");
          }
          throw error;
        }
      }
    } catch (error) {
      console.error("Error al procesar la acción:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleEditarReserva = async () => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/reservations/${reservaSeleccionada.id}/editar`,
        {
          ...formularioEdicion,
          contraseña: passwordInput,
          cambios: {
            fecha: formularioEdicion.fecha !== moment(reservaSeleccionada.start).format("YYYY-MM-DD"),
            horaInicio: formularioEdicion.horaInicio !== moment(reservaSeleccionada.start).format("HH:mm"),
            horaFin: formularioEdicion.horaFin !== moment(reservaSeleccionada.end).format("HH:mm"),
            ubicacion: formularioEdicion.ubicacion !== reservaSeleccionada.ubicacion,
            sala: formularioEdicion.sala !== reservaSeleccionada.sala,
            motivo: formularioEdicion.motivo !== reservaSeleccionada.motivo,
            invitados: JSON.stringify(formularioEdicion.invitados) !== JSON.stringify(reservaSeleccionada.invitados)
          }
        }
      );

      if (response.status === 200) {
        const reservasActualizadas = reservas.map(r =>
          r.id === reservaSeleccionada.id ? {
            ...r,
            start: new Date(formularioEdicion.fecha + "T" + formularioEdicion.horaInicio),
            end: new Date(formularioEdicion.fecha + "T" + formularioEdicion.horaFin),
            ubicacion: formularioEdicion.ubicacion,
            sala: formularioEdicion.sala,
            motivo: formularioEdicion.motivo,
            invitados: formularioEdicion.invitados
          } : r
        );
        setReservas(reservasActualizadas);
        setMostrarModalEdicion(false);
        setMostrarModalPassword(false);
        setPasswordInput("");
        alert("Reserva actualizada correctamente");
      }
    } catch (error) {
      console.error("Error al actualizar la reserva:", error);
      alert(error.response?.data?.message || "Error al actualizar la reserva");
    }
  };

  const abrirModalEdicion = () => {
    if (reservaSeleccionada) {
      const datosEdicion = {
        fecha: moment(reservaSeleccionada.start).format("YYYY-MM-DD"),
        horaInicio: moment(reservaSeleccionada.start).format("HH:mm"),
        horaFin: moment(reservaSeleccionada.end).format("HH:mm"),
        ubicacion: reservaSeleccionada.ubicacion,
        sala: reservaSeleccionada.sala,
        motivo: reservaSeleccionada.motivo,
        invitados: reservaSeleccionada.invitados || []
      };
      
      setFormularioEdicion(datosEdicion);
      cargarReservasParaEdicion(datosEdicion);
      setMostrarModalEdicion(true);
    }
  };
  
  const cargarReservasParaEdicion = async (datos) => {
    if (datos.ubicacion && datos.sala && datos.fecha) {
      try {
        const response = await axios.get(`http://localhost:5000/api/reservations`, {
          params: {
            ubicacion: datos.ubicacion,
            sala: datos.sala,
            fecha: datos.fecha
          }
        });
        
        // Filtrar para excluir la reserva actual que estamos editando
        const reservasFiltradas = response.data.filter(r => r._id !== reservaSeleccionada.id);
        setReservasExistentesEdicion(reservasFiltradas);
        actualizarHorariosDisponibles(reservasFiltradas, datos.horaInicio, datos.horaFin);
      } catch (error) {
        // Error al cargar reservas para edición
      }
    }
  };
  
  const actualizarHorariosDisponibles = (reservas, horaInicioActual, horaFinActual) => {
    const horarios = generarOpcionesHora().map(hora => {
      const horaActual = moment(hora.value, 'HH:mm');
      
      // Verificar si la hora actual está dentro de una reserva existente
      const estaDentroDeReserva = reservas.some(reserva => {
        const reservaInicio = moment(reserva.horaInicio, 'HH:mm');
        const reservaFin = moment(reserva.horaFin, 'HH:mm');
        return horaActual.isBetween(reservaInicio, reservaFin, null, '[)');
      });
      
      return {
        ...hora,
        disponible: !estaDentroDeReserva
      };
    });
    
    setHorariosDisponibles(horarios);
  };

  const handleChangeEdicion = (e) => {
    const { name, value } = e.target;
    const nuevoFormulario = {
      ...formularioEdicion,
      [name]: value
    };
    
    setFormularioEdicion(nuevoFormulario);
    
    // Si cambia ubicación, sala o fecha, actualizar horarios disponibles
    if (name === 'ubicacion' || name === 'sala' || name === 'fecha') {
      if (name === 'ubicacion') {
        // Si cambia la ubicación, resetear la sala
        nuevoFormulario.sala = '';
      }
      
      if (nuevoFormulario.ubicacion && nuevoFormulario.sala && nuevoFormulario.fecha) {
        cargarReservasParaEdicion(nuevoFormulario);
      }
    }
  };

  const generarOpcionesHora = () => {
    const opciones = [];
    for (let hora = 7; hora <= 20; hora++) {
      for (let minuto = 0; minuto < 60; minuto += 15) {
        const horaStr = hora.toString().padStart(2, '0');
        const minutoStr = minuto.toString().padStart(2, '0');
        const horaCompleta = `${horaStr}:${minutoStr}`;
        const hora12 = hora % 12 || 12;
        const ampm = hora >= 12 ? 'PM' : 'AM';
        opciones.push({
          value: horaCompleta,
          label: `${hora12}:${minutoStr} ${ampm}`,
          disponible: true
        });
      }
    }
    return opciones;
  };

  return (
    <div className="calendario-container" style={{
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      minHeight: '100vh',
      padding: '1rem 0'
    }}>
      <Container className="mt-3 mt-md-5 mb-4 mb-md-5">
        <Row className="justify-content-center mb-3 mb-md-4">
          <Col xs={12} md={8} className="text-center">
            <h1 className="display-5 display-md-4 fw-bold text-dark mb-2 mb-md-3">
              Calendario de Reservas
            </h1>
            <p className="lead text-muted">Visualiza y gestiona todas las reservas de salas</p>
          </Col>
        </Row>

        <div className="leyenda-colores mb-3 mb-md-4">
          {Object.keys(salasPorUbicacion).map((nave) => (
            <div key={nave} className="leyenda-item">
              <div
                className="leyenda-color"
                style={{ backgroundColor: getColorPorUbicacion(nave) }}
              />
              <span className="leyenda-texto">{nave}</span>
            </div>
          ))}
        </div>

        <div className="calendario-filtros mb-3 mb-md-4">
          <Row>
            <Col xs={12} md={6} className="mb-3 mb-md-0">
              <Form.Label className="d-flex align-items-center">
                <Building className="me-2" size={16} />
                Ubicación
              </Form.Label>
              <Form.Select
                value={ubicacionSeleccionada}
                onChange={(e) => {
                  setUbicacionSeleccionada(e.target.value);
                  setSalaSeleccionada('');
                }}
                className="shadow-sm"
              >
                <option value="">Todas las ubicaciones</option>
                {naves.map((ubicacion) => (
                  <option key={ubicacion} value={ubicacion}>
                    {ubicacion}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col xs={12} md={6}>
              <Form.Label className="d-flex align-items-center">
                <DoorOpen className="me-2" size={16} />
                Sala
              </Form.Label>
              <Form.Select
                value={salaSeleccionada}
                onChange={(e) => setSalaSeleccionada(e.target.value)}
                disabled={!ubicacionSeleccionada}
                className="shadow-sm"
              >
                <option value="">Todas las salas</option>
                {ubicacionSeleccionada && salasPorUbicacion[ubicacionSeleccionada]?.map((sala) => (
                  <option key={sala} value={sala}>
                    {sala}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        </div>

        <div className="calendario-wrapper">
          <Calendar
            localizer={localizer}
            events={eventosFiltrados}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            view={vista}
            onView={setVista}
            date={fechaActual}
            onNavigate={setFechaActual}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            min={new Date(0, 0, 0, 7, 0, 0)}
            max={new Date(0, 0, 0, 20, 0, 0)}
            step={15}
            timeslots={1}
            messages={{
              next: <ChevronRight size={20} />,
              previous: <ChevronLeft size={20} />,
              today: "Hoy",
              month: "Mes",
              week: "Semana",
              day: "Día",
              agenda: "Agenda",
              date: "Fecha",
              time: "Hora",
              event: "Evento",
            }}
            formats={{
              dateFormat: 'D',
              dayFormat: 'dddd D',
              monthHeaderFormat: 'MMMM [de] YYYY',
              dayHeaderFormat: 'dddd D [de] MMMM',
              dayRangeHeaderFormat: ({ start, end }) =>
                `${moment(start).format('D [de] MMMM')} - ${moment(end).format('D [de] MMMM')}`,
              timeGutterFormat: 'h:mm A',
              eventTimeRangeFormat: ({ start, end }) =>
                `${moment(start).format('h:mm A')} - ${moment(end).format('h:mm A')}`
            }}
            culture="es"
          />
        </div>

        {/* Modal de detalles */}
        <Modal show={mostrarModal} onHide={cerrarModal} centered>
          <Modal.Header closeButton>
            <Modal.Title className="d-flex align-items-center">
              <CalendarCheck className="me-2" size={24} />
              Detalles de la Reserva
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {reservaSeleccionada && (
              <div>
                <p className="d-flex align-items-center">
                  <Building className="me-2" size={16} />
                  <strong>Ubicación:</strong> {reservaSeleccionada.ubicacion}
                </p>
                <p className="d-flex align-items-center">
                  <DoorOpen className="me-2" size={16} />
                  <strong>Sala:</strong> {reservaSeleccionada.sala}
                </p>
                <p className="d-flex align-items-center">
                  <Person className="me-2" size={16} />
                  <strong>Usuario:</strong> {reservaSeleccionada.nombre}
                </p>
                <p className="d-flex align-items-center">
                  <InfoCircle className="me-2" size={16} />
                  <strong>Motivo:</strong> {reservaSeleccionada.motivo}
                </p>
                <p className="d-flex align-items-center">
                  <CalendarIcon className="me-2" size={16} />
                  <strong>Fecha:</strong> {moment(reservaSeleccionada.start).format("LL")}
                </p>
                <p className="d-flex align-items-center">
                  <Clock className="me-2" size={16} />
                  <strong>Hora Inicio:</strong> {moment(reservaSeleccionada.start).format("LT")}
                </p>
                <p className="d-flex align-items-center">
                  <Clock className="me-2" size={16} />
                  <strong>Hora Fin:</strong> {moment(reservaSeleccionada.end).format("LT")}
                </p>
                {reservaSeleccionada.invitados && reservaSeleccionada.invitados.length > 0 && (
                  <p className="d-flex align-items-center">
                    <People className="me-2" size={16} />
                    <strong>Invitados:</strong> {reservaSeleccionada.invitados.join(", ")}
                  </p>
                )}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={cerrarModal}>
              Cerrar
            </Button>
            <Button variant="primary" onClick={() => solicitarPassword("editar")}>
              Editar
            </Button>
            <Button variant="danger" onClick={() => solicitarPassword("eliminar")}>
              Eliminar
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal de contraseña */}
        <Modal show={mostrarModalPassword} onHide={() => setMostrarModalPassword(false)} centered>
          <Modal.Header closeButton className="bg-light">
            <Modal.Title className="fw-bold d-flex align-items-center">
              <Key className="me-2" size={20} />
              Confirmar acción
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="p-3">
              <label className="form-label fw-bold">Ingrese la contraseña</label>
              <input
                type="password"
                className="form-control shadow-sm"
                placeholder="Contraseña"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" className="shadow-sm" onClick={() => setMostrarModalPassword(false)}>
              Cancelar
            </Button>
            <Button variant="primary" className="shadow-sm" onClick={confirmarAccion}>
              Confirmar
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal de edición */}
        <Modal show={mostrarModalEdicion} onHide={() => setMostrarModalEdicion(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title className="d-flex align-items-center">
              <CalendarCheck className="me-2" size={24} />
              Editar Reserva
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form>
              <div className="mb-3">
                <label className="form-label d-flex align-items-center">
                  <CalendarIcon className="me-2" size={16} />
                  Fecha
                </label>
                <input
                  type="date"
                  className="form-control shadow-sm"
                  name="fecha"
                  value={formularioEdicion.fecha}
                  onChange={handleChangeEdicion}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label d-flex align-items-center">
                  <Clock className="me-2" size={16} />
                  Hora de inicio
                </label>
                <Form.Group controlId="horaInicio">
                  <Form.Select
                    value={formularioEdicion.horaInicio}
                    onChange={(e) => setFormularioEdicion({ ...formularioEdicion, horaInicio: e.target.value })}
                    required
                    className="shadow-sm"
                  >
                    <option value="">Selecciona una hora</option>
                    {horariosDisponibles.length > 0 ? 
                      horariosDisponibles.map((opcion) => (
                        <option 
                          key={opcion.value} 
                          value={opcion.value} 
                          disabled={!opcion.disponible && opcion.value !== formularioEdicion.horaInicio}
                          style={!opcion.disponible && opcion.value !== formularioEdicion.horaInicio ? {color: '#aaa'} : {}}
                        >
                          {opcion.label} {!opcion.disponible && opcion.value !== formularioEdicion.horaInicio ? '(No disponible)' : ''}
                        </option>
                      )) : 
                      generarOpcionesHora().map((opcion) => (
                        <option key={opcion.value} value={opcion.value}>
                          {opcion.label}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="mb-3">
                <label className="form-label d-flex align-items-center">
                  <Clock className="me-2" size={16} />
                  Hora de fin
                </label>
                <Form.Group controlId="horaFin">
                  <Form.Select
                    value={formularioEdicion.horaFin}
                    onChange={(e) => setFormularioEdicion({ ...formularioEdicion, horaFin: e.target.value })}
                    required
                    className="shadow-sm"
                  >
                    <option value="">Selecciona una hora</option>
                    {horariosDisponibles.length > 0 ? 
                      horariosDisponibles.map((opcion) => (
                        <option 
                          key={opcion.value} 
                          value={opcion.value} 
                          disabled={!opcion.disponible && opcion.value !== formularioEdicion.horaFin}
                          style={!opcion.disponible && opcion.value !== formularioEdicion.horaFin ? {color: '#aaa'} : {}}
                        >
                          {opcion.label} {!opcion.disponible && opcion.value !== formularioEdicion.horaFin ? '(No disponible)' : ''}
                        </option>
                      )) : 
                      generarOpcionesHora().map((opcion) => (
                        <option key={opcion.value} value={opcion.value}>
                          {opcion.label}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="mb-3">
                <label className="form-label d-flex align-items-center">
                  <Building className="me-2" size={16} />
                  Nave
                </label>
                <select
                  className="form-select shadow-sm"
                  name="ubicacion"
                  value={formularioEdicion.ubicacion}
                  onChange={handleChangeEdicion}
                  required
                >
                  <option value="">Seleccionar nave</option>
                  {Object.keys(salasPorUbicacion).map((ubicacion) => (
                    <option key={ubicacion} value={ubicacion}>{ubicacion}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label d-flex align-items-center">
                  <DoorOpen className="me-2" size={16} />
                  Sala
                </label>
                <select
                  className="form-select shadow-sm"
                  name="sala"
                  value={formularioEdicion.sala}
                  onChange={handleChangeEdicion}
                  required
                >
                  <option value="">Seleccionar sala</option>
                  {salasPorUbicacion[formularioEdicion.ubicacion]?.map((sala) => (
                    <option key={sala} value={sala}>{sala}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label d-flex align-items-center">
                  <InfoCircle className="me-2" size={16} />
                  Motivo
                </label>
                <input
                  type="text"
                  className="form-control shadow-sm"
                  name="motivo"
                  value={formularioEdicion.motivo}
                  onChange={handleChangeEdicion}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label d-flex align-items-center">
                  <People className="me-2" size={16} />
                  Invitados (separados por comas)
                </label>
                <input
                  type="text"
                  className="form-control shadow-sm"
                  name="invitados"
                  value={formularioEdicion.invitados.join(", ")}
                  onChange={(e) => {
                    const invitados = e.target.value.split(",").map(email => email.trim());
                    setFormularioEdicion(prev => ({ ...prev, invitados }));
                  }}
                />
              </div>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setMostrarModalEdicion(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleEditarReserva}>
              Guardar Cambios
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default Calendario;
