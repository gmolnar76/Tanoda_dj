document.addEventListener('DOMContentLoaded', function() {
    // Alap Three.js beállítások egy forgó gömbhöz
    const container = document.getElementById('tron-threejs-container');
    if (!container) {
        console.error("Error: Could not find container element #tron-threejs-container");
    } else {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });

        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setClearColor(0x222244); // Sötétkék háttér
        container.appendChild(renderer.domElement);

        // Gömb létrehozása
        const geometry = new THREE.SphereGeometry(2, 64, 64);
        const material = new THREE.MeshPhongMaterial({
            color: 0x00ffff,
            shininess: 100,
            specular: 0xffffff,
            emissive: 0x111133
        });
        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);

        // Fények
        const ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);
        const pointLight = new THREE.PointLight(0xffffff, 1, 100);
        pointLight.position.set(5, 5, 5);
        scene.add(pointLight);

        camera.position.z = 7;

        // Animációs ciklus
        function animate() {
            requestAnimationFrame(animate);
            sphere.rotation.y += 0.01;
            sphere.rotation.x += 0.005;
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

        animate();
    }
});
