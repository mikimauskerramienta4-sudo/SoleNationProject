const { obtenerDB } = require("../config/database");
const { ObjectId } = require("mongodb");

// GET - Obtener todos los productos
async function obtenerProductos(req, res) {
    try {
        const db = obtenerDB();
        const productos = await db
            .collection("productos")
            .find()
            .toArray();
        res.json(productos);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: "Error al obtener productos"
        });
    }
}

// POST - Registrar un producto
async function agregarProducto(req, res) {
    try {
        const db = obtenerDB();
        const producto = {
            nombre: req.body.nombre,
            precio: req.body.precio,
            stock: req.body.stock
        };

        const resultado = await db
            .collection("productos")
            .insertOne(producto);

        res.status(201).json({
            mensaje: "Producto registrado",
            id: resultado.insertedId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: "Error al registrar producto"
        });
    }
}

// PUT - Actualizar un producto existente por su ID
async function actualizarProducto(req, res) {
    try {
        const { id } = req.params;
        const db = obtenerDB();

        const actualizacion = {
            $set: {
                nombre: req.body.nombre,
                precio: req.body.precio,
                stock: req.body.stock
            }
        };

        const resultado = await db
            .collection("productos")
            .updateOne({ _id: new ObjectId(id) }, actualizacion);

        if (resultado.matchedCount === 0) {
            return res.status(404).json({ mensaje: "Producto no encontrado" });
        }

        res.json({ mensaje: "Producto actualizado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al actualizar el producto" });
    }
}

// DELETE - Eliminar un producto por su ID
async function eliminarProducto(req, res) {
    try {
        const { id } = req.params;
        const db = obtenerDB();

        const resultado = await db
            .collection("productos")
            .deleteOne({ _id: new ObjectId(id) });

        if (resultado.deletedCount === 0) {
            return res.status(404).json({ mensaje: "Producto no encontrado" });
        }

        res.json({ mensaje: "Producto eliminado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al eliminar el producto" });
    }
}

module.exports = {
    obtenerProductos,
    agregarProducto,
    actualizarProducto,
    eliminarProducto
};