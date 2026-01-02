// Alap Three.js beállítások
const container = document.getElementById('threejs-container');
if (!container) {
    console.error("Error: Could not find container element #threejs-container");
} else {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x111111); // Sötét háttér
    container.appendChild(renderer.domElement);

    // Kockák létrehozása
    const geometry = new THREE.BoxGeometry();
    const cubes = [];
    const colors = [0xff00ff, 0x00ffff, 0xffff00, 0x00ff00]; // Neon színek

    for (let i = 0; i < 20; i++) {
        const material = new THREE.MeshPhongMaterial({
            color: colors[Math.floor(Math.random() * colors.length)],
            shininess: 100,
            specular: 0xffffff
        });
        const cube = new THREE.Mesh(geometry, material);

        cube.position.x = (Math.random() - 0.5) * 10;
        cube.position.y = (Math.random() - 0.5) * 10;
        cube.position.z = (Math.random() - 0.5) * 10;

        cube.rotation.x = Math.random() * 2 * Math.PI;
        cube.rotation.y = Math.random() * 2 * Math.PI;

        const scale = Math.random() * 0.5 + 0.2;
        cube.scale.set(scale, scale, scale);

        scene.add(cube);
        cubes.push(cube);
    }

    // Fények
    const ambientLight = new THREE.AmbientLight(0x404040); // Lágy fehér fény
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    camera.position.z = 8;

    // Animációs ciklus
    function animate() {
        requestAnimationFrame(animate);

        cubes.forEach(cube => {
            cube.rotation.x += 0.005 + Math.random() * 0.005;
            cube.rotation.y += 0.005 + Math.random() * 0.005;

            // Lebegő mozgás (opcionális)
            cube.position.y += Math.sin(Date.now() * 0.001 + cube.position.x) * 0.005;
        });

        renderer.render(scene, camera);
    }

    // Ablak átméretezés kezelése
    function onWindowResize() {
        if (container) {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        }
    }

    window.addEventListener('resize', onWindowResize, false);

    // Indítás
    animate();
}