import React, { useState, useEffect } from 'react';
import { FaHome, FaDoorOpen, FaCalendarAlt, FaUsers, FaCog, FaChartBar, FaTools, FaEdit, FaTrash, FaPlus, FaSignOutAlt } from 'react-icons/fa';
import { IoMdNotifications } from 'react-icons/io';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/AdminDashboard.css';
import '../styles/AdminCalendar.css';
import { Container, Row, Col, Card, Button, Modal, Form, Table } from "react-bootstrap";
import axios from "axios";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import moment from 'moment';
import { Building, DoorOpen, Person, InfoCircle, CalendarCheck, ChevronRight, ChevronLeft, People, Clock, Calendar as CalendarIcon, Envelope, Key } from 'react-bootstrap-icons';
import Breadcrumbs from '../components/Breadcrumbs';
import { Calendar as BigCalendar, momentLocalizer, Views } from 'react-big-calendar';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';


const localizer = momentLocalizer(moment);

const DashboardContent = () => {
    const navigate = useNavigate();

    const handleNavigation = (section) => {
        navigate(`/admin/dashboard/${section}`);
    };

    return (
        <div className="dashboard-content">
            <div className="welcome-container">
                <div className="logo-container">
                    <img src="/src/assets/logo.png" alt="Logo de la Empresa" className="dashboard-logo" />
                </div>
                <div className="welcome-message">
                    <h1>Bienvenido al Sistema de Reservas</h1>
                    <p>Desde este panel podrás administrar todas las funcionalidades del sistema de reservas de salas de juntas.</p>
                    <p>Utiliza el menú lateral o los siguientes botones para acceder a las diferentes secciones:</p>
                    <div className="features-list">
                        <button
                            className="feature-button"
                            onClick={() => handleNavigation('salas')}
                        >
                            <FaDoorOpen /> Gestión de Salas
                        </button>
                        <button
                            className="feature-button"
                            onClick={() => handleNavigation('reservas')}
                        >
                            <FaCalendarAlt /> Gestión de Reservas
                        </button>
                        <button
                            className="feature-button"
                            onClick={() => handleNavigation('usuarios')}
                        >
                            <FaUsers /> Gestión de Usuarios
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const UsersContent = () => {
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: '',
        isActive: true
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch('http://localhost:5000/api/admin/admins', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al obtener los usuarios');
            }

            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            alert('Error al cargar los usuarios: ' + error.message);
        }
    };

    const handleAddUser = () => {
        setEditingUser(null);
        setFormData({
            nombre: '',
            email: '',
            password: '',
            isActive: true
        });
        setShowModal(true);
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setFormData({
            nombre: user.nombre,
            email: user.email,
            password: '',
            isActive: user.isActive
        });
        setShowModal(true);
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
            try {
                const token = localStorage.getItem('adminToken');
                const response = await fetch(`http://localhost:5000/api/admin/admins/${userId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error al eliminar el usuario');
                }

                setUsers(users.filter(user => user._id !== userId));
                alert('Usuario eliminado exitosamente');
            } catch (error) {
                console.error('Error:', error);
                alert('Error al eliminar el usuario: ' + error.message);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('adminToken');
            const url = editingUser
                ? `http://localhost:5000/api/admin/admins/${editingUser._id}`
                : 'http://localhost:5000/api/admin/admins/create';

            const method = editingUser ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    nombre: formData.nombre,
                    email: formData.email,
                    password: formData.password,
                    isActive: formData.isActive
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al guardar el usuario');
            }

            const updatedUser = await response.json();
            setShowModal(false);
            fetchUsers();
            alert(editingUser ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente');
        } catch (error) {
            console.error('Error:', error);
            alert('Error al guardar el usuario: ' + error.message);
        }
    };

    return (
        <div className="users-content">
            <div className="users-header">
                <h2>Gestión de Usuarios Administradores</h2>
                <button className="add-user-btn" onClick={handleAddUser}>
                    <FaPlus /> Agregar Usuario
                </button>
            </div>

            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id}>
                                <td>{user.nombre}</td>
                                <td>{user.email}</td>
                                <td>Administrador</td>
                                <td>
                                    <span className={`status ${user.isActive ? 'activo' : 'inactivo'}`}>
                                        {user.isActive ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td>
                                    <button
                                        className="action-btn edit"
                                        onClick={() => handleEditUser(user)}
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        className="action-btn delete"
                                        onClick={() => handleDeleteUser(user._id)}
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title className="d-flex align-items-center">
                        <FaUsers className="me-2" />
                        {editingUser ? "Editar Usuario" : "Agregar Nuevo Usuario"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="d-flex align-items-center">
                                        <Person className="me-2" size={16} />
                                        Nombre Completo
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                        placeholder="Ingrese el nombre completo"
                                        required
                                        className="shadow-sm"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="d-flex align-items-center">
                                        <Envelope className="me-2" size={16} />
                                        Correo Electrónico
                                    </Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="ejemplo@correo.com"
                                        required
                                        disabled={editingUser}
                                        className="shadow-sm"
                                    />
                                    <Form.Text className="text-muted">
                                        {editingUser ? "El correo no puede ser modificado" : "Este será el correo de acceso"}
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="d-flex align-items-center">
                                        <Key className="me-2" size={16} />
                                        Contraseña
                                    </Form.Label>
                                    <Form.Control
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder={editingUser ? "Dejar en blanco para mantener la actual" : "Ingrese la contraseña"}
                                        required={!editingUser}
                                        className="shadow-sm"
                                    />
                                    <Form.Text className="text-muted">
                                        {editingUser ? "Dejar en blanco para mantener la contraseña actual" : "Mínimo 8 caracteres"}
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="d-flex align-items-center">
                                        <FaCog className="me-2" size={16} />
                                        Estado
                                    </Form.Label>
                                    <Form.Select
                                        value={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                                        className="shadow-sm"
                                    >
                                        <option value={true}>Activo</option>
                                        <option value={false}>Inactivo</option>
                                    </Form.Select>
                                    <Form.Text className="text-muted">
                                        Los usuarios inactivos no pueden acceder al sistema
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>

                        {editingUser && (
                            <Row>
                                <Col md={12}>
                                    <div className="p-3 bg-light rounded">
                                        <h6 className="mb-2">Información del Usuario</h6>
                                        <p className="mb-1 small">
                                            <strong>Última actualización:</strong> {new Date().toLocaleDateString()}
                                        </p>
                                        <p className="mb-1 small">
                                            <strong>ID de Usuario:</strong> {editingUser._id}
                                        </p>
                                    </div>
                                </Col>
                            </Row>
                        )}
                    </Form>
                </Modal.Body>
                <Modal.Footer className="bg-light">
                    <Button variant="secondary" onClick={() => setShowModal(false)} className="px-4">
                        Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        className="px-4"
                        disabled={!formData.nombre || !formData.email || (!editingUser && !formData.password)}
                    >
                        {editingUser ? "Guardar Cambios" : "Crear Usuario"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

const RoomsContent = () => {
    const [rooms, setRooms] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        ubicacion: ''
    });

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch('http://localhost:5000/api/rooms', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al cargar las salas');
            }
            const data = await response.json();
            setRooms(data);
        } catch (error) {
            console.error('Error:', error);
            alert('Error al cargar las salas: ' + error.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('adminToken');
            const url = editingRoom
                ? `http://localhost:5000/api/rooms/${editingRoom._id}`
                : 'http://localhost:5000/api/rooms';

            const response = await fetch(url, {
                method: editingRoom ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al guardar la sala');
            }

            const data = await response.json();
            // Sala guardada exitosamente

            setShowModal(false);
            fetchRooms();
            setFormData({ nombre: '', ubicacion: '' });
            setEditingRoom(null);
            alert(editingRoom ? 'Sala actualizada exitosamente' : 'Sala creada exitosamente');
        } catch (error) {
            console.error('Error:', error);
            alert('Error: ' + error.message);
        }
    };

    const handleDelete = async (roomId) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar esta sala?')) {
            try {
                const token = localStorage.getItem('adminToken');
                const response = await fetch(`http://localhost:5000/api/rooms/${roomId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error al eliminar la sala');
                }
                fetchRooms();
                alert('Sala eliminada exitosamente');
            } catch (error) {
                console.error('Error:', error);
                alert('Error al eliminar la sala: ' + error.message);
            }
        }
    };

    const handleEdit = (room) => {
        setEditingRoom(room);
        setFormData({
            nombre: room.nombre,
            ubicacion: room.ubicacion
        });
        setShowModal(true);
    };

    return (
        <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Gestión de Salas</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        setEditingRoom(null);
                        setFormData({ nombre: '', ubicacion: '' });
                        setShowModal(true);
                    }}
                >
                    <FaPlus className="me-2" />
                    Agregar Sala
                </button>
            </div>

            <div className="table-responsive">
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Ubicación</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rooms.map((room) => (
                            <tr key={room._id}>
                                <td>{room.nombre}</td>
                                <td>{room.ubicacion}</td>
                                <td>
                                    <button
                                        className="btn btn-sm btn-primary me-2"
                                        onClick={() => handleEdit(room)}
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleDelete(room._id)}
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {editingRoom ? 'Editar Sala' : 'Agregar Sala'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Nombre</label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Ubicación</label>
                            <select
                                className="form-control"
                                value={formData.ubicacion}
                                onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                                required
                            >
                                <option value="">Seleccione una ubicación</option>
                                <option value="Nave 1">Nave 1</option>
                                <option value="Nave 4">Nave 4</option>
                            </select>
                        </div>
                        <div className="d-flex justify-content-end">
                            <button type="button" className="btn btn-secondary me-2" onClick={() => setShowModal(false)}>
                                Cancelar
                            </button>
                            <button type="submit" className="btn btn-primary">
                                {editingRoom ? 'Actualizar' : 'Crear'}
                            </button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

const ReservasContent = () => {
    const [reservas, setReservas] = useState([]);
    const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState("");
    const [salaSeleccionada, setSalaSeleccionada] = useState("");
    const [vista, setVista] = useState(Views.MONTH);
    const [fechaActual, setFechaActual] = useState(new Date());
    const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [salas, setSalas] = useState([]);
    const [horariosDisponibles, setHorariosDisponibles] = useState([]);
    const [reservasExistentesEdicion, setReservasExistentesEdicion] = useState([]);
    const [formData, setFormData] = useState({
        motivo: '',
        horaInicio: '',
        horaFin: '',
        invitados: [],
        fecha: '',
        ubicacion: '',
        sala: ''
    });

    useEffect(() => {
        const obtenerSalas = async () => {
            try {
                const token = localStorage.getItem('adminToken');
                if (!token) {
                    throw new Error('No hay token de autenticación');
                }

                const response = await axios.get("http://localhost:5000/api/rooms", {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                // Salas obtenidas exitosamente
                setSalas(response.data);
            } catch (error) {
                console.error("Error al obtener las salas:", error);
                setError(error.message);
            }
        };

        obtenerSalas();
    }, []);

    const navesSalas = salas.reduce((acc, sala) => {
        const ubicacion = sala.ubicacion;
        if (!acc[ubicacion]) {
            acc[ubicacion] = [];
        }
        acc[ubicacion].push(sala.nombre);
        return acc;
    }, {});

    const salasDisponibles = ubicacionSeleccionada ? navesSalas[ubicacionSeleccionada] || [] : [];

    const obtenerUbicacionPorSala = (sala) => {
        // Buscando ubicación para sala
        const salaEncontrada = salas.find(s => s.nombre === sala);
        if (salaEncontrada) {
            // Ubicación encontrada
            return salaEncontrada.ubicacion;
        }
        // No se encontró ubicación para la sala
        return "Nave no especificada";
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
    
    const cargarReservasParaEdicion = async (datos) => {
        if (datos.ubicacion && datos.sala && datos.fecha) {
            try {
                const token = localStorage.getItem('adminToken');
                const response = await axios.get(`http://localhost:5000/api/reservations`, {
                    params: {
                        ubicacion: datos.ubicacion,
                        sala: datos.sala,
                        fecha: datos.fecha
                    },
                    headers: {
                        'Authorization': `Bearer ${token}`
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

    useEffect(() => {
        const obtenerReservas = async () => {
            try {
                const token = localStorage.getItem('adminToken');
                if (!token) {
                    throw new Error('No hay token de autenticación');
                }

                const response = await axios.get("http://localhost:5000/api/reservations", {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                // Respuesta del servidor recibida

                const reservasDesdeDB = response.data.map((reserva) => {
                    let fechaInicio, fechaFin;

                    if (reserva.fecha.includes('GMT')) {
                        const fechaObj = new Date(reserva.fecha);
                        fechaInicio = new Date(fechaObj);
                        fechaFin = new Date(fechaObj);
                    } else {
                        const [year, month, day] = reserva.fecha.split('-');
                        fechaInicio = new Date(year, month - 1, day);
                        fechaFin = new Date(year, month - 1, day);
                    }

                    const [horaInicio, minutoInicio] = reserva.horaInicio.split(':');
                    const [horaFin, minutoFin] = reserva.horaFin.split(':');

                    fechaInicio.setHours(parseInt(horaInicio), parseInt(minutoInicio), 0);
                    fechaFin.setHours(parseInt(horaFin), parseInt(minutoFin), 0);

                    // Aseguramos que siempre haya una ubicación asignada
                    let ubicacion = reserva.ubicacion;
                    if (!ubicacion) {
                        ubicacion = obtenerUbicacionPorSala(reserva.sala);
                    }
                    // Procesando reserva y asignando ubicación

                    const reservaFormateada = {
                        id: reserva._id,
                        title: `${reserva.motivo} - ${reserva.nombre}`,
                        start: fechaInicio,
                        end: fechaFin,
                        ubicacion: ubicacion,
                        sala: reserva.sala || '',
                        usuario: reserva.nombre,
                        correo: reserva.correo,
                        motivo: reserva.motivo,
                        invitados: reserva.invitados || [],
                        contraseña: reserva.contraseña || '',
                        color: getColorPorUbicacion(ubicacion)
                    };

                    // Reserva formateada correctamente
                    return reservaFormateada;
                });

                // Todas las reservas han sido formateadas
                setReservas(reservasDesdeDB);
                setLoading(false);
            } catch (error) {
                console.error("Error al obtener las reservas:", error);
                setError(error.message);
                setLoading(false);
            }
        };

        obtenerReservas();
    }, []);

    const handleEliminarReserva = async (reservaId) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar esta reserva?')) {
            try {
                const token = localStorage.getItem('adminToken');
                const response = await axios.delete(`http://localhost:5000/api/reservations/${reservaId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.status === 200) {
                    setReservas(reservas.filter((r) => r.id !== reservaId));
                    setMostrarModal(false);
                    alert("Reserva eliminada correctamente.");
                }
            } catch (error) {
                console.error("Error al eliminar la reserva:", error);
                alert(error.response?.data?.message || "Error al eliminar la reserva");
            }
        }
    };

    const handleModificarReserva = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.put(
                `http://localhost:5000/api/reservations/${reservaSeleccionada.id}/editar`,
                {
                    ...formData,
                    cambios: {
                        fecha: formData.fecha !== moment(reservaSeleccionada.start).format("YYYY-MM-DD"),
                        horaInicio: formData.horaInicio !== moment(reservaSeleccionada.start).format("HH:mm"),
                        horaFin: formData.horaFin !== moment(reservaSeleccionada.end).format("HH:mm"),
                        ubicacion: formData.ubicacion !== reservaSeleccionada.ubicacion,
                        sala: formData.sala !== reservaSeleccionada.sala,
                        motivo: formData.motivo !== reservaSeleccionada.motivo,
                        invitados: JSON.stringify(formData.invitados) !== JSON.stringify(reservaSeleccionada.invitados)
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.status === 200) {
                const reservasActualizadas = reservas.map(r =>
                    r.id === reservaSeleccionada.id ? {
                        ...r,
                        start: new Date(formData.fecha + "T" + formData.horaInicio),
                        end: new Date(formData.fecha + "T" + formData.horaFin),
                        ubicacion: formData.ubicacion,
                        sala: formData.sala,
                        motivo: formData.motivo,
                        invitados: formData.invitados
                    } : r
                );
                setReservas(reservasActualizadas);
                setMostrarModalEditar(false);
                alert("Reserva actualizada correctamente");
            }
        } catch (error) {
            console.error("Error al actualizar la reserva:", error);
            alert(error.response?.data?.message || "Error al actualizar la reserva");
        }
    };

    const handleEditarClick = (reserva) => {
        // Reserva seleccionada
        setReservaSeleccionada(reserva);

        // Si la reserva tiene sala pero no ubicación, asignamos la ubicación correspondiente
        const ubicacion = reserva.ubicacion || obtenerUbicacionPorSala(reserva.sala);

        const formDataActualizado = {
            motivo: reserva.motivo,
            horaInicio: moment(reserva.start).format('HH:mm'),
            horaFin: moment(reserva.end).format('HH:mm'),
            invitados: reserva.invitados || [],
            fecha: moment(reserva.start).format('YYYY-MM-DD'),
            ubicacion: ubicacion,
            sala: reserva.sala || ''
        };

        // FormData actualizado
        setFormData(formDataActualizado);
        
        // Cargar reservas existentes para verificar disponibilidad
        cargarReservasParaEdicion(formDataActualizado);
        
        setMostrarModalEditar(true);
    };

    const eventosFiltrados = reservas.filter((evento) => {
        // Filtrando evento por ubicación y sala seleccionadas

        const ubicacionCoincide = !ubicacionSeleccionada || evento.ubicacion === ubicacionSeleccionada;
        const salaCoincide = !salaSeleccionada || evento.sala === salaSeleccionada;

        // Verificando coincidencia de ubicación y sala

        return ubicacionCoincide && salaCoincide;
    });

    const getColorPorUbicacion = (ubicacion) => {
        const colores = {
            "Nave 1": "#4A90E2",
            "Nave 4": "#50E3C2",
            "Nave no especificada": "#50E3C2"
        };
        return colores[ubicacion] || "#50E3C2";
    };

    const eventStyleGetter = (event) => {
        const backgroundColor = getColorPorUbicacion(event.ubicacion);
        return {
            style: {
                backgroundColor,
                color: "white",
                borderRadius: "8px",
                padding: "8px",
                border: "none",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                opacity: 0.9,
                cursor: "pointer",
                transition: "all 0.3s ease",
                fontSize: "0.9rem",
                fontWeight: "500",
                ":hover": {
                    opacity: 1,
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.15)"
                }
            },
            'data-ubicacion': event.ubicacion || "Nave no especificada"
        };
    };

    const handleSelectEvent = (event) => {
        setReservaSeleccionada(event);
        setFormData({
            ubicacion: event.ubicacion,
            sala: event.sala,
            fecha: moment(event.start).format('YYYY-MM-DD'),
            nombre: event.usuario,
            correo: event.correo,
            motivo: event.motivo,
            invitados: event.invitados || [],
            horaInicio: moment(event.start).format('HH:mm'),
            horaFin: moment(event.end).format('HH:mm')
        });
        setMostrarModal(true);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Cargando reservas...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <h3>Error al cargar las reservas</h3>
                <p>{error}</p>
                <button
                    className="retry-button"
                    onClick={() => window.location.reload()}
                >
                    Intentar de nuevo
                </button>
            </div>
        );
    }

    return (
        <div className="reservas-content">
            <div className="leyenda-colores mb-3 mb-md-4">
                {Object.keys(navesSalas).map((ubicacion) => (
                    <div key={ubicacion} className="leyenda-item">
                        <div
                            className="leyenda-color"
                            style={{ backgroundColor: getColorPorUbicacion(ubicacion) }}
                        />
                        <span className="leyenda-texto">{ubicacion}</span>
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
                                setSalaSeleccionada(""); // Reset sala when ubicacion changes
                            }}
                            className="shadow-sm"
                        >
                            <option value="">Todas las ubicaciones</option>
                            {Object.keys(navesSalas).map((ubicacion) => (
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
                            {salasDisponibles.map((sala) => (
                                <option key={sala} value={sala}>
                                    {sala}
                                </option>
                            ))}
                        </Form.Select>
                    </Col>
                </Row>
            </div>

            <div className="calendario-wrapper">
                <BigCalendar
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

            <Modal show={mostrarModal} onHide={() => setMostrarModal(false)} centered>
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
                                <strong>Usuario:</strong> {reservaSeleccionada.usuario}
                            </p>
                            <p className="d-flex align-items-center">
                                <Envelope className="me-2" size={16} />
                                <strong>Correo:</strong> {reservaSeleccionada.correo}
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
                            <p className="d-flex align-items-center">
                                <Key className="me-2" size={16} />
                                <strong>Contraseña:</strong> {reservaSeleccionada.contraseña || "No especificada"}
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
                    <Button variant="secondary" onClick={() => setMostrarModal(false)}>
                        Cerrar
                    </Button>
                    <Button variant="primary" onClick={() => {
                        setMostrarModal(false);
                        handleEditarClick(reservaSeleccionada);
                    }}>
                        Editar
                    </Button>
                    <Button variant="danger" onClick={() => {
                        setMostrarModal(false);
                        handleEliminarReserva(reservaSeleccionada.id);
                    }}>
                        Eliminar
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={mostrarModalEditar} onHide={() => setMostrarModalEditar(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="d-flex align-items-center">
                        <CalendarCheck className="me-2" size={24} />
                        Editar Reserva
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleModificarReserva}>
                        <Form.Group className="mb-3">
                            <Form.Label className="d-flex align-items-center">
                                <CalendarIcon className="me-2" size={16} />
                                Fecha
                            </Form.Label>
                            <Form.Control
                                type="date"
                                value={moment(reservaSeleccionada?.start).format('YYYY-MM-DD')}
                                onChange={(e) => {
                                    const nuevoFormData = { ...formData, fecha: e.target.value };
                                    setFormData(nuevoFormData);
                                    
                                    // Si tenemos todos los datos necesarios, cargar reservas
                                    if (nuevoFormData.ubicacion && nuevoFormData.sala && nuevoFormData.fecha) {
                                        cargarReservasParaEdicion(nuevoFormData);
                                    }
                                }}
                                required
                                className="shadow-sm"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="d-flex align-items-center">
                                <Clock className="me-2" size={16} />
                                Hora de inicio
                            </Form.Label>
                            <Form.Select
                                value={formData.horaInicio}
                                onChange={(e) => {
                                    const nuevoFormData = { ...formData, horaInicio: e.target.value };
                                    setFormData(nuevoFormData);
                                }}
                                required
                                className="shadow-sm"
                            >
                                <option value="">Selecciona una hora</option>
                                {horariosDisponibles.length > 0 ? 
                                    horariosDisponibles.map((opcion) => (
                                        <option 
                                            key={opcion.value} 
                                            value={opcion.value} 
                                            disabled={!opcion.disponible && opcion.value !== formData.horaInicio}
                                            style={!opcion.disponible && opcion.value !== formData.horaInicio ? {color: '#aaa'} : {}}
                                        >
                                            {opcion.label} {!opcion.disponible && opcion.value !== formData.horaInicio ? '(No disponible)' : ''}
                                        </option>
                                    )) : 
                                    generarOpcionesHora().map((opcion) => (
                                        <option key={opcion.value} value={opcion.value}>
                                            {opcion.label}
                                        </option>
                                    ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="d-flex align-items-center">
                                <Clock className="me-2" size={16} />
                                Hora de fin
                            </Form.Label>
                            <Form.Select
                                value={formData.horaFin}
                                onChange={(e) => {
                                    const nuevoFormData = { ...formData, horaFin: e.target.value };
                                    setFormData(nuevoFormData);
                                }}
                                required
                                className="shadow-sm"
                            >
                                <option value="">Selecciona una hora</option>
                                {horariosDisponibles.length > 0 ? 
                                    horariosDisponibles.map((opcion) => (
                                        <option 
                                            key={opcion.value} 
                                            value={opcion.value} 
                                            disabled={!opcion.disponible && opcion.value !== formData.horaFin}
                                            style={!opcion.disponible && opcion.value !== formData.horaFin ? {color: '#aaa'} : {}}
                                        >
                                            {opcion.label} {!opcion.disponible && opcion.value !== formData.horaFin ? '(No disponible)' : ''}
                                        </option>
                                    )) : 
                                    generarOpcionesHora().map((opcion) => (
                                        <option key={opcion.value} value={opcion.value}>
                                            {opcion.label}
                                        </option>
                                    ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="d-flex align-items-center">
                                <Building className="me-2" size={16} />
                                Ubicación
                            </Form.Label>
                            <Form.Select
                                value={formData.ubicacion}
                                onChange={(e) => {
                                    const nuevoFormData = { 
                                        ...formData, 
                                        ubicacion: e.target.value,
                                        sala: '' // Resetear sala cuando cambia ubicación
                                    };
                                    setFormData(nuevoFormData);
                                    
                                    // Si tenemos todos los datos necesarios, cargar reservas
                                    if (nuevoFormData.ubicacion && nuevoFormData.fecha) {
                                        cargarReservasParaEdicion(nuevoFormData);
                                    }
                                }}
                                required
                                className="shadow-sm"
                            >
                                <option value="">Seleccionar ubicación</option>
                                {Object.keys(navesSalas).map((ubicacion) => (
                                    <option key={ubicacion} value={ubicacion}>{ubicacion}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="d-flex align-items-center">
                                <DoorOpen className="me-2" size={16} />
                                Sala
                            </Form.Label>
                            <Form.Select
                                value={formData.sala}
                                onChange={(e) => {
                                    const nuevoFormData = { ...formData, sala: e.target.value };
                                    setFormData(nuevoFormData);
                                    
                                    // Si tenemos todos los datos necesarios, cargar reservas
                                    if (nuevoFormData.ubicacion && nuevoFormData.sala && nuevoFormData.fecha) {
                                        cargarReservasParaEdicion(nuevoFormData);
                                    }
                                }}
                                required
                                disabled={!formData.ubicacion}
                                className="shadow-sm"
                            >
                                <option value="">Seleccionar sala</option>
                                {navesSalas[formData.ubicacion]?.map((sala) => (
                                    <option key={sala} value={sala}>{sala}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="d-flex align-items-center">
                                <InfoCircle className="me-2" size={16} />
                                Motivo
                            </Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.motivo}
                                onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                                required
                                className="shadow-sm"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="d-flex align-items-center">
                                <People className="me-2" size={16} />
                                Invitados (separados por comas)
                            </Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.invitados.join(", ")}
                                onChange={(e) => setFormData({ ...formData, invitados: e.target.value.split(",").map(i => i.trim()) })}
                                placeholder="Ingrese los invitados separados por comas"
                                className="shadow-sm"
                            />
                        </Form.Group>
                        <div className="d-flex justify-content-end">
                            <Button variant="secondary" className="me-2" onClick={() => setMostrarModalEditar(false)}>
                                Cancelar
                            </Button>
                            <Button variant="primary" type="submit">
                                Guardar Cambios
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

const AdminDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const path = location.pathname.split('/');
    const activeSection = path[path.length - 1] === 'dashboard' || path.length <= 3 ? 'dashboard' : path[path.length - 1];
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("add");
    const [selectedUser, setSelectedUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [userProfile, setUserProfile] = useState({
        name: "Cargando...",
        email: "",
        role: "Administrador"
    });
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "admin",
        status: "active"
    });

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const response = await axios.get("http://localhost:5000/api/admin/users", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data);
        } catch (error) {
            console.error("Error al cargar usuarios:", error);
        }
    };

    useEffect(() => {
        // Verificar si el usuario está autenticado
        const token = localStorage.getItem("adminToken");
        if (!token) {
            navigate("/admin/login");
            return;
        }

        // Cargar usuarios y perfil
        fetchUsers();
        fetchUserProfile();
    }, [navigate]);

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                // No hay token disponible
                return;
            }

            // Token obtenido

            // Decodificar el token manualmente
            const tokenParts = token.split('.');
            const tokenPayload = JSON.parse(atob(tokenParts[1]));
            // Payload del token decodificado

            const response = await axios.get('http://localhost:5000/api/admin/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Datos del perfil recibidos
            setUserProfile({
                name: response.data.nombre || tokenPayload.nombre || 'Administrador',
                email: response.data.email || tokenPayload.email || '',
                role: response.data.role || tokenPayload.role || 'admin'
            });
        } catch (error) {
            console.error('Error al cargar el perfil:', error);
            const token = localStorage.getItem('adminToken');
            if (token) {
                try {
                    const tokenParts = token.split('.');
                    const tokenPayload = JSON.parse(atob(tokenParts[1]));
                    // Usando payload del token como fallback
                    setUserProfile({
                        name: tokenPayload.nombre || 'Administrador',
                        email: tokenPayload.email || '',
                        role: tokenPayload.role || 'admin'
                    });
                } catch (decodeError) {
                    console.error('Error al decodificar el token:', decodeError);
                    setUserProfile({
                        name: 'Administrador',
                        email: '',
                        role: 'admin'
                    });
                }
            }
        }
    };

    const handleProfileClick = () => {
        setShowProfileMenu(!showProfileMenu);
    };

    const handleConfigClick = () => {
        setShowProfileMenu(false);
        navigate('/admin/dashboard/usuarios');
    };

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
    };

    const menuItems = [
        { id: 'dashboard', icon: <FaHome />, label: 'Dashboard' },
        { id: 'salas', icon: <FaDoorOpen />, label: 'Salas' },
        { id: 'reservas', icon: <FaCalendarAlt />, label: 'Reservas' },
        { id: 'usuarios', icon: <FaUsers />, label: 'Usuarios' }
    ];

    const renderContent = () => {
        switch (activeSection) {
            case 'dashboard':
                return <DashboardContent />;
            case 'usuarios':
                return <UsersContent />;
            case 'salas':
                return <RoomsContent />;
            case 'reservas':
                return <ReservasContent />;
            default:
                return <DashboardContent />;
        }
    };

    return (
        <div className="admin-dashboard">
            <div className="sidebar">
                <div className="logo">
                    <h2>Sistema de Reservas</h2>
                </div>
                <nav className="menu">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            className={`menu-item ${activeSection === item.id ? 'active' : ''}`}
                            onClick={() => item.id === 'dashboard' ? navigate('/admin/dashboard') : navigate(`/admin/dashboard/${item.id}`)}
                            data-section={item.id}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            <div className="main-content">
                <header className="admin-header">
                    <div className="header-top">
                        <Breadcrumbs items={[
                            { label: 'Dashboard', path: '/admin/dashboard' },
                            ...(activeSection !== 'dashboard' ? [{ 
                                label: menuItems.find(item => item.id === activeSection)?.label, 
                                path: `/admin/dashboard/${activeSection}` 
                            }] : [])
                        ]} />
                    </div>
                    <h1>{menuItems.find(item => item.id === activeSection)?.label}</h1>
                    <div className="header-actions">
                        <div className="profile-container">
                            <button className="profile-btn" onClick={handleProfileClick}>
                                <div className="profile-avatar">
                                    <span>{userProfile.name.charAt(0)}</span>
                                </div>
                                <span className="profile-name">{userProfile.name}</span>
                            </button>
                            {showProfileMenu && (
                                <div className="profile-dropdown">
                                    <div className="profile-info">
                                        <div className="profile-details">
                                            <h3>{userProfile.name}</h3>
                                            <p>{userProfile.email}</p>
                                            <small>{userProfile.role}</small>
                                        </div>
                                    </div>
                                    <div className="profile-actions">
                                        <button className="profile-action-btn" onClick={handleConfigClick}>
                                            <FaCog className="me-2" />
                                            Configuración
                                        </button>
                                        <button className="profile-action-btn" onClick={handleLogout}>
                                            <FaSignOutAlt className="me-2" />
                                            Cerrar Sesión
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <div className="content-area">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard; 