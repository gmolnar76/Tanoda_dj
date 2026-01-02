/**
 * Platóni testek (Platonic Solids) geometriai alakzatok Blockly implementációja
 */

// Globális változók a platóni testekhez
let platonicSolid;
let animationId = null;

/**
 * Inicializálja a Blockly blokk definíciókat a platóni testekhez
 */
function initPlatonicSolidsBlocks() {
    // Platóni test létrehozása blokk
    Blockly.Blocks['create_platonic_solid'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Platóni test létrehozása")
                .appendField(new Blockly.FieldDropdown([
                    ["Tetraéder", "tetrahedron"],
                    ["Kocka (Hexaéder)", "cube"],
                    ["Oktaéder", "octahedron"],
                    ["Dodekaéder", "dodecahedron"],
                    ["Ikozaéder", "icosahedron"]
                ]), "TYPE");
            this.appendValueInput('SIZE')
                .setCheck('Number')
                .appendField("méret");
            this.appendDummyInput()
                .appendField("szín")
                .appendField(new Blockly.FieldColour('#4ecca3'), 'COLOR');
            this.appendDummyInput()
                .appendField("wireframe")
                .appendField(new Blockly.FieldCheckbox("FALSE"), "WIREFRAME");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(230);
            this.setTooltip("Létrehoz egy kiválasztott platóni testet");
        }
    };

    // JavaScript generátor a platóni test blokkhoz
    Blockly.JavaScript['create_platonic_solid'] = function(block) {
        const type = block.getFieldValue('TYPE');
        const size = Blockly.JavaScript.valueToCode(block, 'SIZE', Blockly.JavaScript.ORDER_ATOMIC) || '1';
        const color = block.getFieldValue('COLOR');
        const wireframe = block.getFieldValue('WIREFRAME') === 'TRUE';
        return `createPlatonicSolid('${type}', ${size}, '${color}', ${wireframe});\n`;
    };

    // Platóni test forgatás blokk
    Blockly.Blocks['rotate_platonic_solid'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Platóni test forgatása");
            this.appendValueInput('X')
                .setCheck('Number')
                .appendField("X");
            this.appendValueInput('Y')
                .setCheck('Number')
                .appendField("Y");
            this.appendValueInput('Z')
                .setCheck('Number')
                .appendField("Z");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(230);
            this.setTooltip("Elforgatja a platóni testet a megadott értékekkel");
            this.setInputsInline(true);
        }
    };

    // JavaScript generátor a forgatás blokkhoz
    Blockly.JavaScript['rotate_platonic_solid'] = function(block) {
        const x = Blockly.JavaScript.valueToCode(block, 'X', Blockly.JavaScript.ORDER_ATOMIC) || '0';
        const y = Blockly.JavaScript.valueToCode(block, 'Y', Blockly.JavaScript.ORDER_ATOMIC) || '0';
        const z = Blockly.JavaScript.valueToCode(block, 'Z', Blockly.JavaScript.ORDER_ATOMIC) || '0';
        return `rotatePlatonicSolid(${x}, ${y}, ${z});\n`;
    };

    // Platóni test automatikus forgatás blokk
    Blockly.Blocks['auto_rotate_platonic_solid'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Platóni test automatikus forgatása");
            this.appendValueInput('SPEED')
                .setCheck('Number')
                .appendField("sebesség");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(230);
            this.setTooltip("A platóni test automatikus forgatása a megadott sebességgel");
        }
    };

    // JavaScript generátor az automatikus forgatás blokkhoz
    Blockly.JavaScript['auto_rotate_platonic_solid'] = function(block) {
        const speed = Blockly.JavaScript.valueToCode(block, 'SPEED', Blockly.JavaScript.ORDER_ATOMIC) || '0.01';
        return `autoRotatePlatonicSolid(${speed});\n`;
    };
    
    // Platóni test tulajdonságok blokk
    Blockly.Blocks['show_platonic_properties'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Platóni test tulajdonságok mutatása");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(230);
            this.setTooltip("Megjeleníti a kiválasztott platóni test tulajdonságait");
        }
    };

    // JavaScript generátor a tulajdonságok blokkhoz
    Blockly.JavaScript['show_platonic_properties'] = function(block) {
        return `showPlatonicProperties();\n`;
    };
}

