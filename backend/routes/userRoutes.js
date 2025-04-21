// routes/userRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/Users');
const router = express.Router();


// Crear un nuevo usuario (administrador)
router.post('/register', async (req, res) => {
  const { nombre, email, contraseña } = req.body;

  try {
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contraseña, salt);

    const newUser = new User({
      nombre,
      email,
      contraseña: hashedPassword,
      rol: 'admin',
    });

    const userSaved = await newUser.save();
    res.status(201).json(userSaved);
  } catch (err) {
    res.status(500).json({ message: 'Error en el servidor', error: err });
  }
});

// Obtener todos los usuarios (administradores)
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error en el servidor', error: err });
  }
});

// Obtener un usuario por ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error en el servidor', error: err });
  }
});

// Actualizar un usuario
router.put('/:id', async (req, res) => {
  const { nombre, email, contraseña } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contraseña, salt);

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { nombre, email, contraseña: hashedPassword },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: 'Error en el servidor', error: err });
  }
});

// Eliminar un usuario
router.delete('/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.status(200).json({ message: 'Usuario eliminado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error en el servidor', error: err });
  }
});

module.exports = router;
