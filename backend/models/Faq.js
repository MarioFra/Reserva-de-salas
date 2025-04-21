// models/Faq.js
const { Schema, model } = require('mongoose');

const faqSchema = new Schema(
  {
    pregunta: { type: String, required: true },
    respuesta: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = model('Faq', faqSchema);
