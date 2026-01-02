/**
 * Élet Virága (Flower of Life) geometriai minta Blockly implementációja
 */

// Globális változók a Flower of Life létrehozásához
let flowerGroup;

/**
 * Inicializálja a Blockly blokk definíciókat az Élet Virágához
 */
function initFlowerOfLifeBlocks() {
    // Élet Virága létrehozása blokk
    Blockly.Blocks['create_flower_of_life'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Élet Virága létrehozása");
            this.appendValueInput('RADIUS')
                .setCheck('Number')
                .appendField("sugár");
            this.appendValueInput('CIRCLES')
                .setCheck('Number')
                .appendField("körök száma");
            this.appendDummyInput()
                .appendField("szín")
                .appendField(new Blockly.FieldColour('#4ecca3'), 'COLOR');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(230);
            this.setTooltip("Megrajzolja az Élet Virága (Flower of Life) szakrális geometriai mintát");
        }
    };

    // JavaScript generátor az Élet Virága blokkhoz
    Blockly.JavaScript['create_flower_of_life'] = function(block) {
        const radius = Blockly.JavaScript.valueToCode(block, 'RADIUS', Blockly.JavaScript.ORDER_ATOMIC) || '1';
        const circles = Blockly.JavaScript.valueToCode(block, 'CIRCLES', Blockly.JavaScript.ORDER_ATOMIC) || '7';
        const color = block.getFieldValue('COLOR');
        return `createFlowerOfLife(${radius}, ${circles}, '${color}');\n`;
    };

    // Élet Virága forgatás blokk
    Blockly.Blocks['rotate_flower_of_life'] = {
        init: function() {
            this.appendValueInput('SPEED')
                .setCheck('Number')
                .appendField("Élet Virága forgatása, sebesség");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(230);
            this.setTooltip("Elforgatja az Élet Virága mintát a megadott sebességgel");
        }
    };

    // JavaScript generátor a forgatás blokkhoz
    Blockly.JavaScript['rotate_flower_of_life'] = function(block) {
        const speed = Blockly.JavaScript.valueToCode(block, 'SPEED', Blockly.JavaScript.ORDER_ATOMIC) || '0.01';
        return `rotateFlowerOfLife(${speed});\n`;
    };

    // Élet Virága méretezés blokk
    Blockly.Blocks['scale_flower_of_life'] = {
        init: function() {
            this.appendValueInput('SCALE')
                .setCheck('Number')
                .appendField("Élet Virága méretezése");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(230);
            this.setTooltip("Az Élet Virága mintát átméretezi a megadott értékkel");
        }
    };

    // JavaScript generátor a méretezés blokkhoz
    Blockly.JavaScript['scale_flower_of_life'] = function(block) {
        const scale = Blockly.JavaScript.valueToCode(block, 'SCALE', Blockly.JavaScript.ORDER_ATOMIC) || '1';
        return `scaleFlowerOfLife(${scale});\n`;
    };
}

/**
 * Példa blokk az Élet Virága teljes létrehozásához és animálásához
 */
function initFlowerOfLifeExampleBlock() {
    // Élet Virága teljes példa blokk
    Blockly.Blocks['example_animate_flower_of_life'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Példa: Animált Élet Virága");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(180);
            this.setTooltip("Létrehoz és animál egy Élet Virága mintát");
        }
    };

    // JavaScript generátor a példa blokkhoz
    Blockly.JavaScript['example_animate_flower_of_life'] = function(block) {
        return `
// Élet Virága létrehozása
createFlowerOfLife(1.5, 7, '#4ecca3');

// Animációs ciklus kezdete
let angle = 0;
function animateFlower() {
  angle += 0.005;
  if (flowerGroup) {
    flowerGroup.rotation.z = angle;
    flowerGroup.rotation.y = angle * 0.7;
    
    // Pulzáló méretezés
    const scale = 0.9 + Math.sin(angle * 3) * 0.1;
    flowerGroup.scale.set(scale, scale, scale);
  }
  requestAnimationFrame(animateFlower);
}
animateFlower();
`;
    };
}

/**
 * Létrehozza az Élet Virága geometriai mintát
 * @param {number} radius - A körök sugara
 * @param {number} numCircles - A körök száma (általában 7 vagy 19)
 * @param {string} color - A körök színe hexadecimális formátumban
 */
