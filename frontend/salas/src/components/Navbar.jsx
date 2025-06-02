import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaCalendar, FaHistory, FaQuestionCircle, FaBook, FaUserShield } from 'react-icons/fa';
import logo from '../assets/logo.png';

function Navbar() {
  return (
    <nav className="navbar navbar-dark position-fixed h-100" style={{ width: '225px', backgroundColor: '#1A4B84' }}>
      {/* Logo arriba */}
      <div className="text-center p-2 bg-white rounded-3" style={{ margin: '0 15px 0 15px' }}>
        <img src={logo} alt="Logo Empresa" className="img-fluid" style={{ maxWidth: '180px' }} />
      </div>
      <ul className="navbar-nav p-1" style={{ marginTop: '-15px' }}>
        <li className="nav-item mb-1">
          <Link className="nav-link" to="/">
            <FaHome className="me-2" /> Inicio
          </Link>
        </li>
        <li className="nav-item mb-1">
          <Link className="nav-link" to="/reservar">
            <FaBook className="me-2" /> Reservar Sala
          </Link>
        </li>
        <li className="nav-item mb-1">
          <Link className="nav-link" to="/calendario">
            <FaCalendar className="me-2" /> Calendario
          </Link>
        </li>
        <li className="nav-item mb-1">
          <Link className="nav-link" to="/historial">
            <FaHistory className="me-2" /> Historial
          </Link>
        </li>
        <li className="nav-item mb-1">
          <Link className="nav-link" to="/ayuda">
            <FaQuestionCircle className="me-2" /> Ayuda
          </Link>
        </li>
        <li className="nav-item mb-1">
          <Link className="nav-link" to="/admin/login">
            <FaUserShield className="me-2" /> Administrador
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