/**
 * Példa blokkok inicializálása a platóni testekhez
 */
function initPlatonicSolidsExampleBlocks() {
    // Összes platóni test animált bemutatása
    Blockly.Blocks['example_all_platonic_solids'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Példa: Összes Platóni test bemutatása");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(180);
            this.setTooltip("Bemutatja az összes platóni testet animált módon");
        }
    };

    // JavaScript generátor a példa blokkhoz
    Blockly.JavaScript['example_all_platonic_solids'] = function(block) {
        return `
// Platóni testek animált bemutatása
const platonicTypes = ['tetrahedron', 'cube', 'octahedron', 'dodecahedron', 'icosahedron'];
const colors = ['#FF5252', '#4CAF50', '#448AFF', '#FFC107', '#9C27B0'];
let currentIndex = 0;
let rotationSpeed = 0.01;

// A testek ciklikus bemutatása
function showNextPlatonic() {
    createPlatonicSolid(
        platonicTypes[currentIndex], 
        1, 
        colors[currentIndex], 
        false
    );
    showPlatonicProperties();
    autoRotatePlatonicSolid(rotationSpeed);
    
    // Következő test 4 mp múlva
    setTimeout(() => {
        currentIndex = (currentIndex + 1) % platonicTypes.length;
        showNextPlatonic();
    }, 4000);
}

showNextPlatonic();
`;
    };

    // Dodekaéder példa animáció
    Blockly.Blocks['example_dodecahedron_animation'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Példa: Animált Dodekaéder");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(180);
            this.setTooltip("Létrehoz és animál egy dodekaédert különleges effektekkel");
        }
    };

    // JavaScript generátor a dodekaéder példához
    Blockly.JavaScript['example_dodecahedron_animation'] = function(block) {
        return `
// Dodekaéder létrehozása
createPlatonicSolid('dodecahedron', 1, '#FFC107', false);
showPlatonicProperties();

// Különleges animáció
let time = 0;
let wireframeMode = false;
let lastWireframeToggle = 0;
const animateDodecahedron = () => {
    time += 0.01;
    
    // Komplex forgatás
    if (platonicSolid) {
        platonicSolid.rotation.x = Math.sin(time * 0.7) * 0.5;
        platonicSolid.rotation.y = time * 0.5;
        platonicSolid.rotation.z = Math.cos(time * 0.3) * 0.2;
        
        // Pulzálás
        const scale = 0.8 + Math.sin(time * 2) * 0.2;
        platonicSolid.scale.set(scale, scale, scale);
        
        // Időnkénti wireframe váltás
        if (time - lastWireframeToggle > 2.0) {
            wireframeMode = !wireframeMode;
            platonicSolid.material.wireframe = wireframeMode;
            lastWireframeToggle = time;
        }
    }
    
    animationId = requestAnimationFrame(animateDodecahedron);
};

animateDodecahedron();
`;
    };
}

/**
 * Létrehozza a kiválasztott platóni testet
 * @param {string} type - A platóni test típusa (tetrahedron, cube, octahedron, dodecahedron, icosahedron)
 * @param {number} size - A test mérete
 * @param {string} color - A test színe hexadecimális formátumban
 * @param {boolean} wireframe - Wireframe mód bekapcsolása
 */
