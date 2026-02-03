const express = require("express");
const fs = require("fs"); 
const app = express();
const PORT = 3000;
const FILE_NAME = "autos.json";

// Middleware
app.use(express.json());

// Leer autos desde el archivo
const leerAutos = () => {
    try {
        const data = fs.readFileSync(FILE_NAME, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Error al leer el archivo", error);
        return [];
    }
};
// Guardar autos en el archivo
const guardarAutos = (autos) => {
    try {
        fs.writeFileSync(FILE_NAME, JSON.stringify(autos, null, 2));
    } catch (error) {
        console.error("Error al guardar el archivo", error);
    }
};

// Rutas
app.get('/', (req, res) => {
    res.status(200).send("Bienvenido a la API de Autos (Entrega #1)");
});

// GET - Obtener todos los autos
app.get('/autos', (req, res) => {
    const autos = leerAutos();
    res.status(200).json({ cantidad: autos.length, autos: autos });
});

// GET - Obtener un auto por ID
app.get('/autos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const autos = leerAutos();
    const auto = autos.find(a => a.id === id);

    if (!auto) {
        return res.status(404).json({ error: "Auto no encontrado" });
    }
    res.status(200).json(auto);
});

// POST - Agregar un nuevo auto
app.post('/autos', (req, res) => {
    const { modelo, precio } = req.body;
    const autos = leerAutos();
    // Nuevo auto con ID unico
    const nuevoAuto = {
        id: autos.length ? autos[autos.length - 1].id + 1 : 1,
        modelo,
        precio
    };

    autos.push(nuevoAuto);
    guardarAutos(autos);

    res.status(201).json({ message: "Auto agregado con éxito", auto: nuevoAuto });
});

// PUT - Modificar un auto existente
app.put('/autos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { modelo, precio } = req.body;
    const autos = leerAutos();
    
    const index = autos.findIndex(a => a.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "Auto no encontrado" });
    }

   
    autos[index].modelo = modelo ?? autos[index].modelo;
    autos[index].precio = precio ?? autos[index].precio;

    guardarAutos(autos);

    res.status(200).json({ message: "Auto actualizado", auto: autos[index] });
});

// DELETE - Eliminar un auto
app.delete('/autos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    let autos = leerAutos();
    
    const existe = autos.some(a => a.id === id);
    if (!existe) {
        return res.status(404).json({ error: "Auto no encontrado" });
    }

   
    autos = autos.filter(a => a.id !== id);
    
    guardarAutos(autos); 

    res.status(204).send();
});

app.listen(PORT, () => {
    console.log(`Servidor de Autos escuchando en http://localhost:${PORT}`);
});