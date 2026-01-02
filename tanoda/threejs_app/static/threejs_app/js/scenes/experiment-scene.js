// Three.js kísérleti jelenet - várakozás a THREE objektumra
(function() {
    // Várakozás a THREE objektum betöltődésére
    function checkThree() {
        if (typeof THREE !== 'undefined') {
            console.log('THREE objektum betöltődött, kísérlet inicializálása...');
            initThreeJSExperiment();
        } else {
            console.log('Várakozás a THREE objektum betöltődésére...');
            setTimeout(checkThree, 100);
        }
    }
    
    // Oldalbetöltés után ellenőrizzük a THREE objektumot
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOMContentLoaded esemény - várakozás a THREE objektumra...');
        checkThree();
    });
    
    // A fő inicializáló függvény, ami csak akkor fut le, ha a THREE objektum már elérhető
    function initThreeJSExperiment() {
        // Konténer elem referencia
        const container = document.getElementById('threejs-experiment-container');
        if (!container) {
            console.error('Nem található a threejs-experiment-container elem!');
            return;
        }
        
        console.log('Konténer megtalálva:', container);
        
        // Méretezés
        const width = container.clientWidth;
        const height = container.clientHeight;
        console.log('Konténer mérete:', width, 'x', height);

        // THREE.js alap komponensek
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1a2e); // Sötétkék háttér
        
        // Kamera
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.z = 8;
        camera.position.y = 2;
        
        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);
        
        // 1. Kocka
        const cubeGeometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
        const cubeMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x4cc9f0, // Cián kék
            metalness: 0.3,
            roughness: 0.2
        });
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.position.x = -3;
        cube.castShadow = true;
        cube.receiveShadow = true;
        scene.add(cube);
        
        // 2. Gömb
        const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
        const sphereMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xf72585, // Pink
            metalness: 0.1,
            roughness: 0.4
        });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.x = 0;
        sphere.castShadow = true;
        sphere.receiveShadow = true;
        scene.add(sphere);
        
        // 3. Tetraéder
        const tetraGeometry = new THREE.TetrahedronGeometry(1.2);
        const tetraMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x7209b7, // Lila
            metalness: 0.5,
            roughness: 0.2
        });
        const tetrahedron = new THREE.Mesh(tetraGeometry, tetraMaterial);
        tetrahedron.position.x = 3;
        tetrahedron.castShadow = true;
        tetrahedron.receiveShadow = true;
        scene.add(tetrahedron);
        
        // Fények
        // Ambient fény
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        
        // Spot fény
        const spotLight = new THREE.SpotLight(0xffffff, 1);
        spotLight.position.set(5, 10, 7);
        spotLight.angle = Math.PI / 4;
        spotLight.penumbra = 0.1;
        spotLight.decay = 2;
        spotLight.distance = 50;
        
        spotLight.castShadow = true;
        spotLight.shadow.mapSize.width = 1024;
        spotLight.shadow.mapSize.height = 1024;
        spotLight.shadow.camera.near = 0.5;
        spotLight.shadow.camera.far = 20;
        scene.add(spotLight);
        
        // Padló
        const floorGeometry = new THREE.PlaneGeometry(20, 20);
        const floorMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x16213e,
            metalness: 0.1,
            roughness: 0.7
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2; // Vízszintes elhelyezés
        floor.position.y = -2;
        floor.receiveShadow = true;
        scene.add(floor);
        
        // Vezérlő
        const rotationSpeedSlider = document.getElementById('rotation-speed');
        let rotationSpeed = 0.01; // Alapértelmezett érték
        
        if (rotationSpeedSlider) {
            rotationSpeed = parseFloat(rotationSpeedSlider.value);
            rotationSpeedSlider.addEventListener('input', function(e) {
                rotationSpeed = parseFloat(e.target.value);
            });
        } else {
            console.warn('Nem található a rotation-speed csúszka!');
        }
        
        // Ablak átméretezés kezelése
        function handleResize() {
            const width = container.clientWidth;
            const height = container.clientHeight;
            
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        }
        window.addEventListener('resize', handleResize);
        
        // Animációs ciklus
        function animate() {
            requestAnimationFrame(animate);
            
            // Objektumok forgatása
            cube.rotation.x += rotationSpeed;
            cube.rotation.y += rotationSpeed * 0.8;
            
            sphere.rotation.y += rotationSpeed * 1.2;
            sphere.rotation.z += rotationSpeed * 0.5;
            
            tetrahedron.rotation.x += rotationSpeed * 0.7;
            tetrahedron.rotation.y += rotationSpeed * 1.3;
            
            // Renderelés
            renderer.render(scene, camera);
        }
        
        // Indítás
        animate();
        console.log('Three.js animáció elindítva!');
    }
})();