function createPlatonicSolid(type, size, color, wireframe) {
    // Ha van korábbi animáció, leállítjuk
    if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    
    // Ha már van platóni test, eltávolítjuk
    if (platonicSolid) {
        scene.remove(platonicSolid);
    }
    
    let geometry;
    
    // A megfelelő geometria létrehozása
    switch (type) {
        case 'tetrahedron':
            geometry = new THREE.TetrahedronGeometry(size, 0);
            break;
        case 'cube':
            geometry = new THREE.BoxGeometry(size, size, size);
            break;
        case 'octahedron':
            geometry = new THREE.OctahedronGeometry(size, 0);
            break;
        case 'dodecahedron':
            geometry = new THREE.DodecahedronGeometry(size, 0);
            break;
        case 'icosahedron':
            geometry = new THREE.IcosahedronGeometry(size, 0);
            break;
        default:
            geometry = new THREE.BoxGeometry(size, size, size);
            break;
    }
    
    // Megfelelő anyag létrehozása
    const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        wireframe: wireframe,
        metalness: 0.3,
        roughness: 0.4
    });
    
    // A platóni test létrehozása
    platonicSolid = new THREE.Mesh(geometry, material);
    
    // Ha wireframe nincs bekapcsolva, de szeretnék látni az éleket
    if (!wireframe) {
        const edgesGeometry = new THREE.EdgesGeometry(geometry);
        const edgesMaterial = new THREE.LineBasicMaterial({ 
            color: 0x000000, 
            transparent: true, 
            opacity: 0.3, 
            linewidth: 1 
        });
        const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
        platonicSolid.add(edges);
    }
    
    // Színpadra helyezzük
    scene.add(platonicSolid);
    
    // A kamera beállítása, hogy jól látható legyen
    camera.position.set(0, 0, 3);
    camera.lookAt(0, 0, 0);
    
    logAction(`${getHungarianName(type)} platóni test létrehozva ${size} mérettel`);
}

/**
 * Visszaadja a platóni test magyar nevét a típus alapján
 * @param {string} type - A platóni test típusa
 * @returns {string} - A platóni test magyar neve
 */
function getHungarianName(type) {
    switch(type) {
        case 'tetrahedron': return 'Tetraéder';
        case 'cube': return 'Kocka (Hexaéder)';
        case 'octahedron': return 'Oktaéder';
        case 'dodecahedron': return 'Dodekaéder';
        case 'icosahedron': return 'Ikozaéder';
        default: return type;
    }
}

/**
 * A platóni test forgatása
 * @param {number} x - X tengely körüli forgatás értéke (radiánban)
 * @param {number} y - Y tengely körüli forgatás értéke (radiánban)
 * @param {number} z - Z tengely körüli forgatás értéke (radiánban)
 */
function rotatePlatonicSolid(x, y, z) {
    if (!platonicSolid) {
        logAction("Nincs aktív platóni test a forgatáshoz!");
        return Promise.resolve();
    }
    
    platonicSolid.rotation.x += THREE.MathUtils.degToRad(parseFloat(x));
    platonicSolid.rotation.y += THREE.MathUtils.degToRad(parseFloat(y));
    platonicSolid.rotation.z += THREE.MathUtils.degToRad(parseFloat(z));
    
    logAction(`Platóni test forgatása: X=${x}°, Y=${y}°, Z=${z}°`);
    return Promise.resolve();
}

/**
 * A platóni test automatikus forgatása
 * @param {number} speed - A forgatás sebessége
 */
function autoRotatePlatonicSolid(speed) {
    if (!platonicSolid) {
        logAction("Nincs aktív platóni test az automatikus forgatáshoz!");
        return;
    }
    
    // Leállítjuk a korábbi animációt, ha volt
    if (animationId !== null) {
        cancelAnimationFrame(animationId);
    }
    
    const rotationSpeed = parseFloat(speed);
    const animate = () => {
        platonicSolid.rotation.x += rotationSpeed * 0.5;
        platonicSolid.rotation.y += rotationSpeed;
        platonicSolid.rotation.z += rotationSpeed * 0.3;
        animationId = requestAnimationFrame(animate);
    };
    
    animate();
    logAction(`Platóni test automatikus forgatása ${rotationSpeed} sebességgel`);
}

/**
 * A platóni test tulajdonságainak megjelenítése
 */
