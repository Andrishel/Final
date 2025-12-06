import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://127.0.0.1:53547'; 

export const options = {
  stages: [
    { duration: '30s', target: 50 }, 
    { duration: '1m', target: 50 },   
    { duration: '10s', target: 0 },   
  ],
  thresholds: {
    // Esto evita que K6 se queje si el servidor responde con 404 o 401
    // (Mientras responda, cuenta como éxito para la carga)
    http_req_failed: ['rate<1.0'], 
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/tutorias`);

  check(res, {
    // Verificamos que el servidor responda algo (aunque sea 404 o 401)
    'status is not 500': (r) => r.status < 500,
  });

  sleep(0.01); 
}