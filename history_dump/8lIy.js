import * as THREE from 'https://unpkg.com/three@0.156.1/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.156.1/examples/jsm/controls/OrbitControls.js';

/* ===========================
   THREE SCENE (Optimized)
=========================== */

const scene = new THREE.Scene();
scene.background = new THREE.Color('#eff1f4');

const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  500
);
camera.position.set(60, 50, 70);

const renderer = new THREE.WebGLRenderer({
  antialias: false, // 🔥 disable expensive AA
  powerPreference: "high-performance"
});

// 🔥 Limit pixel ratio for mobile performance
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);

// 🔥 Reduce shadow cost
renderer.shadowMap.enabled = false;
renderer.toneMapping = THREE.ACESFilmicToneMapping;

document.getElementById('scene').appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.maxPolarAngle = Math.PI / 2.1;
controls.minPolarAngle = Math.PI / 4.2;
controls.minDistance = 35;
controls.maxDistance = 120;

/* ===========================
   LIGHTING (lighter)
=========================== */

scene.add(new THREE.AmbientLight(0xffffff, 0.8));

const directional = new THREE.DirectionalLight(0xffffff, 0.6);
directional.position.set(60, 80, 30);
scene.add(directional);

/* ===========================
   GROUND (Reduced geometry)
=========================== */

const groundGeometry = new THREE.PlaneGeometry(240, 240, 12, 12); // 🔥 reduced segments
const groundMaterial = new THREE.MeshStandardMaterial({
  color: '#b7d2b5',
  roughness: 0.9
});

const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

/* ===========================
   BUILDINGS
=========================== */

const buildingMaterial = new THREE.MeshStandardMaterial({
  color: '#e0e4ea',
  roughness: 0.6
});

function addBuilding(width, height, depth, x, z) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    buildingMaterial
  );
  mesh.position.set(x, height / 2, z);
  scene.add(mesh);
}

addBuilding(14, 10, 12, 0, 0);
addBuilding(10, 8, 8, 18, -12);
addBuilding(12, 9, 10, -20, 14);
addBuilding(16, 6, 14, 10, 22);
addBuilding(6, 5, 6, -8, -18);

/* ===========================
   RENDER ON DEMAND (🔥 BIG WIN)
=========================== */

let needsRender = true;

function render() {
  if (!needsRender) return;
  renderer.render(scene, camera);
  needsRender = false;
}

controls.addEventListener('change', () => {
  needsRender = true;
  render();
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  needsRender = true;
  render();
});

render();

/* ===========================
   GYM VIEWER (Optimized)
=========================== */

const ROOMS = [
  { id: 'cycling', name: 'Cycling Room', icon: '🚴', color: '#ffb74d' },
  { id: 'stretching', name: 'Stretching Room', icon: '🧘', color: '#ba68c8' },
  { id: 'boxing', name: 'Boxing Room', icon: '🥊', color: '#e57373' },
  { id: 'golf', name: 'Golf Court', icon: '⛳', color: '#7cc576' },
  { id: 'lobby', name: 'Lobby', icon: '🏢', color: '#f5c16c' },
  { id: 'pool', name: 'Swimming Pool', icon: '🏊', color: '#4da3ff' },
  { id: 'squash', name: 'Squash Courts', icon: '🏸', color: '#aed581' },
  { id: 'weight', name: 'Weight Room', icon: '🏋️', color: '#7cc576' }
];

class GymViewer {
  constructor() {
    this.modelViewer = document.getElementById('modelViewer');
    this.legendContainer = document.getElementById('legend');
    this.hotspots = [];

    if (this.modelViewer && this.legendContainer) {
      this.init();
    }
  }

  init() {
    this.createLegend();
    this.setupHotspots();
  }

  createLegend() {
    const fragment = document.createDocumentFragment();

    ROOMS.forEach(room => {
      const item = document.createElement('div');
      item.className = 'legend-item';

      item.innerHTML = `
        <div class="legend-item-color" style="background:${room.color}"></div>
        <span>${room.icon}</span>
        <span>${room.name}</span>
      `;

      fragment.appendChild(item);
    });

    this.legendContainer.appendChild(fragment);
  }

  setupHotspots() {
    const hotspotElements =
      this.modelViewer.querySelectorAll('.Hotspot');

    hotspotElements.forEach(element => {
      element.addEventListener('click', () => {
        this.focusCamera(element);
      });
    });
  }

  focusCamera(hotspotElement) {
    const position = hotspotElement.getAttribute('data-position');
    if (!position) return;

    const coords = position.match(/([-\d.]+)m\s+([-\d.]+)m\s+([-\d.]+)m/);
    if (!coords) return;

    this.modelViewer.cameraOrbit = `0deg 75deg 50m`;
    this.modelViewer.cameraTarget =
      `${coords[1]}m ${coords[2]}m ${coords[3]}m`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new GymViewer();
});
