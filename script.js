// Simulador de Cajero Automático - Solo Retiro de Efectivo
// Lógica de negocio separada

class CajeroAutomatico {
    constructor() {
        this.saldo = 5000;
        this.pinCorrecto = '1234';
        this.montoRetiro = 0;
        this.pin = '';
        this.estado = 'bienvenida';
        this.intentosPin = 0;
        this.maxIntentos = 3;
        this.montoBuffer = '';
        
        this.inicializar();
    }

    inicializar() {
        this.mostrarPantalla('pantalla-bienvenida');
        this.estado = 'bienvenida';
    }

    mostrarPantalla(pantallaId) {
        // Ocultar todas las pantallas
        document.querySelectorAll('.screen-content').forEach(pantalla => {
            pantalla.classList.remove('active');
        });
        
        // Mostrar la pantalla solicitada
        document.getElementById(pantallaId).classList.add('active');
    }

    ingresarNumero(numero) {
        switch(this.estado) {
            case 'ingreso-pin':
                this.manejarIngresoPin(numero);
                break;
            case 'ingreso-monto':
                this.manejarIngresoMonto(numero);
                break;
            case 'confirmacion':
                this.manejarConfirmacion(numero);
                break;
        }
    }

    manejarIngresoPin(numero) {
        if (this.pin.length < 4) {
            this.pin += numero;
            this.actualizarDisplayPin();
        }
    }

    actualizarDisplayPin() {
        document.getElementById('pin-display').textContent = '*'.repeat(this.pin.length);
    }

    manejarIngresoMonto(numero) {
        if (this.montoBuffer.length < 3) { // Máximo 3 dígitos para rango 20-500
            this.montoBuffer += numero;
            this.actualizarDisplayMonto();
        }
    }

    actualizarDisplayMonto() {
        const monto = parseInt(this.montoBuffer) || 0;
        document.getElementById('monto-personalizado').textContent = '$' + monto.toLocaleString();
    }

    accionEnter() {
        switch(this.estado) {
            case 'bienvenida':
                this.iniciarSesion();
                break;
            case 'ingreso-pin':
                this.validarPin();
                break;
            case 'ingreso-monto':
                this.procesarMontoPersonalizado();
                break;
            case 'procesando':
            case 'exito':
            case 'error':
                this.volverAlInicio();
                break;
        }
    }

    iniciarSesion() {
        this.mostrarPantalla('pantalla-pin');
        this.estado = 'ingreso-pin';
        this.pin = '';
        this.actualizarDisplayPin();
    }

    validarPin() {
        if (this.pin === this.pinCorrecto) {
            this.mostrarPantallaRetiro();
            this.intentosPin = 0;
        } else {
            this.intentosPin++;
            if (this.intentosPin >= this.maxIntentos) {
                this.mostrarError('Tarjeta bloqueada. Contacte su banco.');
                setTimeout(() => this.inicializar(), 3000);
            } else {
                this.mostrarError(`PIN incorrecto. Intentos restantes: ${this.maxIntentos - this.intentosPin}`);
                this.pin = '';
                setTimeout(() => {
                    this.mostrarPantalla('pantalla-pin');
                    this.estado = 'ingreso-pin';
                }, 2000);
            }
        }
    }

    mostrarPantallaRetiro() {
        document.getElementById('saldo-actual').textContent = '$' + this.saldo.toLocaleString();
        this.mostrarPantalla('pantalla-retiro');
        this.estado = 'ingreso-monto';
        this.montoBuffer = '';
        this.actualizarDisplayMonto();
    }



    procesarMontoPersonalizado() {
        const monto = parseInt(this.montoBuffer) || 0;
        
        if (monto === 0) {
            this.mostrarError('Ingrese un monto válido');
            return;
        }
        
        if (monto < 20) {
            this.mostrarError('El monto mínimo es $20');
            return;
        }
        
        if (monto > 500) {
            this.mostrarError('El monto máximo es $500');
            return;
        }
        
        if (monto % 10 !== 0) {
            this.mostrarError('El monto debe ser múltiplo de $10');
            return;
        }
        
        this.montoRetiro = monto;
        this.mostrarConfirmacion();
    }

