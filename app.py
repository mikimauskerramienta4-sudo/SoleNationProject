import os
from datetime import datetime
from bson.objectid import ObjectId  # <-- NECESARIO PARA EDITAR Y ELIMINAR POR ID
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient

load_dotenv()

app = Flask(__name__)
CORS(app)

MONGO_URI = os.getenv("MONGO_URI")
cliente = MongoClient(MONGO_URI)
db = cliente["SoleNationDB"]

# Colecciones
col_clientes = db["clientes"]
col_productos = db["productos"]
col_pedidos = db["pedidos"]
col_detalles = db["detalle_pedido"]


@app.route("/")
def inicio():
    return "API SoleNation activa"


# 1. OBTENER PEDIDOS (GET)
@app.route("/api/pedidos", methods=["GET"])
def obtener_pedidos():
    lista_resultado = []

    for pedido in col_pedidos.find():
        # Busca el cliente por su ObjectId
        cli = col_clientes.find_one({"_id": pedido.get("cliente_id")})
        nombre_cliente = cli["nombre"] if cli else "Cliente Desconocido"

        # Busca el detalle del pedido por su ObjectId
        detalle = col_detalles.find_one({"pedido_id": pedido["_id"]})
        nombre_prod = "Zapatilla"
        talla = "-"
        cantidad = 1

        if detalle:
            prod = col_productos.find_one({"_id": detalle.get("producto_id")})
            if prod:
                nombre_prod = prod["nombre"]
                talla = prod.get("talla", "-")
            cantidad = detalle.get("cantidad", 1)

        fecha = pedido.get("fecha")
        fecha_str = (
            fecha.strftime("%Y-%m-%d %H:%M:%S")
            if isinstance(fecha, datetime)
            else str(fecha)
        )

        lista_resultado.append({
            "id": str(pedido["_id"]),  # <-- RETORNAMOS EL ID PARA EL FRONTEND
            "cliente": nombre_cliente,
            "producto": nombre_prod,
            "talla": talla,
            "cantidad": cantidad,
            "monto_total": pedido.get("monto_total", 0),
            "fecha": fecha_str,
        })

    return jsonify(lista_resultado)


# 1. REGISTRAR PEDIDO -> Resta del stock
@app.route("/api/pedido", methods=["POST"])
def registrar_pedido():
    datos = request.get_json()
    cant = int(datos["cantidad"])
    total = float(datos["total"])
    precio_u = total / cant if cant > 0 else total

    cliente_id = col_clientes.insert_one({
        "nombre": f"{datos['nombre']} {datos['apellido']}",
        "email": datos["correo"],
        "telefono": datos["telefono"],
    }).inserted_id

    prod = col_productos.find_one({"nombre": datos["producto"]})
    if not prod:
        # Si no existe, se crea con 10 de stock menos lo que compró
        producto_id = col_productos.insert_one({
            "nombre": datos["producto"],
            "talla": int(datos["talla"]),
            "precio": precio_u,
            "stock": 10 - cant,
        }).inserted_id
    else:
        producto_id = prod["_id"]
        # Si ya existe, le restamos la cantidad comprada ($inc con número negativo)
        col_productos.update_one(
            {"_id": producto_id}, {"$inc": {"stock": -cant}}
        )

    pedido_id = col_pedidos.insert_one({
        "cliente_id": cliente_id,
        "fecha": datetime.now(),
        "monto_total": total,
        "estado": "Completado",
    }).inserted_id

    col_detalles.insert_one({
        "pedido_id": pedido_id,
        "producto_id": producto_id,
        "cantidad": cant,
        "precio_unitario": precio_u,
        "subtotal": total,
    })

    return jsonify({"mensaje": "¡Pedido registrado y stock actualizado!"})


# 2. ELIMINAR PEDIDO -> Devuelve el stock
@app.route("/api/pedidos/<id>", methods=["DELETE"])
def eliminar_pedido(id):
    try:
        obj_id = ObjectId(id)

        # Buscamos el detalle para saber cuánto stock debemos devolver
        detalle = col_detalles.find_one({"pedido_id": obj_id})
        if detalle:
            cant = detalle.get("cantidad", 0)
            prod_id = detalle.get("producto_id")
            # Devolvemos la cantidad al stock ($inc con número positivo)
            if prod_id:
                col_productos.update_one(
                    {"_id": prod_id}, {"$inc": {"stock": cant}}
                )

        col_detalles.delete_many({"pedido_id": obj_id})
        col_pedidos.delete_one({"_id": obj_id})
        return jsonify(
            {"mensaje": "Pedido eliminado y stock devuelto al inventario."}
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# 3. MODIFICAR PEDIDO -> Ajusta la diferencia de stock
@app.route("/api/pedidos/<id>", methods=["PUT"])
def actualizar_pedido(id):
    try:
        datos = request.get_json()
        obj_id = ObjectId(id)
        nueva_cant = int(datos["cantidad"])

        detalle = col_detalles.find_one({"pedido_id": obj_id})
        if detalle:
            cant_anterior = detalle.get("cantidad", 0)
            prod_id = detalle.get("producto_id")
            precio_u = detalle.get("precio_unitario", 0)

            # Calculamos la diferencia de pares comprados
            diferencia = nueva_cant - cant_anterior
            nuevo_total = precio_u * nueva_cant

            # Ajustamos el stock según la diferencia
            if prod_id:
                col_productos.update_one(
                    {"_id": prod_id}, {"$inc": {"stock": -diferencia}}
                )

            # Actualizar detalle y pedido
            col_detalles.update_one(
                {"pedido_id": obj_id},
                {"$set": {"cantidad": nueva_cant, "subtotal": nuevo_total}},
            )
            col_pedidos.update_one(
                {"_id": obj_id}, {"$set": {"monto_total": nuevo_total}}
            )

        return jsonify(
            {"mensaje": "Pedido y stock ajustados correctamente."}
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    app.run(debug=True)