function showPlatonicProperties() {
    if (!platonicSolid || !platonicSolid.geometry) {
        logAction("Nincs aktív platóni test a tulajdonságok megjelenítéséhez!");
        return;
    }
    
    const geometry = platonicSolid.geometry;
    const type = getSolidType(geometry);
    
    // Létrehozzuk a tulajdonság szöveget
    let properties = {};
    
    switch (type) {
        case 'tetrahedron':
            properties = {
                name: 'Tetraéder',
                faces: 4,
                edges: 6,
                vertices: 4,
                faceType: 'egyenlő oldalú háromszögek',
                verticesPerFace: 3,
                facesPerVertex: 3
            };
            break;
        case 'cube':
            properties = {
                name: 'Kocka (Hexaéder)',
                faces: 6,
                edges: 12,
                vertices: 8,
                faceType: 'négyzetek',
                verticesPerFace: 4,
                facesPerVertex: 3
            };
            break;
        case 'octahedron':
            properties = {
                name: 'Oktaéder',
                faces: 8,
                edges: 12,
                vertices: 6,
                faceType: 'egyenlő oldalú háromszögek',
                verticesPerFace: 3,
                facesPerVertex: 4
            };
            break;
        case 'dodecahedron':
            properties = {
                name: 'Dodekaéder',
                faces: 12,
                edges: 30,
                vertices: 20,
                faceType: 'szabályos ötszögek',
                verticesPerFace: 5,
                facesPerVertex: 3
            };
            break;
        case 'icosahedron':
            properties = {
                name: 'Ikozaéder',
                faces: 20,
                edges: 30,
                vertices: 12,
                faceType: 'egyenlő oldalú háromszögek',
                verticesPerFace: 3,
                facesPerVertex: 5
            };
            break;
    }
    
    // Tulajdonságok megjelenítése a logban
    logAction(`Platóni test: ${properties.name}`);
    logAction(`- Lapok száma: ${properties.faces} (${properties.faceType})`);
    logAction(`- Élek száma: ${properties.edges}`);
    logAction(`- Csúcsok száma: ${properties.vertices}`);
    logAction(`- Lap típusa: ${properties.faceType}`);
    logAction(`- Laponkénti csúcsok: ${properties.verticesPerFace}`);
    logAction(`- Csúcsonkénti lapok: ${properties.facesPerVertex}`);
    logAction(`- Euler-karakterisztika: V - E + F = ${properties.vertices} - ${properties.edges} + ${properties.faces} = 2`);
    
    return properties;
}

/**
 * Meghatározza a platóni test típusát a geometria alapján
 * @param {THREE.BufferGeometry} geometry - A vizsgált geometria
 * @returns {string} - A platóni test típusa
 */
function getSolidType(geometry) {
    if (geometry instanceof THREE.TetrahedronGeometry) return 'tetrahedron';
    if (geometry instanceof THREE.BoxGeometry) return 'cube';
    if (geometry instanceof THREE.OctahedronGeometry) return 'octahedron';
    if (geometry instanceof THREE.DodecahedronGeometry) return 'dodecahedron';
    if (geometry instanceof THREE.IcosahedronGeometry) return 'icosahedron';
    return 'unknown';
}

// Példaprogram betöltése: összes platóni test bemutatása
function loadAllPlatonicSolidsExample() {
    resetScene();
    workspace.clear();
    
    // Példa blokk hozzáadása
    const exampleBlock = workspace.newBlock('example_all_platonic_solids');
    exampleBlock.initSvg();
    exampleBlock.render();
    exampleBlock.moveBy(50, 50);
    
    logAction('Platóni testek bemutatása példaprogram betöltve. Nyomja meg a "Kód futtatása" gombot az animáció indításához.');
}

// Példaprogram betöltése: dodekaéder animáció
function loadDodecahedronExample() {
    resetScene();
    workspace.clear();
    
    // Példa blokk hozzáadása
    const exampleBlock = workspace.newBlock('example_dodecahedron_animation');
    exampleBlock.initSvg();
    exampleBlock.render();
    exampleBlock.moveBy(50, 50);
    
    logAction('Dodekaéder animáció példaprogram betöltve. Nyomja meg a "Kód futtatása" gombot az animáció indításához.');
}