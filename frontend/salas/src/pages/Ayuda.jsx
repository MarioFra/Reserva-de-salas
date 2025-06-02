// src/pages/Ayuda.jsx
import { useState } from "react";
import { Container, Row, Col, Accordion, Card } from "react-bootstrap";
import {
  CalendarEvent,
  Lock,
  Gear,
  CalendarCheck
} from "react-bootstrap-icons";

const Ayuda = () => {
  const [activeKey, setActiveKey] = useState("0");

  const faqs = {
    "Reservas": {
      icon: <CalendarCheck className="me-2" />,
      preguntas: [
        {
          pregunta: "¿Cómo puedo crear una nueva reserva?",
          respuesta: "Para crear una reserva, sigue estos pasos:\n1. Ve a la página de 'Reservar sala'\n2. Selecciona la nave y sala deseada\n3. Elige la fecha y hora de inicio y fin\n4. Completa tus datos personales\n5. Ingresa una contraseña para gestionar tu reserva\n6. Haz clic en 'Crear Reserva'"
        },
        {
          pregunta: "¿Puedo modificar una reserva después de crearla?",
          respuesta: "Sí, puedes modificar tu reserva siguiendo estos pasos:\n1. Ve al calendario\n2. Haz clic en tu reserva\n3. Selecciona 'Editar'\n4. Ingresa tu contraseña\n5. Realiza los cambios necesarios\n6. Guarda los cambios"
        },
        {
          pregunta: "¿Cómo puedo cancelar una reserva?",
          respuesta: "Para cancelar una reserva:\n1. Ve al calendario\n2. Haz clic en tu reserva\n3. Selecciona 'Eliminar'\n4. Ingresa tu contraseña\n5. Confirma la eliminación"
        }
      ]
    },
    "Calendario": {
      icon: <CalendarEvent className="me-2" />,
      preguntas: [
        {
          pregunta: "¿Cómo puedo ver las reservas en el calendario?",
          respuesta: "El calendario muestra todas las reservas activas. Puedes:\n1. Ver todas las reservas\n2. Filtrar por nave específica\n3. Filtrar por sala específica\n4. Cambiar entre vista mensual, semanal o diaria"
        },
        {
          pregunta: "¿Qué significan los diferentes colores en el calendario?",
          respuesta: "Los colores en el calendario representan diferentes naves:\n- Azul: Nave 1\n- Verde turquesa: Nave 4"
        },
        {
          pregunta: "¿Cómo puedo navegar entre diferentes fechas?",
          respuesta: "Puedes navegar en el calendario de varias formas:\n1. Usar los botones 'Anterior' y 'Siguiente'\n2. Hacer clic en 'Hoy' para ver la fecha actual\n3. Usar la vista mensual para ver un mes completo\n4. Usar la vista semanal o diaria para un detalle más específico"
        }
      ]
    },
    "Seguridad": {
      icon: <Lock className="me-2" />,
      preguntas: [
        {
          pregunta: "¿Por qué necesito una contraseña para mis reservas?",
          respuesta: "La contraseña es necesaria para:\n1. Proteger tus reservas de modificaciones no autorizadas\n2. Permitirte editar o cancelar tus reservas"
        },
        {
          pregunta: "¿Qué hago si olvido mi contraseña?",
          respuesta: "Si olvidas tu contraseña:\n1. Podras visualizarla en el correo de confirmacion con el que te registraste la reservacion."
        }
      ]
    },
    "Sistema": {
      icon: <Gear className="me-2" />,
      preguntas: [
        {
          pregunta: "¿Cuáles son los horarios disponibles para reservar?",
          respuesta: "Las salas están disponibles:\n- De lunes a viernes\n- De 7:00 AM a 7:00 PM"
        },
        {
          pregunta: "¿Puedo invitar a otras personas a mi reunión?",
          respuesta: "Sí, al crear o editar una reserva puedes:\n1. Agregar el correo de los invitados\n2. El sistema enviará notificaciones automáticas\n3. Los invitados recibirán los detalles de la reunión"
        },
        {
          pregunta: "¿Qué hago si tengo un problema técnico?",
          respuesta: "Si encuentras algún problema:\n1. Intenta recargar la página\n2. Limpia la caché del navegador\n3. Si el problema persiste, contacta al soporte técnico"
        }
      ]
    }
  };

  return (
    <div className="ayuda-container" style={{
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      minHeight: '100vh',
      padding: '2rem 0'
    }}>
      <Container className="mt-5 mb-5">
        <Row className="justify-content-center mb-4">
          <Col md={8} className="text-center">
            <h1 className="display-4 fw-bold text-dark mb-3">Ayuda</h1>
            <p className="lead text-muted">Encuentra respuestas a tus preguntas frecuentes</p>
          </Col>
        </Row>

        <Row className="justify-content-center">
          <Col md={10}>
            <Card className="border-0 shadow-lg" style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '15px'
            }}>
              <Accordion activeKey={activeKey} onSelect={(e) => setActiveKey(e)}>
                {Object.entries(faqs).map(([categoria, data], index) => (
                  <Card key={index} className="mb-3 border-0 shadow-sm">
                    <Accordion.Item eventKey={index.toString()} className="border-0">
                      <Accordion.Header className="fw-bold py-3">
                        <div className="d-flex align-items-center">
                          {data.icon}
                          <span>{categoria}</span>
                        </div>
                      </Accordion.Header>
                      <Accordion.Body className="py-4">
                        {data.preguntas.map((faq, faqIndex) => (
                          <div key={faqIndex} className="mb-4">
                            <h5 className="text-primary mb-3">
                              <i className="bi bi-question-circle me-2"></i>
                              {faq.pregunta}
                            </h5>
                            <div className="ps-4">
                              <p className="text-muted" style={{ whiteSpace: 'pre-line' }}>
                                {faq.respuesta}
                              </p>
                            </div>
                          </div>
                        ))}
                      </Accordion.Body>
                    </Accordion.Item>
                  </Card>
                ))}
              </Accordion>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Ayuda;
