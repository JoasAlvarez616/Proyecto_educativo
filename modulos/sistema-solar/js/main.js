// modulos/sistema-solar/js/main.js

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { crearSistemaSolar, actualizarOrbitas, planetas, solMesh } from './sistema-solar.js';
import { crearFondoEstrellas, crearNebulosa, crearIluminacion } from './entorno.js';

// ==========================================
// 1. ESCENA, CÁMARA, RENDER
// ==========================================
const contenedor = document.getElementById('canvas-container');
if (!contenedor) {
    console.error('❌ Contenedor no encontrado');
}

const escena = new THREE.Scene();
escena.background = new THREE.Color(0x050510);

const camara = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 500);
camara.position.set(18, 12, 35);

const renderizador = new THREE.WebGLRenderer({ 
    antialias: true,
    powerPreference: "high-performance"  // 🔥 Mejor rendimiento
});
renderizador.setSize(window.innerWidth, window.innerHeight);
renderizador.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderizador.shadowMap.enabled = true;
renderizador.shadowMap.type = THREE.PCFSoftShadowMap;
renderizador.toneMapping = THREE.ACESFilmicToneMapping;
renderizador.toneMappingExposure = 1.3;

if (contenedor) {
    contenedor.appendChild(renderizador.domElement);
    console.log('✅ Renderizador añadido al contenedor');
}

// ==========================================
// 2. EFFECT COMPOSER (BLOOM)
// ==========================================
const composer = new EffectComposer(renderizador);
composer.addPass(new RenderPass(escena, camara));

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.0,
    0.25,
    0.85
);
composer.addPass(bloomPass);

// ==========================================
// 3. CONTROLES
// ==========================================
const controles = new OrbitControls(camara, renderizador.domElement);
controles.enableDamping = true;
controles.dampingFactor = 0.08;
controles.maxDistance = 150;
controles.minDistance = 5;
controles.target.set(0, 0, 0);

// ==========================================
// 4. ILUMINACIÓN Y ENTORNO
// ==========================================
crearIluminacion(escena);
crearFondoEstrellas(escena);
crearNebulosa(escena);

// ==========================================
// 5. CREAR SISTEMA SOLAR
// ==========================================
try {
    crearSistemaSolar(escena);
} catch (error) {
    console.warn('⚠️ Error al crear el sistema solar:', error);
}

// ==========================================
// 6. DETECCIÓN DE CLICS
// ==========================================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onPlanetClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camara);

    const objetos = [...planetas, solMesh].filter(Boolean);
    const intersecciones = raycaster.intersectObjects(objetos);

    if (intersecciones.length > 0) {
        const objeto = intersecciones[0].object;
        const data = objeto.userData;
        if (data && data.nombre) {
            abrirModal(data);
        }
    }
}

window.addEventListener('click', onPlanetClick);

// ==========================================
// 7. MODAL
// ==========================================
const modal = document.getElementById('modal-planeta');
const btnCerrar = document.getElementById('btn-cerrar');
const nombreEl = document.getElementById('planeta-nombre');
const descripcionEl = document.getElementById('planeta-descripcion');
const datoCuriosoEl = document.getElementById('planeta-dato-curioso');

function abrirModal(data) {
    if (!modal || !nombreEl || !descripcionEl || !datoCuriosoEl) return;
    nombreEl.textContent = data.nombre;
    descripcionEl.textContent = data.descripcion;
    datoCuriosoEl.textContent = `✨ Dato curioso: ${data.datoCurioso}`;
    modal.classList.remove('oculto');
}

function cerrarModal() {
    if (modal) modal.classList.add('oculto');
}

if (btnCerrar) btnCerrar.addEventListener('click', cerrarModal);
if (modal) {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) cerrarModal();
    });
}

// ==========================================
// 8. CONTROLES DE ZOOM
// ==========================================
const btnZoomIn = document.getElementById('btn-zoom-in');
const btnZoomOut = document.getElementById('btn-zoom-out');
const btnReset = document.getElementById('btn-reset');

if (btnZoomIn) {
    btnZoomIn.addEventListener('click', () => {
        camara.position.multiplyScalar(0.9);
    });
}

if (btnZoomOut) {
    btnZoomOut.addEventListener('click', () => {
        camara.position.multiplyScalar(1.1);
    });
}

if (btnReset) {
    btnReset.addEventListener('click', () => {
        camara.position.set(18, 12, 35);
        controles.target.set(0, 0, 0);
        controles.update();
    });
}

// ==========================================
// 9. REDIMENSIONAR
// ==========================================
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camara.aspect = width / height;
    camara.updateProjectionMatrix();

    renderizador.setSize(width, height);
    composer.setSize(width, height);
});

// ==========================================
// 10. BUCLE DE ANIMACIÓN
// ==========================================
function animar() {
    requestAnimationFrame(animar);
    actualizarOrbitas();
    controles.update();
    composer.render();
}

animar();

console.log('🚀 Sistema Solar cargado correctamente');