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
        if (this.montoBuffer.length < 6) { // Máximo 6 dígitos
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
        this.estado = 'seleccion-monto';
        this.montoBuffer = '';
        this.actualizarDisplayMonto();
    }

    seleccionarMonto(monto) {
        if (this.estado === 'seleccion-monto') {
            this.montoRetiro = monto;
            this.mostrarConfirmacion();
        }
    }

    habilitarMontoPersonalizado() {
        this.estado = 'ingreso-monto';
        this.montoBuffer = '';
        this.actualizarDisplayMonto();
        document.getElementById('monto-personalizado').style.backgroundColor = '#003300';
    }

    procesarMontoPersonalizado() {
        const monto = parseInt(this.montoBuffer) || 0;
        
        if (monto === 0) {
            this.mostrarError('Ingrese un monto válido');
            return;
        }
        
        if (monto < 100) {
            this.mostrarError('El monto mínimo es $100');
            return;
        }
        
        if (monto % 100 !== 0) {
            this.mostrarError('El monto debe ser múltiplo de $100');
            return;
        }
        
        if (monto > 2000) {
            this.mostrarError('El monto máximo por transacción es $2,000');
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
        dispensador.innerHTML = '<div style="color: white; text-align: center; line-height: 40px; font-size: 12px;">💰 RETIRE SU DINERO 💰</div>';
        
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

function seleccionarMonto(monto) {
    cajero.seleccionarMonto(monto);
}

function limpiarEntrada() {
    cajero.limpiarEntrada();
}

function cancelarTransaccion() {
    cajero.cancelarTransaccion();
}

function habilitarMontoPersonalizado() {
    cajero.habilitarMontoPersonalizado();
}

// Inicializar cuando la página cargue
document.addEventListener('DOMContentLoaded', function() {
    cajero = new CajeroAutomatico();
});