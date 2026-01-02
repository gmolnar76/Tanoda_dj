let scene, camera, renderer;

function initThreeJs() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
  document.getElementById('threeJsRenderer').appendChild(renderer.domElement);
  camera.position.z = 5;
}

function renderScene() {
  renderer.render(scene, camera);
}