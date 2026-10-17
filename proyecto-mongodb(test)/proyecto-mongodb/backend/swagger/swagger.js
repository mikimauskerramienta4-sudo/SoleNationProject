const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const opciones = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API de Productos",
            version: "1.0.0",
            description: "API REST para administrar productos"
        },
        servers: [
            {
                url: "http://localhost:3001" // Usa el puerto que configuraste en tu .env
            }
        ]
    },
    apis: ["./routes/*.js"]
};

const swaggerSpec = swaggerJsdoc(opciones);

module.exports = {
    swaggerUi,
    swaggerSpec
};