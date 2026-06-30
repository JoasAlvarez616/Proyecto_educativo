// modulos/sistema-solar/js/sistema-solar.js

import * as THREE from 'three';
import { DATOS_PLANETAS } from './datos.js';

export let planetas = [];
export let solMesh;

// ==========================================
// FUNCIÓN PARA CREAR TEXTURA DE ANILLOS
// ==========================================
function crearTexturaAnillosCompacta() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radioMax = canvas.width / 2;

    const bandas = [
        { radio: 0.14, color: 'rgba(180, 160, 140, 0.4)', grosor: 6 },
        { radio: 0.17, color: 'rgba(220, 200, 180, 0.8)', grosor: 10 },
        { radio: 0.20, color: 'rgba(190, 170, 150, 0.5)', grosor: 8 },
        { radio: 0.23, color: 'rgba(240, 220, 200, 0.9)', grosor: 12 },
        { radio: 0.27, color: 'rgba(160, 140, 120, 0.4)', grosor: 6 },
        { radio: 0.30, color: 'rgba(230, 210, 190, 0.85)', grosor: 10 },
        { radio: 0.34, color: 'rgba(180, 160, 140, 0.5)', grosor: 8 },
        { radio: 0.37, color: 'rgba(250, 230, 210, 0.9)', grosor: 14 },
        { radio: 0.41, color: 'rgba(150, 130, 110, 0.3)', grosor: 6 },
        { radio: 0.44, color: 'rgba(220, 200, 180, 0.8)', grosor: 10 },
        { radio: 0.48, color: 'rgba(170, 150, 130, 0.4)', grosor: 6 },
        { radio: 0.51, color: 'rgba(240, 220, 200, 0.85)', grosor: 12 },
        { radio: 0.55, color: 'rgba(140, 120, 100, 0.3)', grosor: 6 },
        { radio: 0.58, color: 'rgba(230, 210, 190, 0.75)', grosor: 10 },
        { radio: 0.62, color: 'rgba(190, 170, 150, 0.5)', grosor: 8 },
        { radio: 0.65, color: 'rgba(250, 230, 210, 0.8)', grosor: 12 },
        { radio: 0.69, color: 'rgba(160, 140, 120, 0.3)', grosor: 6 },
        { radio: 0.72, color: 'rgba(220, 200, 180, 0.7)', grosor: 10 },
        { radio: 0.76, color: 'rgba(180, 160, 140, 0.4)', grosor: 8 },
        { radio: 0.79, color: 'rgba(240, 220, 200, 0.7)', grosor: 12 },
        { radio: 0.83, color: 'rgba(150, 130, 110, 0.25)', grosor: 6 },
        { radio: 0.86, color: 'rgba(210, 190, 170, 0.5)', grosor: 10 },
        { radio: 0.90, color: 'rgba(170, 150, 130, 0.3)', grosor: 8 },
        { radio: 0.93, color: 'rgba(230, 210, 190, 0.4)', grosor: 10 }
    ];

    bandas.forEach((b) => {
        const r = b.radio * radioMax;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = b.color;
        ctx.lineWidth = b.grosor;
        ctx.stroke();
    });

    for (let i = 0; i < 200; i++) {
        const radio = 0.12 + Math.random() * 0.80;
        const r = radio * radioMax;
        const grosor = 0.5 + Math.random() * 2.5;
        const alpha = 0.05 + Math.random() * 0.3;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 240, 220, ${alpha})`;
        ctx.lineWidth = grosor;
        ctx.stroke();
    }

    for (let i = 0; i < 8000; i++) {
        const ang = Math.random() * Math.PI * 2;
        const rad = 0.1 + Math.random() * 0.85;
        const r = rad * radioMax;
        const x = cx + Math.cos(ang) * r;
        const y = cy + Math.sin(ang) * r;
        const size = 1 + Math.random() * 2;
        const alpha = Math.random() * 0.04;
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fillRect(x, y, size, size);
    }

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radioMax);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    grad.addColorStop(0.1, 'rgba(255, 255, 255, 0.01)');
    grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.04)');
    grad.addColorStop(0.9, 'rgba(255, 255, 255, 0.02)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

// ==========================================
// FUNCIÓN PARA CREAR MÁSCARA DEL ANILLO
// ==========================================
function crearMascaraAnilloCompacta() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radioExt = canvas.width / 2;
    const radioInt = radioExt * 0.28;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const grad = ctx.createRadialGradient(cx, cy, radioInt * 0.5, cx, cy, radioExt * 1.02);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(0.06, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(0.10, 'rgba(0, 0, 0, 0.1)');
    grad.addColorStop(0.15, 'rgba(255, 255, 255, 0.4)');
    grad.addColorStop(0.22, 'rgba(255, 255, 255, 0.9)');
    grad.addColorStop(0.30, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.75, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.88, 'rgba(255, 255, 255, 0.6)');
    grad.addColorStop(0.95, 'rgba(255, 255, 255, 0.15)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

// ==========================================
// CREAR SISTEMA SOLAR
// ==========================================
export function crearSistemaSolar(scene) {

    const textureLoader = new THREE.TextureLoader();

    // ==========================================
    // 1. SOL CINEMATOGRÁFICO
    // ==========================================
    const solGeom = new THREE.SphereGeometry(3, 96, 96);
    let solMaterial;

    try {
        const solTex = textureLoader.load('assets/texturas/sol.jpg');
        solMaterial = new THREE.MeshStandardMaterial({
            map: solTex,
            emissiveMap: solTex,
            emissive: new THREE.Color(0xffffff),
            emissiveIntensity: 2.8,
            roughness: 1,
            metalness: 0,
            depthWrite: true,
            depthTest: true
        });
    } catch (e) {
        solMaterial = new THREE.MeshStandardMaterial({
            color: 0xffaa33,
            emissive: new THREE.Color(0xffaa33),
            emissiveIntensity: 3,
            depthWrite: true,
            depthTest: true
        });
    }

    solMesh = new THREE.Mesh(solGeom, solMaterial);
    solMesh.castShadow = false;
    solMesh.receiveShadow = false;
    solMesh.renderOrder = 1;
    scene.add(solMesh);

    // ==========================================
    // FOTOSFERA SUAVE
    // ==========================================
    const fotosferaGeom = new THREE.SphereGeometry(3.12, 96, 96);
    const fotosferaMat = new THREE.MeshBasicMaterial({
        color: 0xffcc66,
        transparent: true,
        opacity: 0.08,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.BackSide
    });
    const fotosfera = new THREE.Mesh(fotosferaGeom, fotosferaMat);
    solMesh.add(fotosfera);

    // ==========================================
    // LUZ PRINCIPAL DEL SOL (más suave)
    // ==========================================
    const luzSol = new THREE.PointLight(0xfff4dd, 2.5, 300);
    luzSol.position.set(0, 0, 0);
    scene.add(luzSol);

    // ==========================================
    // LUZ SECUNDARIA CÁLIDA (casi imperceptible)
    // ==========================================
    const luzSolSecundaria = new THREE.PointLight(0xffaa44, 0.8, 200);
    luzSolSecundaria.position.set(0, 0, 0);
    scene.add(luzSolSecundaria);

    // ==========================================
    // 2. PLANETAS
    // ==========================================
    DATOS_PLANETAS.forEach((data) => {

        let material;

        if (data.textura) {
            try {
                const tex = textureLoader.load(data.textura);
                material = new THREE.MeshStandardMaterial({
                    map: tex,
                    roughness: 0.5,
                    metalness: 0.1,
                    depthWrite: true,
                    depthTest: true
                });
            } catch (e) {
                material = new THREE.MeshStandardMaterial({
                    color: data.color,
                    depthWrite: true,
                    depthTest: true
                });
            }
        } else {
            material = new THREE.MeshStandardMaterial({
                color: data.color,
                depthWrite: true,
                depthTest: true
            });
        }

        const geom = new THREE.SphereGeometry(data.tamano, 48, 48);
        const mesh = new THREE.Mesh(geom, material);
        mesh.renderOrder = 2;
        mesh.depthTest = true;
        mesh.depthWrite = true;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const angulo = Math.random() * Math.PI * 2;
        mesh.position.x = Math.cos(angulo) * data.distancia;
        mesh.position.z = Math.sin(angulo) * data.distancia;

        mesh.userData = {
            id: data.id,
            nombre: data.nombre,
            distancia: data.distancia,
            velocidad: data.velocidad,
            angulo: angulo,
            descripcion: data.descripcion,
            datoCurioso: data.datoCurioso,
            anillos: []
        };

        scene.add(mesh);
        planetas.push(mesh);

        // ==========================================
        // 3. ÓRBITA (más sutil)
        // ==========================================
        const orbitaGeom = new THREE.RingGeometry(data.distancia - 0.03, data.distancia + 0.03, 64);
        const orbitaMat = new THREE.MeshBasicMaterial({
            color: data.color,
            transparent: true,
            opacity: 0.03,
            side: THREE.DoubleSide,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: -2,
            polygonOffsetUnits: -2
        });
        const orbitaMesh = new THREE.Mesh(orbitaGeom, orbitaMat);
        orbitaMesh.rotation.x = Math.PI / 2;
        orbitaMesh.renderOrder = -2;
        orbitaMesh.castShadow = false;
        orbitaMesh.receiveShadow = false;
        scene.add(orbitaMesh);

        // ==========================================
        // 4. ANILLOS DE SATURNO
        // ==========================================
        if (data.id === 'saturno') {

            const texturaAnillos = crearTexturaAnillosCompacta();
            const texturaMascara = crearMascaraAnilloCompacta();

            const anilloGeom = new THREE.PlaneGeometry(
                data.tamano * 4.0,
                data.tamano * 4.0
            );

            const anilloMat = new THREE.MeshBasicMaterial({
                map: texturaAnillos,
                alphaMap: texturaMascara,
                transparent: true,
                alphaTest: 0.01,
                side: THREE.DoubleSide,
                depthWrite: false,
                depthTest: true,
                opacity: 0.92
            });

            const anilloMesh = new THREE.Mesh(anilloGeom, anilloMat);
            anilloMesh.rotation.x = Math.PI / 5.2;
            anilloMesh.position.copy(mesh.position);
            anilloMesh.renderOrder = 0;
            anilloMesh.castShadow = false;
            anilloMesh.receiveShadow = false;

            mesh.userData.anillos = [anilloMesh];
            scene.add(anilloMesh);
        }
    });
}

// ==========================================
// 5. ANIMACIÓN
// ==========================================
export function actualizarOrbitas() {
    planetas.forEach((p) => {
        const data = p.userData;
        data.angulo += data.velocidad;
        p.position.x = Math.cos(data.angulo) * data.distancia;
        p.position.z = Math.sin(data.angulo) * data.distancia;
        p.rotation.y += 0.01;

        if (data.anillos && data.anillos.length > 0) {
            data.anillos.forEach((anillo) => {
                anillo.position.copy(p.position);
                anillo.rotation.z += 0.0003;
            });
        }
    });

    // ==========================================
    // ANIMACIÓN DEL SOL
    // ==========================================
    if (solMesh) {
        const tiempo = Date.now() * 0.001;

        solMesh.rotation.y += 0.0008;

        const pulso = 1 + Math.sin(tiempo * 0.25) * 0.002;

        solMesh.scale.set(pulso, pulso, pulso);
    }
}