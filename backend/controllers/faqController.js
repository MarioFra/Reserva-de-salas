const Faq = require('../models/Faq');

// Obtener todas las preguntas frecuentes
const getAllFaqs = async (req, res, next) => {
  try {
    const faqs = await Faq.find();
    res.json(faqs);
  } catch (err) {
    next(err);
  }
};

// Crear una nueva pregunta frecuente
const createFaq = async (req, res, next) => {
  try {
    const { pregunta, respuesta } = req.body;

    const newFaq = new Faq({ pregunta, respuesta });
    await newFaq.save();

    res.status(201).json(newFaq);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllFaqs, createFaq };
