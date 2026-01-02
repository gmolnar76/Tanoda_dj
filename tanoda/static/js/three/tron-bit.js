// Globális változók deklarálása helyett használjuk a meglévőket
let bit;

function initTronBit(containerId) {
    // Three.js inicializálása
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    
    const container = document.getElementById(containerId);
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Oktaéder létrehozása
    const geometry = new THREE.OctahedronGeometry(1, 0);
    const material = new THREE.MeshPhongMaterial({ 
        color: 0x00ff00, 
        wireframe: false,
        emissive: 0x00ff00,
        emissiveIntensity: 0.5,
        shininess: 100
    });
    bit = new THREE.Mesh(geometry, material);
    scene.add(bit);

    // Fény hozzáadása
    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(0, 0, 10);
    scene.add(light);

    camera.position.z = 5;

    // Eseménykezelő az alakváltáshoz
    container.addEventListener('click', changeBitShape);

    // Animáció indítása
    animate();

    // Ablak átméretezés kezelése
    window.addEventListener('resize', onWindowResize);
}

function animate() {
    requestAnimationFrame(animate);
    bit.rotation.x += 0.01;
    bit.rotation.y += 0.01;
    renderer.render(scene, camera);
}

function changeBitShape() {
    const shapes = [
        new THREE.OctahedronGeometry(1, 0),
        new THREE.SphereGeometry(0.8, 32, 32),
        new THREE.IcosahedronGeometry(1, 0)
    ];
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    bit.geometry.dispose();
    bit.geometry = randomShape;
}

function onWindowResize() {
    const container = renderer.domElement.parentElement;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// Az initTronBit függvényt exportáljuk, hogy kívülről elérhető legyen
window.initTronBit = initTronBit;