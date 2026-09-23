import pymongo
import certifi
from datetime import datetime

# 1. Tu URI de MongoDB Atlas
MONGO_URI = "mongodb+srv://72055068_db_user:maincra123@clustercertus.4bk0ojq.mongodb.net/?appName=ClusterCertus"

# 2. Conexión usando certifi para asegurar SSL
client = pymongo.MongoClient(
    MONGO_URI,
    tlsCAFile=certifi.where(),
    tlsAllowInvalidCertificates=True
)

# 3. Base de datos para SoleNation
db = client["SoleNationDB"]

# Limpiar colecciones antes de insertar para evitar duplicados
db["clientes"].delete_many({})
db["productos"].delete_many({})
db["pedidos"].delete_many({})
db["detalle_pedido"].delete_many({})

# A. Insertar Cliente
cliente_id = db["clientes"].insert_one({
    "nombre": "Carlos Mendoza",
    "email": "carlos@email.com",
    "telefono": "987654321"
}).inserted_id

# B. Insertar Producto (Zapatilla)
prod_id = db["productos"].insert_one({
    "nombre": "Nike Air Force 1",
    "talla": 42,
    "precio": 399.90,
    "stock": 10
}).inserted_id

# C. Insertar Pedido (Cabecera)
pedido_id = db["pedidos"].insert_one({
    "cliente_id": cliente_id,
    "fecha": datetime.now(),
    "monto_total": 399.90,
    "estado": "Completado"
}).inserted_id

# D. Insertar Detalle de Pedido (Relación Pedido - Producto)
detalle_id = db["detalle_pedido"].insert_one({
    "pedido_id": pedido_id,
    "producto_id": prod_id,
    "cantidad": 1,
    "precio_unitario": 399.90,
    "subtotal": 399.90
}).inserted_id

print("\n--------------------------------------------------")
print("¡CONEXIÓN Y REGISTRO COMPLETO EN MONGODB ATLAS!")
print(f"1. Cliente ID:        {cliente_id}")
print(f"2. Producto ID:       {prod_id}")
print(f"3. Pedido ID:         {pedido_id}")
print(f"4. Detalle Pedido ID: {detalle_id}")
print("--------------------------------------------------\n")