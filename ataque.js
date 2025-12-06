const http = require('http');

// Configuración
const TOTAL_REQUESTS = 60000; // Número de peticiones a lanzar
const CONCURRENCY = 2000;      // Cuántas lanzar al mismo tiempo
const URL_OPTIONS = {
    hostname: 'localhost',    // Tu túnel
    port: 80,                 // Puerto de Kong
    path: '/tutorias',        // Ruta a atacar
    method: 'GET',            // Usamos GET para que sea rápido (listar tutorias)
};

let completed = 0;
let success = 0;
let fail = 0;

console.log(`🚀 INICIANDO ATAQUE: ${TOTAL_REQUESTS} peticiones a http://localhost/tutorias`);

function sendRequest() {
    if (completed >= TOTAL_REQUESTS) return;

    const req = http.request(URL_OPTIONS, (res) => {
        // Solo contamos como éxito si responde (aunque sea error de negocio)
        // Lo importante es que el servidor trabaje procesando la petición
        if (res.statusCode >= 200 && res.statusCode < 500) {
            success++;
        } else {
            fail++;
        }
        res.on('data', () => {}); // Consumir data para liberar memoria
        res.on('end', next);
    });

    req.on('error', (e) => {
        fail++;
        next();
    });

    req.end();
}

function next() {
    completed++;
    if (completed % 500 === 0) {
        console.log(`👉 Progreso: ${completed}/${TOTAL_REQUESTS} (Éxitos: ${success} | Fallos: ${fail})`);
    }
    
    if (completed < TOTAL_REQUESTS) {
        sendRequest(); // Lanza la siguiente
    } else if (completed === TOTAL_REQUESTS) {
        console.log('✅ ATAQUE FINALIZADO');
    }
}

// Iniciar el enjambre
for (let i = 0; i < CONCURRENCY; i++) {
    sendRequest();
}