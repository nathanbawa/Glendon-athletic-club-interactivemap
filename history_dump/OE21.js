import * as THREE from 'https://unpkg.com/three@0.156.1/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.156.1/examples/jsm/controls/OrbitControls.js';

const container = document.getElementById('scene');

const scene = new THREE.Scene();
scene.background = new THREE.Color('#eff1f4');

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 500);
camera.position.set(60, 50, 70);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;

scene.add(new THREE.AmbientLight(0xffffff, 0.6));

const light = new THREE.DirectionalLight(0xffffff, 0.9);
light.position.set(60, 80, 30);
light.castShadow = true;
light.shadow.mapSize.set(1024, 1024);
scene.add(light);

const groundGeo = new THREE.PlaneGeometry(240, 240, 24, 24);
const pos = groundGeo.attributes.position;
for (let i = 0; i < pos.count; i++) pos.setY(i, Math.sin(i * 0.3) * 0.6);
pos.needsUpdate = true;

const ground = new THREE.Mesh(
  groundGeo,
  new THREE.MeshStandardMaterial({ color: '#b7d2b5', roughness: 0.9 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const buildingMaterial = new THREE.MeshStandardMaterial({ color: '#e0e4ea', roughness: 0.6 });
const geoCache = new Map();

function getBox(w, h, d) {
  const key = `${w}-${h}-${d}`;
  if (!geoCache.has(key)) geoCache.set(key, new THREE.BoxGeometry(w, h, d));
  return geoCache.get(key);
}

function addBuilding(w, h, d, x, z) {
  const mesh = new THREE.Mesh(getBox(w, h, d), buildingMaterial);
  mesh.position.set(x, h / 2, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
}

addBuilding(14, 10, 12, 0, 0);
addBuilding(10, 8, 8, 18, -12);
addBuilding(12, 9, 10, -20, 14);
addBuilding(16, 6, 14, 10, 22);
addBuilding(6, 5, 6, -8, -18);

renderer.setAnimationLoop(() => {
  controls.update();
  renderer.render(scene, camera);
});

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }, 150);
});