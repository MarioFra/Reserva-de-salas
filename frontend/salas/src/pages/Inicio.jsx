// App.jsx
import React from 'react';
import { Container, Row, Col, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  CalendarCheck,
  Calendar3,
  ClockHistory,
  ListCheck,
  InfoCircle,
  Building,
  DoorOpen,
  Clock,
  Person,
  Envelope,
  People,
  Key
} from "react-bootstrap-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Inicio.css";

const Inicio = () => {
  return (
    <div className="inicio-container">
      {/* Hero Section */}
      <div className="hero-section">
        <Container>
          <Row className="align-items-center min-vh-50">
            <Col className="text-center text-white">
              <h1 className="display-3 fw-bold mb-4 animate-fade-in">Sistema de reservas de salas</h1>
              <p className="lead mb-5 animate-fade-in-delay">
                Gestiona y reserva salas de reuniones de manera eficiente
              </p>
              <Link to="/reservar" className="btn btn-success hero-button animate-bounce">
                Crear Nueva Reserva
              </Link>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Sección de Servicios */}
      <Container className="mt-5 mb-5">
        <Row className="mb-5 justify-content-center">
          <Col xs={10} sm={8} md={6} lg={4} className="mb-4">
            <Link to="/reservar" className="text-decoration-none">
              <Card className="hover-card">
                <Card.Body className="d-flex flex-column align-items-center text-center">
                  <CalendarCheck className="icon-animate mb-3" size={40} />
                  <Card.Title>Reservar Sala</Card.Title>
                  <Card.Text>
                    Crea una nueva reserva seleccionando la nave, sala, fecha y horario disponible.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Link>
          </Col>

          <Col xs={10} sm={8} md={6} lg={4} className="mb-4">
            <Link to="/calendario" className="text-decoration-none">
              <Card className="hover-card">
                <Card.Body className="d-flex flex-column align-items-center text-center">
                  <Calendar3 className="icon-animate mb-3" size={40} />
                  <Card.Title>Ver Calendario</Card.Title>
                  <Card.Text>
                    Visualiza todas las reservas existentes en un calendario interactivo.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Link>
          </Col>

          <Col xs={10} sm={8} md={6} lg={4} className="mb-4">
            <Link to="/historial" className="text-decoration-none">
              <Card className="hover-card">
                <Card.Body className="d-flex flex-column align-items-center text-center">
                  <ClockHistory className="icon-animate mb-3" size={40} />
                  <Card.Title>Historial</Card.Title>
                  <Card.Text>
                    Consulta el historial completo de reservas realizadas.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Link>
          </Col>
        </Row>

        <Row className="justify-content-center">
          <Col xs={10} sm={8} md={6} lg={5} className="mb-4">
            <Card className="hover-card">
              <Card.Body>
                <Card.Title className="d-flex align-items-center mb-3">
                  <ListCheck className="me-2" size={24} />
                  Instrucciones de Uso
                </Card.Title>
                <ul className="list-unstyled">
                  <li>
                    <Building className="me-2" />
                    Selecciona la nave y sala deseada
                  </li>
                  <li>
                    <Clock className="me-2" />
                    Elige la fecha y horario disponible
                  </li>
                  <li>
                    <Person className="me-2" />
                    Completa tus datos personales
                  </li>
                  <li>
                    <Key className="me-2" />
                    Guarda tu contraseña para futuras modificaciones
                  </li>
                </ul>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={10} sm={8} md={6} lg={5} className="mb-4">
            <Card className="hover-card">
              <Card.Body>
                <Card.Title className="d-flex align-items-center mb-3">
                  <InfoCircle className="me-2" size={24} />
                  Información Importante
                </Card.Title>
                <ul className="list-unstyled">
                  <li>
                    <Clock className="me-2" />
                    Horario de reservas: 7:00 AM - 7:00 PM
                  </li>
                  <li>
                    <DoorOpen className="me-2" />
                    Las reservas se pueden modificar o cancelar
                  </li>
                  <li>
                    <Key className="me-2" />
                    Se requiere contraseña para modificaciones
                  </li>
                  <li>
                    <Envelope className="me-2" />
                    Contacto: 
                  </li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Inicio;
