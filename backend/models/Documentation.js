// models/Documentation.js
const { Schema, model } = require('mongoose');

const documentationSchema = new Schema(
  {
    titulo: { type: String, required: true },
    descripcion: { type: String },
    archivo: { type: String, required: true },
    categoria: { type: String }
  },
  { timestamps: true }
);

module.exports = model('Documentation', documentationSchema);
