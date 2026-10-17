const { MongoClient } = require("mongodb");
const client = new MongoClient(process.env.MONGO_URI);
let db;

async function conectarMongoDB() {
    try {
        await client.connect();
        db = client.db(process.env.MONGO_DB);
        console.log("Conexión exitosa con MongoDB Atlas");
        return db;
    } catch (error) {
        console.error("Error conectando a MongoDB:", error);
        process.exit(1);
    }
}

function obtenerDB() {
    return db;
}

module.exports = {
    conectarMongoDB,
    obtenerDB
};