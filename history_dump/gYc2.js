import * as THREE from 'https://unpkg.com/three@0.156.1/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.156.1/examples/jsm/controls/OrbitControls.js';

// Ensure GSAP exists
if (!window.gsap) {
  console.warn("GSAP not loaded — animations disabled");
}

const container = document.getElementById('scene');
if (!container) {
  console.warn("Scene container not found");
  throw new Error("Missing #scene element");
}

const scene = new THREE.Scene();
scene.background = new THREE.Color('#eff1f4');

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 500);
camera.position.set(60, 50, 70);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio || 1);
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.maxPolarAngle = Math.PI / 2.1;
controls.minPolarAngle = Math.PI / 4.2;
controls.minDistance = 35;
controls.maxDistance = 120;
controls.target.set(0, 0, 0);

scene.add(new THREE.AmbientLight(0xffffff, 0.6));

const directional = new THREE.DirectionalLight(0xffffff, 0.9);
directional.position.set(60, 80, 30);
directional.castShadow = true;
directional.shadow.mapSize.set(2048, 2048);
scene.add(directional);

// Ground
const groundGeometry = new THREE.PlaneGeometry(240, 240, 24, 24);
const groundMaterial = new THREE.MeshStandardMaterial({
  color: '#b7d2b5',
  roughness: 0.9,
  metalness: 0.0
});

const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;

const positions = groundGeometry.attributes.position;
for (let i = 0; i < positions.count; i++) {
  positions.setY(i, Math.sin(i * 0.3) * 0.6);
}
positions.needsUpdate = true;
scene.add(ground);

const buildingMaterial = new THREE.MeshStandardMaterial({
  color: '#e0e4ea',
  roughness: 0.6,
  metalness: 0.1
});

function addBuilding(width, height, depth, x, z) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), buildingMaterial);
  mesh.position.set(x, height / 2, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
}

addBuilding(14, 10, 12, 0, 0);
addBuilding(10, 8, 8, 18, -12);
addBuilding(12, 9, 10, -20, 14);
addBuilding(16, 6, 14, 10, 22);
addBuilding(6, 5, 6, -8, -18);

// Locations
const locations = [
  { id: 'north', name: 'North Court', meta: 'Facility', position: new THREE.Vector3(0, 0, 0) },
  { id: 'library', name: 'Library', meta: 'Academic', position: new THREE.Vector3(18, 0, -12) },
  { id: 'residence', name: 'Residence', meta: 'Housing', position: new THREE.Vector3(-20, 0, 14) },
  { id: 'quad', name: 'Central Quad', meta: 'Open space', position: new THREE.Vector3(10, 0, 22) }
];

const list = document.getElementById('locationList');
if (list) {
  locations.forEach(location => {
    const item = document.createElement('div');
    item.className = 'panel-item';
    item.innerHTML = `<div class="panel-item-title">${location.name}</div>
                      <div class="panel-item-meta">${location.meta}</div>`;
    item.addEventListener('click', () => focusLocation(location));
    list.appendChild(item);
  });
}

function focusLocation(location) {
  const target = location.position.clone();
  const offset = new THREE.Vector3(28, 24, 28);
  const camTarget = target.clone().add(offset);

  if (window.gsap) {
    gsap.to(controls.target, { duration: 1.1, ...target, ease: 'power2.out' });
    gsap.to(camera.position, { duration: 1.1, ...camTarget, ease: 'power2.out' });
  } else {
    controls.target.copy(target);
    camera.position.copy(camTarget);
  }
}

// Controls
const zoomIn = document.querySelector('[data-action="zoom-in"]');
const zoomOut = document.querySelector('[data-action="zoom-out"]');
const reset = document.querySelector('[data-action="reset"]');

zoomIn?.addEventListener('click', () => { controls.dollyIn(1.1); controls.update(); });
zoomOut?.addEventListener('click', () => { controls.dollyOut(1.1); controls.update(); });
reset?.addEventListener('click', () => {
  if (window.gsap) {
    gsap.to(controls.target, { duration: 1, x: 0, y: 0, z: 0 });
    gsap.to(camera.position, { duration: 1, x: 60, y: 50, z: 70 });
  } else {
    controls.target.set(0, 0, 0);
    camera.position.set(60, 50, 70);
  }
});

// Sidebar toggle
const toggle = document.querySelector('.panel-toggle');
const sidebar = document.querySelector('.sidebar');
let collapsed = false;

toggle?.addEventListener('click', () => {
  collapsed = !collapsed;
  toggle.setAttribute('aria-expanded', String(!collapsed));
  if (window.gsap) {
    gsap.to(sidebar, { height: collapsed ? 54 : sidebar.scrollHeight, duration: 0.3 });
  } else {
    sidebar.style.height = collapsed ? '54px' : 'auto';
  }
});

let running = true;
document.addEventListener("visibilitychange", () => {
  running = !document.hidden;
});

function animate() {
  if (!running) return;
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});