const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');

// POST - Crear carrito nuevo
router.post('/', async (req, res) => {
    try {
        const newCart = await Cart.create({ products: [] });
        res.status(201).json({ status: "success", payload: newCart });
    } catch (error) {
        res.status(500).json({ status: "error", error: error.message });
    }
});

// GET - Ver un carrito
router.get('/:cid', async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.cid);
        if(!cart) return res.status(404).json({ status: "error", error: "Carrito no encontrado" });
        res.json({ status: "success", payload: cart });
    } catch (error) {
        res.status(500).json({ status: "error", error: error.message });
    }
});

// POST - Agregar un auto al carrito (o sumar cantidad)
router.post('/:cid/products/:pid', async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.cid);
        if (!cart) return res.status(404).json({ status: "error", error: "Carrito no encontrado" });

        const productIndex = cart.products.findIndex(p => p.auto._id.toString() === req.params.pid);
        
        if (productIndex !== -1) {
            cart.products[productIndex].quantity += 1; 
        } else {
            cart.products.push({ auto: req.params.pid, quantity: 1 }); 
        }

        await cart.save();
        res.json({ status: "success", message: "Auto agregado", payload: cart });
    } catch (error) {
        res.status(500).json({ status: "error", error: error.message });
    }
});

// PUT - Actualizar todo el arreglo de productos
router.put('/:cid', async (req, res) => {
    try {
        const cart = await Cart.findByIdAndUpdate(req.params.cid, { products: req.body }, { new: true });
        res.json({ status: "success", payload: cart });
    } catch (error) {
        res.status(500).json({ status: "error", error: error.message });
    }
});

// PUT - Actualizar SÓLO la cantidad de un producto
router.put('/:cid/products/:pid', async (req, res) => {
    try {
        const { quantity } = req.body;
        const cart = await Cart.findById(req.params.cid);
        const productIndex = cart.products.findIndex(p => p.auto._id.toString() === req.params.pid);
        
        if (productIndex !== -1) {
            cart.products[productIndex].quantity = quantity;
            await cart.save();
            res.json({ status: "success", payload: cart });
        } else {
            res.status(404).json({ status: "error", error: "Auto no encontrado en el carrito" });
        }
    } catch (error) {
        res.status(500).json({ status: "error", error: error.message });
    }
});

// DELETE - Eliminar un producto específico del carrito
router.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.cid);
        cart.products = cart.products.filter(p => p.auto._id.toString() !== req.params.pid);
        await cart.save();
        res.json({ status: "success", message: "Auto eliminado del carrito", payload: cart });
    } catch (error) {
        res.status(500).json({ status: "error", error: error.message });
    }
});

// DELETE - Vaciar todo el carrito
router.delete('/:cid', async (req, res) => {
    try {
        const cart = await Cart.findByIdAndUpdate(req.params.cid, { products: [] }, { new: true });
        res.json({ status: "success", message: "Carrito vaciado", payload: cart });
    } catch (error) {
        res.status(500).json({ status: "error", error: error.message });
    }
});

module.exports = router;