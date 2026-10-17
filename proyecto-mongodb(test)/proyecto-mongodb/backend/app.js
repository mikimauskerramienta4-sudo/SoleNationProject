require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const { conectarMongoDB } = require("./config/database");
const productosRoutes = require("./routes/productos.routes");
const { swaggerUi, swaggerSpec } = require("./swagger/swagger");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend (según Diapositiva 1)
app.use(express.static(path.join(__dirname, "frontend")));

// Documentación Swagger
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);

// Rutas
app.use("/api/productos", productosRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
    res.json({
        mensaje: "API de productos funcionando"
    });
});

// Iniciar servidor
async function iniciarServidor() {
    await conectarMongoDB();
    const PORT = process.env.PORT || 3001; // Usa 3001 para evitar conflictos de puerto
    app.listen(PORT, () => {
        console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    });
}

iniciarServidor();