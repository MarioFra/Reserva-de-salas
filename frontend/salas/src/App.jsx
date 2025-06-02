// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
// Importaciones de componentes principales

import Inicio from "./pages/Inicio";
import ReservarSala from "./pages/ReservarSala";
import Calendario from "./pages/Calendario";
import Historial from "./pages/Historial";
import Ayuda from "./pages/Ayuda";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

const App = () => {
  // Componente principal de la aplicación

  return (
    <Router>
      <Routes>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/dashboard/salas" element={<AdminDashboard />} />
        <Route path="/admin/dashboard/reservas" element={<AdminDashboard />} />
        <Route path="/admin/dashboard/usuarios" element={<AdminDashboard />} />
        <Route path="/*" element={
          <>
            <Navbar />
            <div className="container" style={{ marginLeft: '270px', paddingTop: '60px' }}>
              <Routes>
                <Route path="/" element={<Inicio />} />
                <Route path="/reservar" element={<ReservarSala />} />
                <Route path="/calendario" element={<Calendario />} />
                <Route path="/historial" element={<Historial />} />
                <Route path="/ayuda" element={<Ayuda />} />
                <Route path="/admin/login" element={<AdminLogin />} />
              </Routes>
            </div>
          </>
        } />
      </Routes>
    </Router>
  );
};

export default App;