    mostrarConfirmacion() {
        if (this.montoRetiro > this.saldo) {
            this.mostrarError('Fondos insuficientes');
            return;
        }

        document.getElementById('monto-confirmar').textContent = '$' + this.montoRetiro.toLocaleString();
        document.getElementById('saldo-restante').textContent = '$' + (this.saldo - this.montoRetiro).toLocaleString();
        this.mostrarPantalla('pantalla-confirmacion');
        this.estado = 'confirmacion';
    }

    manejarConfirmacion(opcion) {
        if (opcion === 1) {
            this.procesarRetiro();
        } else if (opcion === 2) {
            this.mostrarPantallaRetiro();
        }
    }

    procesarRetiro() {
        this.mostrarPantalla('pantalla-procesando');
        this.estado = 'procesando';
        
        // Simular procesamiento
        setTimeout(() => {
            this.saldo -= this.montoRetiro;
            this.dispensarEfectivo();
            this.mostrarExito();
        }, 2000);
    }

    dispensarEfectivo() {
        const dispensador = document.getElementById('dispensador-efectivo');
        dispensador.classList.add('active');
        
        // Crear animación de billetes
        const cantidadBilletes = Math.ceil(this.montoRetiro / 10); // Un billete por cada $10
        dispensador.innerHTML = '';
        
        for (let i = 0; i < Math.min(cantidadBilletes, 15); i++) { // Máximo 15 billetes visibles
            setTimeout(() => {
                const billete = document.createElement('div');
                billete.className = 'billete';
                billete.style.cssText = `
                    position: absolute;
                    width: 60px;
                    height: 25px;
                    background: linear-gradient(90deg, #2ecc71, #27ae60);
                    border: 1px solid #1e8449;
                    border-radius: 3px;
                    font-size: 8px;
                    color: white;
                    text-align: center;
                    line-height: 25px;
                    left: ${Math.random() * 70}%;
                    top: -30px;
                    animation: caerBillete 2s ease-in forwards;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                `;
                billete.textContent = '$10';
                dispensador.appendChild(billete);
            }, i * 150);
        }
        
        // Volver al estado normal después de 5 segundos
        setTimeout(() => {
            dispensador.classList.remove('active');
            dispensador.innerHTML = '';
        }, 5000);
    }

    mostrarExito() {
        document.getElementById('monto-retirado').textContent = '$' + this.montoRetiro.toLocaleString();
        document.getElementById('saldo-final').textContent = '$' + this.saldo.toLocaleString();
        this.mostrarPantalla('pantalla-exito');
        this.estado = 'exito';
    }

    mostrarError(mensaje) {
        document.getElementById('mensaje-error').textContent = mensaje;
        this.mostrarPantalla('pantalla-error');
        this.estado = 'error';
    }

    limpiarEntrada() {
        if (this.estado === 'ingreso-pin') {
            this.pin = '';
            this.actualizarDisplayPin();
        } else if (this.estado === 'ingreso-monto') {
            this.montoBuffer = '';
            this.actualizarDisplayMonto();
        }
    }

    cancelarTransaccion() {
        if (this.estado !== 'bienvenida') {
            this.volverAlInicio();
        }
    }

    volverAlInicio() {
        this.pin = '';
        this.montoRetiro = 0;
        this.montoBuffer = '';
        this.intentosPin = 0;
        this.inicializar();
    }
}

// Instancia global del cajero
let cajero;

// Funciones para el HTML
function ingresarNumero(numero) {
    cajero.ingresarNumero(numero);
}

function accionEnter() {
    cajero.accionEnter();
}

function limpiarEntrada() {
    cajero.limpiarEntrada();
}

function cancelarTransaccion() {
    cajero.cancelarTransaccion();
}

// Inicializar cuando la página cargue
document.addEventListener('DOMContentLoaded', function() {
    cajero = new CajeroAutomatico();
});