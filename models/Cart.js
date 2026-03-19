const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    products: [{
        auto: { type: mongoose.Schema.Types.ObjectId, ref: 'Auto' },
        quantity: { type: Number, default: 1 }
    }]
});

// Middleware Populate para tener los datos completos del auto
cartSchema.pre('find', function() {
    this.populate('products.auto');
});
cartSchema.pre('findOne', function() {
    this.populate('products.auto');
});

module.exports = mongoose.model('Cart', cartSchema);