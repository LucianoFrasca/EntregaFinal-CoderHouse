const express = require('express');
const mongoose = require('mongoose');
const { engine } = require('express-handlebars');
const { Server } = require('socket.io');
const http = require('http');

const autosRouter = require('./routes/autos.router');
const cartsRouter = require('./routes/carts.router');
const Auto = require('./models/Auto');
const Cart = require('./models/Cart');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = 3000;

// REEMPLAZAR POR TU URL DE MONGO
mongoose.connect('mongodb+srv://luciano:rXO6nHVmBoU4Eb3n@coder.4yrxnzm.mongodb.net/?appName=Coder')
    .then(() => console.log('Conectado a MongoDB Atlas'))
    .catch(err => console.error('Error conectando a Mongo', err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

// API Endpoints
app.use('/api/autos', autosRouter);
app.use('/api/carts', cartsRouter);

// Vistas Web
app.get('/', (req, res) => {
    res.redirect('/products');
});

app.get('/products', async (req, res) => {
    const { page = 1 } = req.query;
    // Paginación de 5 en 5 para la vista web
    const result = await Auto.paginate({}, { page: parseInt(page), limit: 5, lean: true });
    res.render('products', { autos: result.docs, result });
});

app.get('/realtimeproducts', async (req, res) => {
    const autos = await Auto.find().lean();
    res.render('realTimeProducts', { autos });
});

// Vista del Carrito (MEJORADA con Cálculo de Total)
app.get('/carts/:cid', async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.cid).lean();
        if(!cart) return res.status(404).send("Carrito no encontrado");
        
        // --- Cálculo del Total ARS ---
        let totalAcumulado = 0;
        cart.products.forEach(item => {
            if(item.auto) { // Si el auto existe y se populó bien
                totalAcumulado += item.auto.precio * item.quantity;
            }
        });

        // Pasamos el total formateado (para que ponga comas/puntos si es muy grande, opcional)
        // Usamos simple .toString() para mantenerlo básico
        res.render('cart', { 
            cart, 
            total: totalAcumulado 
        });

    } catch (error) {
        res.status(404).send("Error al cargar el carrito");
    }
});

// Websockets
io.on('connection', (socket) => {
    socket.on('nuevoAuto', async (autoData) => {
        await Auto.create(autoData);
        const autosActualizados = await Auto.find().lean();
        io.emit('actualizarLista', autosActualizados); 
    });

    socket.on('eliminarAuto', async (id) => {
        await Auto.findByIdAndDelete(id);
        const autosActualizados = await Auto.find().lean();
        io.emit('actualizarLista', autosActualizados);
    });
});

server.listen(PORT, () => console.log(`Servidor de Autos escuchando en http://localhost:${PORT}`));