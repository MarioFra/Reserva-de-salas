// src/pages/Historial.jsx
import React, { useState, useEffect } from "react";
import { Table, Button, Form, Row, Col, Card, Badge, Container, InputGroup, Pagination } from "react-bootstrap";
import {
  Building,
  DoorOpen,
  Calendar,
  Clock,
  Person,
  Envelope,
  People,
  InfoCircle,
  Filter,
  Search,
  FileEarmarkExcel,
  ArrowUp,
  ArrowDown
} from "react-bootstrap-icons";
import axios from "axios";
import moment from "moment";
import "moment/locale/es";

moment.locale("es");

const Historial = () => {
  const [reservas, setReservas] = useState([]);
  const [filtroUbicacion, setFiltroUbicacion] = useState("");
  const [filtroSala, setFiltroSala] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("dia");
  const [filtroFecha, setFiltroFecha] = useState("");
  const [loading, setLoading] = useState(true);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [salasPorUbicacion, setSalasPorUbicacion] = useState({});
  const [busqueda, setBusqueda] = useState("");
  const [ordenarPor, setOrdenarPor] = useState("fecha");
  const [ordenAscendente, setOrdenAscendente] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 10;

  useEffect(() => {
    const cargarUbicaciones = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/rooms');
        const salasData = response.data;

        // Extraer ubicaciones únicas y filtrar valores nulos o vacíos
        const ubicacionesUnicas = [...new Set(salasData.map(sala => sala.ubicacion))].filter(Boolean);
        setUbicaciones(ubicacionesUnicas);

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
        setSalasPorUbicacion(salasPorUbicacion);
      } catch (error) {
        console.error('Error al cargar las ubicaciones:', error);
      }
    };

    cargarUbicaciones();
  }, []);

  const obtenerReservasFiltradas = async () => {
    try {
      setLoading(true);
      let url = "http://localhost:5000/api/reservations";

      const params = new URLSearchParams();
      if (filtroUbicacion) params.append('ubicacion', filtroUbicacion);
      if (filtroSala) params.append('sala', filtroSala);
      if (filtroFecha) {
        params.append('fecha', filtroFecha);
        params.append('tipo', filtroTipo);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url);
      const reservasProcesadas = response.data.map(reserva => {
        try {
          const fecha = new Date(reserva.fecha);
          const fechaLocal = new Date(fecha.getTime() + fecha.getTimezoneOffset() * 60000);
          if (isNaN(fechaLocal.getTime())) {
            console.error("Fecha inválida en reserva:", reserva);
            return null;
          }
          return {
            ...reserva,
            fecha: fechaLocal
          };
        } catch (error) {
          console.error("Error al procesar reserva:", error);
          return null;
        }
      }).filter(reserva => reserva !== null);

      const reservasOrdenadas = reservasProcesadas.sort((a, b) =>
        new Date(b.fecha) - new Date(a.fecha)
      );

      setReservas(reservasOrdenadas);
    } catch (error) {
      console.error("Error al obtener las reservas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerReservasFiltradas();
  }, [filtroUbicacion, filtroSala, filtroFecha, filtroTipo]);

  const handleTipoFiltroChange = (e) => {
    setFiltroTipo(e.target.value);
    setFiltroFecha("");
  };

  const filtrarYOrdenarReservas = (reservas) => {
    let resultado = [...reservas];

    // Aplicar búsqueda
    if (busqueda) {
      const busquedaLower = busqueda.toLowerCase();
      resultado = resultado.filter(reserva =>
        reserva.nombre.toLowerCase().includes(busquedaLower) ||
        reserva.motivo.toLowerCase().includes(busquedaLower) ||
        reserva.correo.toLowerCase().includes(busquedaLower)
      );
    }

    // Aplicar ordenamiento
    resultado.sort((a, b) => {
      let valorA, valorB;
      switch (ordenarPor) {
        case "fecha":
          valorA = new Date(a.fecha);
          valorB = new Date(b.fecha);
          break;
        case "horaInicio":
          valorA = a.horaInicio;
          valorB = b.horaInicio;
          break;
        case "ubicacion":
          valorA = a.ubicacion;
          valorB = b.ubicacion;
          break;
        case "sala":
          valorA = a.sala;
          valorB = b.sala;
          break;
        case "nombre":
          valorA = a.nombre;
          valorB = b.nombre;
          break;
        default:
          valorA = a[ordenarPor];
          valorB = b[ordenarPor];
      }

      if (ordenAscendente) {
        return valorA > valorB ? 1 : -1;
      } else {
        return valorA < valorB ? 1 : -1;
      }
    });

    return resultado;
  };

  const exportarAExcel = () => {
    const reservasFiltradas = filtrarYOrdenarReservas(reservas);
    
    // Definir encabezados con nombres claros para cada columna
    const headers = ["Fecha", "Hora Inicio", "Hora Fin", "Ubicación", "Sala", "Nombre", "Correo", "Motivo"];
    
    // Preparar los datos asegurando que cada columna tenga el dato correcto
    const datos = reservasFiltradas.map(reserva => [
      moment(reserva.fecha).format("DD/MM/YYYY"), // Formato de fecha más estándar para Excel
      reserva.horaInicio,                        // Hora inicio en columna separada
      reserva.horaFin,                           // Hora fin en columna separada
      reserva.ubicacion,
      reserva.sala,
      reserva.nombre,
      reserva.correo,
      reserva.motivo
    ]);

    // Crear contenido CSV con manejo adecuado de comas y comillas para evitar problemas de formato
    const processValue = (val) => {
      if (val === null || val === undefined) return '';
      const strVal = String(val);
      // Si el valor contiene comas, comillas o saltos de línea, encerrarlo en comillas
      if (strVal.includes(',') || strVal.includes('"') || strVal.includes('\n')) {
        return `"${strVal.replace(/"/g, '""')}"`; // Escapar comillas duplicándolas
      }
      return strVal;
    };

    const csvContent = [
      headers.map(processValue).join(","),
      ...datos.map(row => row.map(processValue).join(","))
    ].join("\n");

    // Añadir BOM (Byte Order Mark) para que Excel reconozca correctamente los caracteres UTF-8
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `historial_reservas_${moment().format("YYYY-MM-DD")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOrdenar = (columna) => {
    if (ordenarPor === columna) {
      setOrdenAscendente(!ordenAscendente);
    } else {
      setOrdenarPor(columna);
      setOrdenAscendente(false);
    }
  };

  const reservasFiltradas = filtrarYOrdenarReservas(reservas);
  const totalPaginas = Math.ceil(reservasFiltradas.length / itemsPorPagina);
  const reservasPaginadas = reservasFiltradas.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  return (
    <div className="historial-container" style={{
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      minHeight: '100vh',
      padding: '1rem 0'
    }}>
      <Container className="mt-3 mt-md-5 mb-4 mb-md-5">
        <Row className="justify-content-center mb-3 mb-md-4">
          <Col xs={12} md={8} className="text-center">
            <h1 className="display-5 display-md-4 fw-bold text-dark mb-2 mb-md-3">Historial de Reservas</h1>
            <p className="lead text-muted">Revisa el historial de tus reservas anteriores</p>
          </Col>
        </Row>

        {/* Filtros */}
        <Card className="mb-3 mb-md-4 border-0 shadow-lg" style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '15px'
        }}>
          <Card.Body className="p-3 p-md-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center">
                <Filter className="me-2 text-primary" size={20} />
                <h5 className="mb-0">Filtros de Búsqueda</h5>
              </div>
              <Button
                variant="success"
                className="d-flex align-items-center"
                onClick={exportarAExcel}
              >
                <FileEarmarkExcel className="me-2" />
                Exportar a Excel
              </Button>
            </div>
            <Form>
              <Row className="mb-3">
                <Col xs={12}>
                  <InputGroup>
                    <InputGroup.Text>
                      <Search />
                    </InputGroup.Text>
                    <Form.Control
                      placeholder="Buscar por nombre, motivo o correo..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                    />
                  </InputGroup>
                </Col>
              </Row>
              <Row>
                <Col xs={12} md={3} className="mb-3 mb-md-0">
                  <Form.Group>
                    <Form.Label className="d-flex align-items-center">
                      <Building className="me-2" size={16} />
                      Ubicación
                    </Form.Label>
                    <Form.Select
                      value={filtroUbicacion}
                      onChange={(e) => {
                        setFiltroUbicacion(e.target.value);
                        setFiltroSala('');
                      }}
                      className="shadow-sm"
                    >
                      <option value="">Todas las ubicaciones</option>
                      {ubicaciones.map((ubicacion) => (
                        <option key={ubicacion} value={ubicacion}>{ubicacion}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs={12} md={3} className="mb-3 mb-md-0">
                  <Form.Group>
                    <Form.Label className="d-flex align-items-center">
                      <DoorOpen className="me-2" size={16} />
                      Sala
                    </Form.Label>
                    <Form.Select
                      value={filtroSala}
                      onChange={(e) => setFiltroSala(e.target.value)}
                      disabled={!filtroUbicacion}
                      className="shadow-sm"
                    >
                      <option value="">Todas las salas</option>
                      {filtroUbicacion && salasPorUbicacion[filtroUbicacion]?.map((sala) => (
                        <option key={sala} value={sala}>{sala}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs={12} md={3} className="mb-3 mb-md-0">
                  <Form.Group>
                    <Form.Label className="d-flex align-items-center">
                      <Calendar className="me-2" size={16} />
                      Tipo de Filtro
                    </Form.Label>
                    <Form.Select
                      value={filtroTipo}
                      onChange={handleTipoFiltroChange}
                      className="shadow-sm"
                    >
                      <option value="dia">Día</option>
                      <option value="semana">Semana</option>
                      <option value="mes">Mes</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs={12} md={3}>
                  <Form.Group>
                    <Form.Label className="d-flex align-items-center">
                      <Clock className="me-2" size={16} />
                      Fecha
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={filtroFecha}
                      onChange={(e) => setFiltroFecha(e.target.value)}
                      className="shadow-sm"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>

        {/* Tabla de reservas */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-3 text-muted">Cargando historial...</p>
          </div>
        ) : (
          <Card className="border-0 shadow-lg" style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '15px'
          }}>
            <Card.Body className="p-3 p-md-4">
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th onClick={() => handleOrdenar("fecha")} style={{ cursor: "pointer" }}>
                        <Calendar className="me-2" /> Fecha
                        {ordenarPor === "fecha" && (ordenAscendente ? <ArrowUp /> : <ArrowDown />)}
                      </th>
                      <th onClick={() => handleOrdenar("horaInicio")} style={{ cursor: "pointer" }}>
                        <Clock className="me-2" /> Horario
                        {ordenarPor === "horaInicio" && (ordenAscendente ? <ArrowUp /> : <ArrowDown />)}
                      </th>
                      <th onClick={() => handleOrdenar("ubicacion")} style={{ cursor: "pointer" }}>
                        <Building className="me-2" /> Ubicación
                        {ordenarPor === "ubicacion" && (ordenAscendente ? <ArrowUp /> : <ArrowDown />)}
                      </th>
                      <th onClick={() => handleOrdenar("sala")} style={{ cursor: "pointer" }}>
                        <DoorOpen className="me-2" /> Sala
                        {ordenarPor === "sala" && (ordenAscendente ? <ArrowUp /> : <ArrowDown />)}
                      </th>
                      <th onClick={() => handleOrdenar("nombre")} style={{ cursor: "pointer" }}>
                        <Person className="me-2" /> Nombre
                        {ordenarPor === "nombre" && (ordenAscendente ? <ArrowUp /> : <ArrowDown />)}
                      </th>
                      <th><Envelope className="me-2" /> Correo</th>
                      <th><InfoCircle className="me-2" /> Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservasPaginadas.map((reserva) => (
                      <tr key={reserva._id}>
                        <td>{moment(reserva.fecha).format("LL")}</td>
                        <td>{reserva.horaInicio} - {reserva.horaFin}</td>
                        <td>{reserva.ubicacion}</td>
                        <td>{reserva.sala}</td>
                        <td>{reserva.nombre}</td>
                        <td>{reserva.correo}</td>
                        <td>{reserva.motivo}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Paginación */}
              {totalPaginas > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination>
                    <Pagination.First
                      onClick={() => setPaginaActual(1)}
                      disabled={paginaActual === 1}
                    />
                    <Pagination.Prev
                      onClick={() => setPaginaActual(paginaActual - 1)}
                      disabled={paginaActual === 1}
                    />
                    {[...Array(totalPaginas)].map((_, index) => (
                      <Pagination.Item
                        key={index + 1}
                        active={index + 1 === paginaActual}
                        onClick={() => setPaginaActual(index + 1)}
                      >
                        {index + 1}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next
                      onClick={() => setPaginaActual(paginaActual + 1)}
                      disabled={paginaActual === totalPaginas}
                    />
                    <Pagination.Last
                      onClick={() => setPaginaActual(totalPaginas)}
                      disabled={paginaActual === totalPaginas}
                    />
                  </Pagination>
                </div>
              )}
            </Card.Body>
          </Card>
        )}
      </Container>
    </div>
  );
};

export default Historial;
