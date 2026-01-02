/**
 * Three.js Initializer
 * 
 * Ez a modul felelős a Three.js jelenetek inicializálásáért, kezeléséért.
 * A különböző sablonok és nézetek ezt használhatják Three.js alapú 3D tartalmak megjelenítésére.
 */

// Névtér létrehozása, hogy elkerüljük a globális névtér szennyezését
const ThreeJSInitializer = (function() {
    // Privát változók
    let renderer;
    let scene;
    let camera;
    let controls;
    let stats;
    let width;
    let height;
    let container;
    let animationFrameId;
    let objects = {};
    let customRenderFunction = null;
    
    // Alapértelmezett beállítások
    const defaultOptions = {
        cameraPosition: { x: 0, y: 5, z: 10 },
        cameraLookAt: { x: 0, y: 0, z: 0 },
        enableControls: true,
        stats: false,
        backgroundColor: 0x121212,
        lights: [
            { type: 'ambient', color: 0x404040 },
            { type: 'directional', color: 0xffffff, intensity: 1, position: { x: 5, y: 5, z: 5 } }
        ],
        defaultObjects: [
            { type: 'grid', size: 10, divisions: 10, color1: 0x444444, color2: 0x222222 }
        ]
    };
    
    /**
     * Inicializálja a Three.js jelenetet
     * @param {string} containerId - A konténer elem ID-ja
     * @param {Object} options - Beállítások
     */
    function init(containerId, options = {}) {
        container = document.getElementById(containerId);
        if (!container) {
            console.error(`Konténer nem található: ${containerId}`);
            return false;
        }
        
        // Adatok kiolvasása az adatattribútumokból vagy az opciókból
        width = container.dataset.width || options.width || container.clientWidth || 800;
        height = container.dataset.height || options.height || container.clientHeight || 600;
        
        // Ha a szélesség %-ban van megadva, számítsuk ki pixelben
        if (typeof width === 'string' && width.indexOf('%') !== -1) {
            const percentWidth = parseFloat(width);
            width = container.parentElement.clientWidth * (percentWidth / 100);
        }
        
        // Ha a magasság %-ban van megadva, számítsuk ki pixelben
        if (typeof height === 'string' && height.indexOf('%') !== -1) {
            const percentHeight = parseFloat(height);
            height = container.parentElement.clientHeight * (percentHeight / 100);
        }
        
        // Opciók egyesítése az alapértelmezettekkel
        const mergedOptions = { ...defaultOptions, ...options };
        
        // Háttér színe
        const backgroundColor = container.dataset.backgroundColor || 
                              options.backgroundColor || 
                              defaultOptions.backgroundColor;
        
        // Renderer létrehozása
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(parseInt(backgroundColor, 16));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);
        
        // Jelenet létrehozása
        scene = new THREE.Scene();
        
        // Kamera létrehozása
        camera = new THREE.PerspectiveCamera(
            60,
            width / height,
            0.1,
            1000
        );
        camera.position.set(
            mergedOptions.cameraPosition.x,
            mergedOptions.cameraPosition.y,
            mergedOptions.cameraPosition.z
        );
        camera.lookAt(
            mergedOptions.cameraLookAt.x,
            mergedOptions.cameraLookAt.y,
            mergedOptions.cameraLookAt.z
        );
        
        // Fények hozzáadása
        if (mergedOptions.lights && mergedOptions.lights.length > 0) {
            mergedOptions.lights.forEach((lightConfig, index) => {
                let light;
                
                switch (lightConfig.type) {
                    case 'ambient':
                        light = new THREE.AmbientLight(lightConfig.color);
                        break;
                        
                    case 'directional':
                        light = new THREE.DirectionalLight(lightConfig.color, lightConfig.intensity);
                        if (lightConfig.position) {
                            light.position.set(
                                lightConfig.position.x,
                                lightConfig.position.y,
                                lightConfig.position.z
                            );
                        }
                        
                        if (lightConfig.castShadow) {
                            light.castShadow = true;
                            light.shadow.mapSize.width = 2048;
                            light.shadow.mapSize.height = 2048;
                            light.shadow.camera.near = 0.5;
                            light.shadow.camera.far = 500;
                            light.shadow.bias = -0.0001;
                        }
                        break;
                        
                    case 'point':
                        light = new THREE.PointLight(lightConfig.color, lightConfig.intensity);
                        if (lightConfig.position) {
                            light.position.set(
                                lightConfig.position.x,
                                lightConfig.position.y,
                                lightConfig.position.z
                            );
                        }
                        
                        if (lightConfig.castShadow) {
                            light.castShadow = true;
                            light.shadow.mapSize.width = 1024;
                            light.shadow.mapSize.height = 1024;
                        }
                        break;
                        
                    case 'spot':
                        light = new THREE.SpotLight(lightConfig.color, lightConfig.intensity);
                        if (lightConfig.position) {
                            light.position.set(
                                lightConfig.position.x,
                                lightConfig.position.y,
                                lightConfig.position.z
                            );
                        }
                        
                        if (lightConfig.target) {
                            light.target.position.set(
                                lightConfig.target.x,
                                lightConfig.target.y,
                                lightConfig.target.z
                            );
                            scene.add(light.target);
                        }
                        
                        if (lightConfig.angle) light.angle = lightConfig.angle;
                        if (lightConfig.penumbra) light.penumbra = lightConfig.penumbra;
                        if (lightConfig.decay) light.decay = lightConfig.decay;
                        
                        if (lightConfig.castShadow) {
                            light.castShadow = true;
                            light.shadow.mapSize.width = 1024;
                            light.shadow.mapSize.height = 1024;
                        }
                        break;
                }
                
                if (light) {
                    scene.add(light);
                    objects[`${lightConfig.type}Light${index}`] = light;
                }
            });
        }
        
        // OrbitControls hozzáadása (ha elérhető és engedélyezve van)
        if (mergedOptions.enableControls && typeof THREE.OrbitControls !== 'undefined') {
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.dampingFactor = 0.05;
            controls.enableDamping = true;
        }
        
        // Alapértelmezett objektumok hozzáadása
        if (mergedOptions.defaultObjects && mergedOptions.defaultObjects.length > 0) {
            mergedOptions.defaultObjects.forEach(objectConfig => {
                switch (objectConfig.type) {
                    case 'grid':
                        const gridHelper = new THREE.GridHelper(
                            objectConfig.size || 10,
                            objectConfig.divisions || 10,
                            objectConfig.color1 || 0x444444,
                            objectConfig.color2 || 0x222222
                        );
                        scene.add(gridHelper);
                        objects['grid'] = gridHelper;
                        break;
                        
                    case 'axes':
                        const axesHelper = new THREE.AxesHelper(objectConfig.size || 5);
                        scene.add(axesHelper);
                        objects['axes'] = axesHelper;
                        break;
                }
            });
        }
        
        // Performance monitor hozzáadása (fejlesztői módban)
        if (mergedOptions.stats && typeof Stats !== 'undefined') {
            stats = new Stats();
            document.body.appendChild(stats.dom);
        }
        
        // Eseménykezelők hozzáadása
        window.addEventListener('resize', onWindowResize);
        
        // Animációs ciklus indítása
        animate();
        
        return {
            renderer,
            scene,
            camera,
            controls
        };
    }
    
    /**
     * Ablak átméretezésének kezelése
     */
    function onWindowResize() {
        if (!container || !camera || !renderer) return;
        
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        
        renderer.setSize(newWidth, newHeight);
    }
    
    /**
     * Animációs ciklus
     */
    function animate() {
        animationFrameId = requestAnimationFrame(animate);
        
        if (controls && controls.update) {
            controls.update();
        }
        
        if (customRenderFunction) {
            customRenderFunction();
        }
        
        renderer.render(scene, camera);
        
        if (stats) {
            stats.update();
        }
    }
    
    /**
     * Jelenet leállítása és felszabadítása
     */
    function dispose() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        
        window.removeEventListener('resize', onWindowResize);
        
        // Objektumok felszabadítása
        for (const key in objects) {
            const obj = objects[key];
            scene.remove(obj);
            
            if (obj.geometry) {
                obj.geometry.dispose();
            }
            
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(m => m.dispose());
                } else {
                    obj.material.dispose();
                }
            }
        }
        
        objects = {};
        
        // Renderer felszabadítása
        if (renderer) {
            renderer.dispose();
            if (container && renderer.domElement) {
                container.removeChild(renderer.domElement);
            }
        }
        
        // Referenciák felszabadítása
        renderer = null;
        scene = null;
        camera = null;
        controls = null;
        stats = null;
        container = null;
        customRenderFunction = null;
    }
    
    /**
     * Objektum létrehozása és hozzáadása a jelenethez
     * @param {string} type - Az objektum típusa
     * @param {Object} params - Az objektum paraméterei
     * @param {string} name - Az objektum neve (opcionális)
     * @returns {THREE.Object3D} - A létrehozott objektum
     */
    function createObject(type, params = {}, name = '') {
        if (!scene) return null;
        
        let object;
        
        // Geometria és anyag létrehozása a típus alapján
        switch (type) {
            case 'cube':
            case 'box':
                const size = params.size || 1;
                const boxGeometry = new THREE.BoxGeometry(size, size, size);
                const boxMaterial = new THREE.MeshPhongMaterial({
                    color: params.color || 0xffffff,
                    wireframe: params.wireframe || false,
                    transparent: params.transparent || false,
                    opacity: params.opacity || 1
                });
                object = new THREE.Mesh(boxGeometry, boxMaterial);
                break;
                
            case 'sphere':
                const sphereGeometry = new THREE.SphereGeometry(
                    params.radius || 0.5, 
                    params.widthSegments || 32, 
                    params.heightSegments || 32
                );
                const sphereMaterial = new THREE.MeshPhongMaterial({
                    color: params.color || 0xffffff,
                    wireframe: params.wireframe || false,
                    transparent: params.transparent || false,
                    opacity: params.opacity || 1
                });
                object = new THREE.Mesh(sphereGeometry, sphereMaterial);
                break;
                
            case 'cylinder':
                const cylinderGeometry = new THREE.CylinderGeometry(
                    params.radiusTop || 0.5,
                    params.radiusBottom || 0.5,
                    params.height || 1,
                    params.radialSegments || 32
                );
                const cylinderMaterial = new THREE.MeshPhongMaterial({
                    color: params.color || 0xffffff,
                    wireframe: params.wireframe || false,
                    transparent: params.transparent || false,
                    opacity: params.opacity || 1
                });
                object = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
                break;
                
            case 'cone':
                const coneGeometry = new THREE.ConeGeometry(
                    params.radius || 0.5,
                    params.height || 1,
                    params.radialSegments || 32
                );
                const coneMaterial = new THREE.MeshPhongMaterial({
                    color: params.color || 0xffffff,
                    wireframe: params.wireframe || false,
                    transparent: params.transparent || false,
                    opacity: params.opacity || 1
                });
                object = new THREE.Mesh(coneGeometry, coneMaterial);
                break;
                
            case 'plane':
                const planeGeometry = new THREE.PlaneGeometry(
                    params.width || 1,
                    params.height || 1
                );
                const planeMaterial = new THREE.MeshPhongMaterial({
                    color: params.color || 0xffffff,
                    wireframe: params.wireframe || false,
                    transparent: params.transparent || false,
                    opacity: params.opacity || 1,
                    side: THREE.DoubleSide
                });
                object = new THREE.Mesh(planeGeometry, planeMaterial);
                break;
                
            default:
                console.error(`Ismeretlen objektumtípus: ${type}`);
                return null;
        }
        
        // Objektum pozíciójának beállítása
        if (params.position) {
            object.position.set(
                params.position.x || 0,
                params.position.y || 0,
                params.position.z || 0
            );
        }
        
        // Objektum forgatásának beállítása
        if (params.rotation) {
            object.rotation.set(
                params.rotation.x || 0,
                params.rotation.y || 0,
                params.rotation.z || 0
            );
        }
        
        // Objektum méretének beállítása
        if (params.scale) {
            const scale = typeof params.scale === 'number' ? params.scale : 1;
            object.scale.set(scale, scale, scale);
        }
        
        // Árnyék beállítása
        if (params.castShadow !== undefined) object.castShadow = params.castShadow;
        if (params.receiveShadow !== undefined) object.receiveShadow = params.receiveShadow;
        
        // Objektum hozzáadása a jelenethez
        scene.add(object);
        
        // Objektum hozzáadása a nyilvántartásba
        const objectName = name || `object_${Object.keys(objects).length}`;
        objects[objectName] = object;
        
        return object;
    }
    
    /**
     * Egyéni renderelési függvény beállítása
     * @param {Function} renderFunction - Egyéni renderelési függvény
     */
    function setCustomRenderFunction(renderFunction) {
        customRenderFunction = renderFunction;
    }
    
    /**
     * Objektum hozzáadása a nyilvántartáshoz
     * @param {string} name - Az objektum neve
     * @param {THREE.Object3D} object - A hozzáadandó objektum
     */
    function addObject(name, object) {
        objects[name] = object;
        return object;
    }
    
    /**
     * Objektum lekérése a nyilvántartásból
     * @param {string} name - Az objektum neve
     * @returns {THREE.Object3D|null} - A kért objektum vagy null, ha nem található
     */
    function getObject(name) {
        return objects[name] || null;
    }
    
    /**
     * Összes regisztrált objektum lekérése
     * @returns {Object} - Az összes objektum
     */
    function getObjects() {
        return objects;
    }
    
    /**
     * Jelenet lekérése
     * @returns {THREE.Scene} - A jelenet
     */
    function getScene() {
        return scene;
    }
    
    /**
     * Kamera lekérése
     * @returns {THREE.Camera} - A kamera
     */
    function getCamera() {
        return camera;
    }
    
    /**
     * Renderer lekérése
     * @returns {THREE.WebGLRenderer} - A renderer
     */
    function getRenderer() {
        return renderer;
    }
    
    /**
     * Controls lekérése
     * @returns {THREE.Controls} - A controls
     */
    function getControls() {
        return controls;
    }
    
    /**
     * Jelenet alaphelyzetbe állítása
     */
    function resetScene() {
        // Objektumok törlése (kivéve kamera, fények, grid, axes)
        for (const key in objects) {
            if (!key.includes('Light') && key !== 'grid' && key !== 'axes') {
                const obj = objects[key];
                scene.remove(obj);
                
                if (obj.geometry) {
                    obj.geometry.dispose();
                }
                
                if (obj.material) {
                    if (Array.isArray(obj.material)) {
                        obj.material.forEach(m => m.dispose());
                    } else {
                        obj.material.dispose();
                    }
                }
                
                delete objects[key];
            }
        }
    }
    
    // Publikus API
    return {
        init,
        dispose,
        createObject,
        addObject,
        getObject,
        getObjects,
        getScene,
        getCamera,
        getRenderer,
        getControls,
        setCustomRenderFunction,
        resetScene
    };
})();