import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

// ─────────────────────────────────────────────
// Scene
// ─────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf2f1ee);

// ─────────────────────────────────────────────
// Camera
// ─────────────────────────────────────────────
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);
camera.position.set(10, 10, 10);

// ─────────────────────────────────────────────
// Renderer
// ─────────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

// ─────────────────────────────────────────────
// Lights
// ─────────────────────────────────────────────
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.2));

const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight.position.set(50, 100, 50);
scene.add(dirLight);

// ─────────────────────────────────────────────
// Controls
// ─────────────────────────────────────────────
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 2;
controls.maxDistance = 300;
controls.maxPolarAngle = Math.PI / 2.05;

// ─────────────────────────────────────────────
// Load Model
// ─────────────────────────────────────────────
const loader = new GLTFLoader();

loader.load(
  './models/carteintergl1.compressed.glb',
  (gltf) => {
    const model = gltf.scene;
    scene.add(model);

    // Auto-center & frame model
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3()).length();

    model.position.sub(center);

    controls.target.set(0, 0, 0);
    camera.position.set(size * 0.6, size * 0.4, size * 0.6);
    camera.lookAt(0, 0, 0);
  },
  undefined,
  (error) => {
    console.error('GLB loading error:', error);
  }
);

// ─────────────────────────────────────────────
// Resize
// ─────────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ─────────────────────────────────────────────
// Animate
// ─────────────────────────────────────────────
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
