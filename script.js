// ⚠️ REEMPLAZA ESTA URL POR TU LINK REAL DE RENDER ⚠️
const API_URL = "https://solenation-backend.onrender.com/";

document.addEventListener('DOMContentLoaded', () => {
    console.log("SoleNation App cargada correctamente.");

    const formPedido = document.getElementById('form-pedido');

    if (formPedido) {
        formPedido.addEventListener('submit', (e) => {
            e.preventDefault();

            const selectProducto = document.getElementById('select-producto');
            const optionSeleccionada = selectProducto.options[selectProducto.selectedIndex];
            const precio = parseFloat(optionSeleccionada.getAttribute('data-precio')) || 0;
            const cantidad = parseInt(document.getElementById('input-cantidad').value) || 1;

            const payload = {
                nombre: document.getElementById('cliente-nombre').value,
                apellido: document.getElementById('cliente-apellido').value,
                correo: document.getElementById('cliente-correo').value,
                telefono: document.getElementById('cliente-telefono').value,
                producto: selectProducto.value,
                talla: document.getElementById('select-talla').value,
                cantidad: cantidad,
                total: precio * cantidad
            };

            fetch(`${API_URL}/api/pedido`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })
            .then(res => res.json())
            .then(data => {
                alert(data.mensaje);
                formPedido.reset();
                document.getElementById('monto-total').textContent = "S/ 0.00";
                cargarPedidos();
            })
            .catch(err => console.error("Error al registrar pedido:", err));
        });
    }

    cargarPedidos();
});

function filtrarProductos(categoria) {
    const productos = document.querySelectorAll('.card-product');
    productos.forEach(producto => {
        const catProducto = producto.getAttribute('data-categoria');
        if (categoria === 'todos' || catProducto === categoria) {
            producto.style.display = 'block';
        } else {
            producto.style.display = 'none';
        }
    });
}

function calcularTotal() {
    const selectProducto = document.getElementById('select-producto');
    const inputCantidad = document.getElementById('input-cantidad');
    const montoTotalSpan = document.getElementById('monto-total');

    if (selectProducto && inputCantidad && montoTotalSpan) {
        const optionSeleccionada = selectProducto.options[selectProducto.selectedIndex];
        const precio = parseFloat(optionSeleccionada.getAttribute('data-precio')) || 0;
        const cantidad = parseInt(inputCantidad.value) || 1;

        const total = precio * cantidad;
        montoTotalSpan.textContent = `S/ ${total.toFixed(2)}`;
    }
}

// MOSTRAR PEDIDOS CON BOTONES DE EDITAR Y ELIMINAR
function cargarPedidos() {
    fetch(`${API_URL}/api/pedidos`)
        .then(res => res.json())
        .then(pedidos => {
            const contenedor = document.getElementById('lista-pedidos');
            if (!contenedor) return;
            
            contenedor.innerHTML = "";
            pedidos.forEach(p => {
                contenedor.innerHTML += `
                    <div style="border: 1px solid #ddd; padding: 12px; margin-bottom: 10px; border-radius: 5px; background: #fff;">
                        <p><strong>Cliente:</strong> ${p.cliente}</p>
                        <p><strong>Producto:</strong> ${p.producto} (Talla: ${p.talla})</p>
                        <p><strong>Cantidad:</strong> ${p.cantidad} | <strong>Total:</strong> S/ ${p.monto_total.toFixed(2)}</p>
                        <p><small>Fecha: ${p.fecha}</small></p>
                        <div style="margin-top: 8px;">
                            <button onclick="editarPedido('${p.id}', ${p.cantidad})" style="background-color: #ff9900; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; margin-right: 5px;">Editar Cantidad</button>
                            <button onclick="eliminarPedido('${p.id}')" style="background-color: #ff4d4d; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">Eliminar</button>
                        </div>
                    </div>
                `;
            });
        })
        .catch(err => console.error("Error cargando pedidos:", err));
}

// FUNCION PARA ELIMINAR PEDIDO (DELETE)
function eliminarPedido(id) {
    if (confirm("¿Estás seguro de que deseas eliminar este pedido?")) {
        fetch(`${API_URL}/api/pedidos/${id}`, {
            method: "DELETE"
        })
        .then(res => res.json())
        .then(data => {
            alert(data.mensaje);
            cargarPedidos();
        })
        .catch(err => console.error("Error al eliminar pedido:", err));
    }
}

// FUNCION PARA MODIFICAR PEDIDO (PUT)
function editarPedido(id, cantidadActual) {
    const nuevaCantidad = prompt("Ingresa la nueva cantidad de pares:", cantidadActual);
    if (nuevaCantidad !== null && nuevaCantidad > 0) {
        fetch(`${API_URL}/api/pedidos/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cantidad: parseInt(nuevaCantidad) })
        })
        .then(res => res.json())
        .then(data => {
            alert(data.mensaje);
            cargarPedidos();
        })
        .catch(err => console.error("Error al actualizar pedido:", err));
    }
}