function createFlowerOfLife(radius, numCircles, color) {
    // Régi alakzat eltávolítása, ha létezik
    if (flowerGroup) {
        scene.remove(flowerGroup);
    }
    
    // Új csoport létrehozása az összes körhöz
    flowerGroup = new THREE.Group();
    
    // A középső kört először hozzuk létre
    const centerCircle = createCircle(0, 0, radius, color);
    flowerGroup.add(centerCircle);
    
    // Az első kör 6 kört tartalmaz a középső köré rendezve
    if (numCircles >= 7) {
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI * 2) / 6;
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            const circle = createCircle(x, y, radius, color);
            flowerGroup.add(circle);
        }
    }
    
    // Ha több kör van, akkor a második réteg is megjelenik
    if (numCircles >= 19) {
        for (let i = 0; i < 12; i++) {
            const angle = (i * Math.PI) / 6 + Math.PI / 12;
            const distance = radius * Math.sqrt(3);
            const x = distance * Math.cos(angle);
            const y = distance * Math.sin(angle);
            const circle = createCircle(x, y, radius, color);
            flowerGroup.add(circle);
        }
    }
    
    // Ha különleges nagy virág szükséges
    if (numCircles > 19) {
        const additionalCircles = numCircles - 19;
        const startAngle = Math.PI / 12;
        const angleDelta = Math.PI / 6;
        const distance = radius * (2 + Math.sqrt(3)) / 2;
        
        for (let i = 0; i < additionalCircles && i < 12; i++) {
            const angle = startAngle + i * angleDelta;
            const x = distance * Math.cos(angle);
            const y = distance * Math.sin(angle);
            const circle = createCircle(x, y, radius, color);
            flowerGroup.add(circle);
        }
    }
    
    // Az alakzatot a színpadra helyezzük
    scene.add(flowerGroup);
    
    // A kamera beállítása, hogy látható legyen az egész alakzat
    const distance = Math.max(3, radius * 4);
    camera.position.set(0, 0, distance);
    camera.lookAt(0, 0, 0);
    
    logAction(`Élet Virága létrehozva: ${numCircles} kör, ${radius} sugárral, ${color} színben`);
}

/**
 * Segédfüggvény egy kör létrehozásához az Élet Virága mintában
 */
function createCircle(x, y, radius, color) {
    const segments = 64;
    const circleGeometry = new THREE.CircleGeometry(radius, segments);
    const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
        wireframe: false
    });
    
    const circle = new THREE.Mesh(circleGeometry, material);
    circle.position.set(x, y, 0);
    
    // Kör körvonalának hozzáadása
    const edgesGeometry = new THREE.EdgesGeometry(circleGeometry);
    const edgesMaterial = new THREE.LineBasicMaterial({
        color: new THREE.Color(color),
        linewidth: 2
    });
    const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    circle.add(edges);
    
    return circle;
}

/**
 * Az Élet Virága alakzat forgatása
 * @param {number} speed - A forgatás sebessége
 */
function rotateFlowerOfLife(speed) {
    if (!flowerGroup) {
        logAction("Nincs aktív Élet Virága alakzat a forgatáshoz!");
        return Promise.resolve();
    }
    
    const rotationSpeed = parseFloat(speed);
    flowerGroup.rotation.z += rotationSpeed;
    
    logAction(`Élet Virága forgatása ${rotationSpeed} sebességgel`);
    return Promise.resolve();
}

/**
 * Az Élet Virága méretezése
 * @param {number} scale - A méretezési faktor
 */
function scaleFlowerOfLife(scale) {
    if (!flowerGroup) {
        logAction("Nincs aktív Élet Virága alakzat a méretezéshez!");
        return Promise.resolve();
    }
    
    const scaleValue = parseFloat(scale);
    flowerGroup.scale.set(scaleValue, scaleValue, scaleValue);
    
    logAction(`Élet Virága méretezése ${scaleValue} faktorra`);
    return Promise.resolve();
}

// Példaprogram betöltése az "Élet Virága" mintához
function loadFlowerOfLifeExample() {
    resetScene();
    workspace.clear();
    
    // Példa blokk hozzáadása
    const exampleBlock = workspace.newBlock('example_animate_flower_of_life');
    exampleBlock.initSvg();
    exampleBlock.render();
    exampleBlock.moveBy(50, 50);
    
    logAction('Élet Virága példaprogram betöltve. Nyomja meg a "Kód futtatása" gombot az animáció indításához.');
}