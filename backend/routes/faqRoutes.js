// routes/faqRoutes.js
const express = require('express');
const Faq = require('../models/Faq');
const router = express.Router();

// Crear una nueva pregunta frecuente
router.post('/', async (req, res) => {
  const { pregunta, respuesta } = req.body;

  try {
    const newFaq = new Faq({ pregunta, respuesta });
    const faqSaved = await newFaq.save();
    res.status(201).json(faqSaved);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear la FAQ', error: err });
  }
});

// Obtener todas las preguntas frecuentes
router.get('/', async (req, res) => {
  try {
    const faqs = await Faq.find();
    res.status(200).json(faqs);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener las FAQs', error: err });
  }
});

module.exports = router;
