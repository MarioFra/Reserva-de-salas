import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Card, Alert, Modal } from "react-bootstrap";
import {
  Building,
  DoorOpen,
  Calendar,
  Clock,
  Person,
  Envelope,
  InfoCircle,
  People,
  Key,
  PlusCircle,
  CheckCircle,
  XCircle
} from "react-bootstrap-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale, setDefaultLocale } from "react-datepicker";
import es from "date-fns/locale/es";
import "../styles/ReservarSala.css";

// Registrar el locale en español
registerLocale("es", es);
setDefaultLocale("es");

const ReservarSala = () => {
  const [formData, setFormData] = useState({
    ubicacion: '',
    sala: '',
    fecha: '',
    horaInicio: '',
    horaFin: '',
    nombre: '',
    correo: '',
    motivo: '',
    telefono: '',
    invitados: [],
    contraseña: ''
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [reservasExistentes, setReservasExistentes] = useState([]);
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [horaInicioSeleccionada, setHoraInicioSeleccionada] = useState(null);
  const [horaFinSeleccionada, setHoraFinSeleccionada] = useState(null);
  const [salas, setSalas] = useState([]);
  const [navesDisponibles, setNavesDisponibles] = useState([]);
  const [salasPorUbicacion, setSalasPorUbicacion] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [invitadoActual, setInvitadoActual] = useState('');

  // Generar opciones de hora de 7:00 AM a 7:00 PM con intervalos de 15 minutos
  const generarOpcionesHora = () => {
    const opciones = [];
    for (let hora = 7; hora <= 19; hora++) {
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

  const opcionesHora = generarOpcionesHora();

  // Cargar salas y ubicaciones cuando se carga la página
  useEffect(() => {
    const cargarSalas = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/rooms');
        // Salas obtenidas exitosamente
        const salas = response.data;

        // Agrupar salas por ubicación
        const salasPorUbicacion = salas.reduce((acc, sala) => {
          if (!acc[sala.ubicacion]) {
            acc[sala.ubicacion] = [];
          }
          acc[sala.ubicacion].push(sala.nombre);
          return acc;
        }, {});

        setSalasPorUbicacion(salasPorUbicacion);
      } catch (error) {
        console.error('Error al cargar las salas:', error);
        setError('Error al cargar las salas disponibles');
      }
    };

    cargarSalas();
  }, []);

  // Filtrar salas por ubicación seleccionada
  const salasFiltradas = salas.filter(sala => sala.ubicacion === formData.ubicacion);
  // Salas filtradas según criterios

  // Cargar reservas existentes cuando se selecciona una ubicación y sala
  useEffect(() => {
    const cargarReservas = async () => {
      if (formData.ubicacion && formData.sala && formData.fecha) {
        try {
          const response = await axios.get(`http://localhost:5000/api/reservations`, {
            params: {
              ubicacion: formData.ubicacion,
              sala: formData.sala,
              fecha: formData.fecha
            }
          });
          setReservasExistentes(response.data);
          actualizarHorariosDisponibles(response.data);
        } catch (error) {
          console.error('Error al cargar reservas:', error);
        }
      }
    };

    cargarReservas();
  }, [formData.ubicacion, formData.sala, formData.fecha]);

  const actualizarHorariosDisponibles = (reservas) => {
    const horarios = opcionesHora.map(hora => {
      const horaActual = moment(hora.value, 'HH:mm');

      // Verificar si la hora actual es el inicio de una reserva existente
      const esInicioDeReserva = reservas.some(reserva =>
        moment(reserva.horaInicio, 'HH:mm').isSame(horaActual)
      );

      // Verificar si la hora actual está dentro de una reserva existente
      const estaDentroDeReserva = reservas.some(reserva => {
        const reservaInicio = moment(reserva.horaInicio, 'HH:mm');
        const reservaFin = moment(reserva.horaFin, 'HH:mm');
        return horaActual.isBetween(reservaInicio, reservaFin, null, '[]');
      });

      // Verificar si la hora actual es el fin de una reserva existente
      const esFinDeReserva = reservas.some(reserva =>
        moment(reserva.horaFin, 'HH:mm').isSame(horaActual)
      );

      return {
        ...hora,
        disponible: !estaDentroDeReserva,
        esInicioDeReserva,
        esFinDeReserva
      };
    });
    setHorariosDisponibles(horarios);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Si se cambia la ubicación, limpiar la sala seleccionada
    if (name === 'ubicacion') {
      setFormData(prev => ({
        ...prev,
        sala: ''
      }));
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    const fechaFormateada = moment(date).format('YYYY-MM-DD');
    setFormData(prev => ({
      ...prev,
      fecha: fechaFormateada
    }));
    setShowTimePicker(true);
  };

  const handleTimeSelect = (hora) => {
    if (!horaInicioSeleccionada) {
      // Si no hay hora de inicio seleccionada, establecerla
      setHoraInicioSeleccionada(hora);
      setFormData(prev => ({
        ...prev,
        horaInicio: hora.value
      }));
    } else if (!horaFinSeleccionada) {
      // Si ya hay hora de inicio pero no hora final
      const horaInicioMoment = moment(horaInicioSeleccionada.value, 'HH:mm');
      const horaFinMoment = moment(hora.value, 'HH:mm');

      if (horaFinMoment.isBefore(horaInicioMoment)) {
        setError("La hora final debe ser posterior a la hora de inicio");
        return;
      }

      // Verificar que todas las horas intermedias estén disponibles
      const todasDisponibles = verificarDisponibilidadRango(horaInicioSeleccionada.value, hora.value);
      if (!todasDisponibles) {
        setError("No todas las horas en el rango seleccionado están disponibles");
        return;
      }

      setHoraFinSeleccionada(hora);
      setFormData(prev => ({
        ...prev,
        horaFin: hora.value
      }));
    } else {
      // Si ya hay ambas horas seleccionadas, reiniciar la selección
      setHoraInicioSeleccionada(hora);
      setHoraFinSeleccionada(null);
      setFormData(prev => ({
        ...prev,
        horaInicio: hora.value,
        horaFin: ""
      }));
    }
  };

  const verificarDisponibilidadRango = (inicio, fin) => {
    const inicioMoment = moment(inicio, 'HH:mm');
    const finMoment = moment(fin, 'HH:mm');

    // Obtener todas las horas en el rango
    const horasEnRango = [];
    let horaActual = inicioMoment.clone();

    while (horaActual.isSameOrBefore(finMoment)) {
      horasEnRango.push(horaActual.format('HH:mm'));
      horaActual.add(15, 'minutes');
    }

    // Verificar que todas las horas estén disponibles
    return horasEnRango.every(hora => {
      const horario = horariosDisponibles.find(h => h.value === hora);
      // Permitir que la hora de inicio sea el fin de una reserva anterior
      if (hora === inicio && horario?.esFinDeReserva) {
        return true;
      }
      return horario && horario.disponible;
    });
  };

  const resetTimeSelection = () => {
    setHoraInicioSeleccionada(null);
    setHoraFinSeleccionada(null);
    setFormData(prev => ({
      ...prev,
      horaInicio: "",
      horaFin: ""
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validar campos requeridos
    if (!formData.ubicacion || !formData.sala || !formData.fecha ||
      !formData.horaInicio || !formData.horaFin || !formData.nombre ||
      !formData.correo || !formData.motivo || !formData.contraseña) {
      setError('Por favor complete todos los campos requeridos');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/reservations', {
        ubicacion: formData.ubicacion,
        sala: formData.sala,
        fecha: formData.fecha,
        horaInicio: formData.horaInicio,
        horaFin: formData.horaFin,
        nombre: formData.nombre,
        correo: formData.correo,
        motivo: formData.motivo,
        telefono: formData.telefono || '',
        invitados: formData.invitados,
        contraseña: formData.contraseña,
        estado: 'activa'
      });

      if (response.status === 201) {
        setShowSuccessModal(true);
        setFormData({
          ubicacion: '',
          sala: '',
          fecha: '',
          horaInicio: '',
          horaFin: '',
          nombre: '',
          correo: '',
          motivo: '',
          telefono: '',
          invitados: [],
          contraseña: ''
        });
        setInvitadoActual('');
      }
    } catch (error) {
      console.error('Error al crear la reservación:', error);
      if (error.response) {
        setError(error.response.data.message || 'Error al crear la reservación. Por favor, intente nuevamente.');
      } else if (error.request) {
        setError('No se pudo conectar con el servidor. Por favor, intente nuevamente.');
      } else {
        setError('Error al procesar la solicitud. Por favor, intente nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarInvitado = () => {
    if (invitadoActual && !formData.invitados.includes(invitadoActual)) {
      setFormData(prev => ({
        ...prev,
        invitados: [...prev.invitados, invitadoActual]
      }));
      setInvitadoActual('');
    }
  };

  const handleEliminarInvitado = (index) => {
    setFormData(prev => ({
      ...prev,
      invitados: prev.invitados.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="reservar-sala-container" style={{
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      minHeight: '100vh',
      padding: '2rem 0'
    }}>
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Card className="shadow">
              <Card.Body>
                <h2 className="text-center mb-4">Reservar Sala</h2>
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          <Building className="me-2" />
                          Ubicación
                        </Form.Label>
                        <Form.Select
                          name="ubicacion"
                          value={formData.ubicacion}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Selecciona una ubicación</option>
                          {Object.keys(salasPorUbicacion).map((ubicacion) => (
                            <option key={ubicacion} value={ubicacion}>
                              {ubicacion}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          <DoorOpen className="me-2" />
                          Sala
                        </Form.Label>
                        <Form.Select
                          name="sala"
                          value={formData.sala}
                          onChange={handleChange}
                          required
                          disabled={!formData.ubicacion}
                        >
                          <option value="">Selecciona una sala</option>
                          {formData.ubicacion && salasPorUbicacion[formData.ubicacion]?.map((sala) => (
                            <option key={sala} value={sala}>
                              {sala}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  {formData.ubicacion && formData.sala && (
                    <Row className="mb-4">
                      <Col>
                        <Form.Group>
                          <Form.Label className="d-flex align-items-center fw-bold">
                            <Calendar className="me-2" size={16} />
                            Fecha
                          </Form.Label>
                          <DatePicker
                            selected={selectedDate}
                            onChange={handleDateChange}
                            locale={es}
                            dateFormat="dd/MM/yyyy"
                            minDate={new Date()}
                            className="form-control shadow-sm"
                            placeholderText="Selecciona una fecha"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  )}

                  {showTimePicker && (
                    <Row className="mb-4">
                      <Col>
                        <Form.Label className="d-flex align-items-center fw-bold">
                          <Clock className="me-2" size={16} />
                          Selecciona el rango de horario de la reserva
                        </Form.Label>
                        <div className="mb-3">
                          {horaInicioSeleccionada && (
                            <div className="d-flex align-items-center mb-2">
                              <span className="me-2">Hora de inicio:</span>
                              <span className="badge bg-primary">{horaInicioSeleccionada.label}</span>
                            </div>
                          )}
                          {horaFinSeleccionada && (
                            <div className="d-flex align-items-center mb-2">
                              <span className="me-2">Hora de fin:</span>
                              <span className="badge bg-success">{horaFinSeleccionada.label}</span>
                            </div>
                          )}
                          {(horaInicioSeleccionada || horaFinSeleccionada) && (
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={resetTimeSelection}
                              className="mb-3"
                            >
                              Reiniciar selección
                            </Button>
                          )}
                        </div>
                        <div className="horarios-grid">
                          {horariosDisponibles.map((hora) => {
                            const isSelected = horaInicioSeleccionada?.value === hora.value ||
                              horaFinSeleccionada?.value === hora.value;
                            const isInRange = horaInicioSeleccionada && horaFinSeleccionada &&
                              moment(hora.value, 'HH:mm').isBetween(
                                moment(horaInicioSeleccionada.value, 'HH:mm'),
                                moment(horaFinSeleccionada.value, 'HH:mm'),
                                null,
                                '[]'
                              );

                            let variant = "outline-primary";
                            if (isSelected) {
                              variant = "primary";
                            } else if (isInRange) {
                              variant = "info";
                            } else if (!hora.disponible) {
                              variant = "outline-secondary";
                            } else if (hora.esFinDeReserva) {
                              variant = "outline-success";
                            }

                            return (
                              <Button
                                key={hora.value}
                                variant={variant}
                                className={`horario-btn ${!hora.disponible && !hora.esFinDeReserva ? 'disabled' : ''}`}
                                onClick={() => (hora.disponible || hora.esFinDeReserva) && handleTimeSelect(hora)}
                                disabled={!hora.disponible && !hora.esFinDeReserva}
                              >
                                {hora.label}
                                {hora.disponible ? (
                                  <CheckCircle className="ms-2" size={16} />
                                ) : hora.esFinDeReserva ? (
                                  <CheckCircle className="ms-2" size={16} />
                                ) : (
                                  <XCircle className="ms-2" size={16} />
                                )}
                              </Button>
                            );
                          })}
                        </div>
                      </Col>
                    </Row>
                  )}

                  <Row className="mb-4">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="d-flex align-items-center fw-bold">
                          <Person className="me-2" size={16} />
                          Nombre
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleChange}
                          required
                          className="shadow-sm"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="d-flex align-items-center fw-bold">
                          <Envelope className="me-2" size={16} />
                          Correo
                        </Form.Label>
                        <Form.Control
                          type="email"
                          name="correo"
                          value={formData.correo}
                          onChange={handleChange}
                          required
                          className="shadow-sm"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mb-4">
                    <Col>
                      <Form.Group>
                        <Form.Label className="d-flex align-items-center fw-bold">
                          <InfoCircle className="me-2" size={16} />
                          Motivo
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          name="motivo"
                          value={formData.motivo}
                          onChange={handleChange}
                          required
                          className="shadow-sm"
                          rows={3}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mb-4">
                    <Col>
                      <Form.Group>
                        <Form.Label className="d-flex align-items-center fw-bold">
                          <Key className="me-2" size={16} />
                          Contraseña
                        </Form.Label>
                        <Form.Control
                          type="password"
                          name="contraseña"
                          value={formData.contraseña}
                          onChange={handleChange}
                          required
                          className="shadow-sm"
                          placeholder="Ingresa una contraseña para gestionar tu reserva"
                        />
                        <Form.Text className="text-muted">
                          Esta contraseña te permitirá gestionar tu reserva posteriormente
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mb-4">
                    <Col>
                      <Form.Group>
                        <Form.Label className="d-flex align-items-center fw-bold">
                          <People className="me-2" size={16} />
                          Invitados
                        </Form.Label>
                        <div className="d-flex mb-2">
                          <Form.Control
                            type="email"
                            value={invitadoActual}
                            onChange={(e) => setInvitadoActual(e.target.value)}
                            className="shadow-sm me-2"
                            placeholder="Ingresa el correo del invitado"
                          />
                          <Button
                            variant="outline-primary"
                            onClick={handleAgregarInvitado}
                            disabled={!invitadoActual}
                          >
                            Agregar
                          </Button>
                        </div>
                        {formData.invitados.length > 0 && (
                          <div className="mt-2">
                            <h6>Invitados agregados:</h6>
                            <ul className="list-group">
                              {formData.invitados.map((invitado, index) => (
                                <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                  {invitado}
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => handleEliminarInvitado(index)}
                                  >
                                    Eliminar
                                  </Button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="text-center">
                    <Button
                      variant="primary"
                      type="submit"
                      className="px-4 py-2"
                      disabled={!formData.horaInicio || !formData.horaFin || !formData.contraseña}
                    >
                      <PlusCircle className="me-2" size={20} />
                      Crear Reserva
                    </Button>
                  </div>

                  {error && (
                    <Alert variant="danger" className="mt-3">
                      {error}
                    </Alert>
                  )}

                  {success && (
                    <Alert variant="success" className="mt-3">
                      {success}
                    </Alert>
                  )}
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Modal de Éxito */}
      <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)} centered>
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>¡Reserva Creada!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <CheckCircle size={48} className="text-success mb-3" />
            <h5>Tu reserva ha sido creada exitosamente</h5>
            <p className="mb-0">Se ha enviado un correo de confirmación a tu dirección de email.</p>
            {formData.invitados.length > 0 && (
              <p className="mt-2 mb-0">
                Se han enviado invitaciones a {formData.invitados.length} {formData.invitados.length === 1 ? 'invitado' : 'invitados'}.
              </p>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={() => setShowSuccessModal(false)}>
            Aceptar
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx="true">{`
        .horarios-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 10px;
          margin-top: 10px;
        }

        .horario-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .horario-btn:hover:not(.disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .horario-btn.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default ReservarSala;
