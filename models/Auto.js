const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const autoSchema = new mongoose.Schema({
    modelo: { type: String, required: true },
    precio: { type: Number, required: true },
    categoria: { type: String, required: true }, // Ej: "Sedan", "Camioneta"
    disponible: { type: Boolean, default: true }
});

// Agregamos el plugin de paginación que pide la consigna
autoSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Auto', autoSchema);