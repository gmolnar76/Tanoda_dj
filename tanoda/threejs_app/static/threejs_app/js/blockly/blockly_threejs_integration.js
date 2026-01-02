/**
 * Blockly és Three.js integrációs modul
 * 
 * Ez a modul biztosítja a kapcsolatot a Blockly és a Three.js között,
 * lehetővé téve, hogy a Blockly-ban generált kód irányítsa a Three.js objektumokat.
 */

const BlocklyThreeJSBridge = (function() {
    // Magán változók
    let threejsInstance = null;
    let workspace = null;
    let interpreter = null;
    let executionPaused = false;
    let highlightPause = 200;
    let currentHighlight = null;
    
    // Blockly blokk kategóriák és blokkok definíciói Three.js objektumokhoz
    const blockDefinitions = {
        // Kategóriák
        categories: [
            {
                name: 'ThreeJS Objektumok',
                colour: '%{BKY_MATH_HUE}'
            },
            {
                name: 'ThreeJS Műveletek',
                colour: '%{BKY_PROCEDURES_HUE}'
            },
            {
                name: 'ThreeJS Animációk',
                colour: '%{BKY_LOOPS_HUE}'
            }
        ],
        
        // Blokkok
        blocks: [
            // === Objektum létrehozó blokkok ===
            {
                type: 'threejs_create_cube',
                message0: 'kocka létrehozása méret: %1 szín: %2',
                args0: [
                    {
                        type: 'input_value',
                        name: 'SIZE',
                        check: 'Number'
                    },
                    {
                        type: 'input_value',
                        name: 'COLOR',
                        check: 'Colour'
                    }
                ],
                output: 'ThreeJSObject',
                colour: '%{BKY_MATH_HUE}',
                tooltip: 'Létrehoz egy kockát a megadott mérettel és színnel',
                helpUrl: ''
            },
            {
                type: 'threejs_create_sphere',
                message0: 'gömb létrehozása sugár: %1 szín: %2',
                args0: [
                    {
                        type: 'input_value',
                        name: 'RADIUS',
                        check: 'Number'
                    },
                    {
                        type: 'input_value',
                        name: 'COLOR',
                        check: 'Colour'
                    }
                ],
                output: 'ThreeJSObject',
                colour: '%{BKY_MATH_HUE}',
                tooltip: 'Létrehoz egy gömböt a megadott sugárral és színnel',
                helpUrl: ''
            },
            {
                type: 'threejs_create_cylinder',
                message0: 'henger létrehozása sugár: %1 magasság: %2 szín: %3',
                args0: [
                    {
                        type: 'input_value',
                        name: 'RADIUS',
                        check: 'Number'
                    },
                    {
                        type: 'input_value',
                        name: 'HEIGHT',
                        check: 'Number'
                    },
                    {
                        type: 'input_value',
                        name: 'COLOR',
                        check: 'Colour'
                    }
                ],
                output: 'ThreeJSObject',
                colour: '%{BKY_MATH_HUE}',
                tooltip: 'Létrehoz egy hengert a megadott sugárral, magassággal és színnel',
                helpUrl: ''
            },
            
            // === Pozícionáló blokkok ===
            {
                type: 'threejs_set_position',
                message0: '%1 pozíció beállítása x: %2 y: %3 z: %4',
                args0: [
                    {
                        type: 'input_value',
                        name: 'OBJECT',
                        check: 'ThreeJSObject'
                    },
                    {
                        type: 'input_value',
                        name: 'X',
                        check: 'Number'
                    },
                    {
                        type: 'input_value',
                        name: 'Y',
                        check: 'Number'
                    },
                    {
                        type: 'input_value',
                        name: 'Z',
                        check: 'Number'
                    }
                ],
                previousStatement: null,
                nextStatement: null,
                colour: '%{BKY_PROCEDURES_HUE}',
                tooltip: 'Beállítja az objektum pozícióját',
                helpUrl: ''
            },
            {
                type: 'threejs_set_rotation',
                message0: '%1 forgatás beállítása x: %2 y: %3 z: %4',
                args0: [
                    {
                        type: 'input_value',
                        name: 'OBJECT',
                        check: 'ThreeJSObject'
                    },
                    {
                        type: 'input_value',
                        name: 'X',
                        check: 'Number'
                    },
                    {
                        type: 'input_value',
                        name: 'Y',
                        check: 'Number'
                    },
                    {
                        type: 'input_value',
                        name: 'Z',
                        check: 'Number'
                    }
                ],
                previousStatement: null,
                nextStatement: null,
                colour: '%{BKY_PROCEDURES_HUE}',
                tooltip: 'Beállítja az objektum forgatását',
                helpUrl: ''
            },
            {
                type: 'threejs_set_scale',
                message0: '%1 méret beállítása %2',
                args0: [
                    {
                        type: 'input_value',
                        name: 'OBJECT',
                        check: 'ThreeJSObject'
                    },
                    {
                        type: 'input_value',
                        name: 'SCALE',
                        check: 'Number'
                    }
                ],
                previousStatement: null,
                nextStatement: null,
                colour: '%{BKY_PROCEDURES_HUE}',
                tooltip: 'Beállítja az objektum méretét',
                helpUrl: ''
            },
            
            // === Animációs blokkok ===
            {
                type: 'threejs_animate',
                message0: '%1 animálása %2',
                args0: [
                    {
                        type: 'input_value',
                        name: 'OBJECT',
                        check: 'ThreeJSObject'
                    },
                    {
                        type: 'input_statement',
                        name: 'ANIMATE'
                    }
                ],
                previousStatement: null,
                nextStatement: null,
                colour: '%{BKY_LOOPS_HUE}',
                tooltip: 'Animál egy objektumot a megadott műveletekkel',
                helpUrl: ''
            },
            {
                type: 'threejs_rotate_by',
                message0: 'forgatás x: %1 y: %2 z: %3',
                args0: [
                    {
                        type: 'input_value',
                        name: 'X',
                        check: 'Number'
                    },
                    {
                        type: 'input_value',
                        name: 'Y',
                        check: 'Number'
                    },
                    {
                        type: 'input_value',
                        name: 'Z',
                        check: 'Number'
                    }
                ],
                previousStatement: null,
                nextStatement: null,
                colour: '%{BKY_LOOPS_HUE}',
                tooltip: 'Forgatja az objektumot a megadott értékekkel',
                helpUrl: ''
            }
        ]
    };
    
    /**
     * Inicializálja a Blockly-Three.js hidat
     * @param {Object} threejs - Three.js példány
     * @param {Blockly.Workspace} blocklyWorkspace - Blockly workspace példány
     */
    function init(threejs, blocklyWorkspace) {
        threejsInstance = threejs;
        workspace = blocklyWorkspace;
        
        // Blockly blokk definíciók regisztrálása
        registerBlockDefinitions();
        
        // Toolbox létrehozása
        createToolbox();
        
        // JavaScript kódgenerátor kiterjesztése
        extendJavaScriptGenerator();
    }
    
    /**
     * Blockly blokk definíciók regisztrálása
     */
    function registerBlockDefinitions() {
        if (!Blockly || !Blockly.Blocks) {
            console.error('Blockly nem érhető el!');
            return;
        }
        
        // Blokkok regisztrálása
        blockDefinitions.blocks.forEach(block => {
            Blockly.Blocks[block.type] = {
                init: function() {
                    this.jsonInit(block);
                }
            };
        });
    }
    
    /**
     * Blockly eszköztár létrehozása
     */
    function createToolbox() {
        if (!workspace) return;
        
        // Kategóriák létrehozása
        const toolboxXml = document.createElement('xml');
        toolboxXml.setAttribute('id', 'toolbox');
        
        // ThreeJS kategória
        const threejsCategory = document.createElement('category');
        threejsCategory.setAttribute('name', 'ThreeJS');
        threejsCategory.setAttribute('colour', '%{BKY_MATH_HUE}');
        
        // Objektum kategória
        const objectsCategory = document.createElement('category');
        objectsCategory.setAttribute('name', 'Objektumok');
        objectsCategory.setAttribute('colour', '%{BKY_MATH_HUE}');
        
        // Blokkok hozzáadása a megfelelő kategóriákhoz
        blockDefinitions.blocks.forEach(block => {
            if (block.type.startsWith('threejs_create')) {
                const blockElement = document.createElement('block');
                blockElement.setAttribute('type', block.type);
                objectsCategory.appendChild(blockElement);
            }
        });
        
        // Műveletek kategória
        const operationsCategory = document.createElement('category');
        operationsCategory.setAttribute('name', 'Műveletek');
        operationsCategory.setAttribute('colour', '%{BKY_PROCEDURES_HUE}');
        
        blockDefinitions.blocks.forEach(block => {
            if (block.type.startsWith('threejs_set')) {
                const blockElement = document.createElement('block');
                blockElement.setAttribute('type', block.type);
                operationsCategory.appendChild(blockElement);
            }
        });
        
        // Animációk kategória
        const animationsCategory = document.createElement('category');
        animationsCategory.setAttribute('name', 'Animációk');
        animationsCategory.setAttribute('colour', '%{BKY_LOOPS_HUE}');
        
        blockDefinitions.blocks.forEach(block => {
            if (block.type.startsWith('threejs_animate') || block.type.startsWith('threejs_rotate')) {
                const blockElement = document.createElement('block');
                blockElement.setAttribute('type', block.type);
                animationsCategory.appendChild(blockElement);
            }
        });
        
        // Kategóriák hozzáadása a ThreeJS kategóriához
        threejsCategory.appendChild(objectsCategory);
        threejsCategory.appendChild(operationsCategory);
        threejsCategory.appendChild(animationsCategory);
        
        // ThreeJS kategória hozzáadása a toolbox-hoz
        toolboxXml.appendChild(threejsCategory);
        
        // A következő lépés a toolbox beállítása a workspace-ben
        // Ez azonban nem mindig lehetséges közvetlenül, mivel a workspace már inicializálva lehet
        // Ehelyett egy eseményt dobunk, amit az alkalmazás kezelhet
        const event = new CustomEvent('blocklyThreejsToolboxCreated', {
            detail: { toolboxXml: toolboxXml.outerHTML }
        });
        document.dispatchEvent(event);
    }
    
    /**
     * JavaScript kódgenerátor kiterjesztése Three.js blokkokhoz
     */
    function extendJavaScriptGenerator() {
        if (!Blockly || !Blockly.JavaScript) {
            console.error('Blockly JavaScript generátor nem érhető el!');
            return;
        }
        
        // Kocka létrehozása
        Blockly.JavaScript['threejs_create_cube'] = function(block) {
            const size = Blockly.JavaScript.valueToCode(block, 'SIZE', Blockly.JavaScript.ORDER_ATOMIC) || '1';
            const color = Blockly.JavaScript.valueToCode(block, 'COLOR', Blockly.JavaScript.ORDER_ATOMIC) || '0xffffff';
            
            const code = `ThreeJSInitializer.createObject('cube', { size: ${size}, color: ${color} })`;
            return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
        };
        
        // Gömb létrehozása
        Blockly.JavaScript['threejs_create_sphere'] = function(block) {
            const radius = Blockly.JavaScript.valueToCode(block, 'RADIUS', Blockly.JavaScript.ORDER_ATOMIC) || '0.5';
            const color = Blockly.JavaScript.valueToCode(block, 'COLOR', Blockly.JavaScript.ORDER_ATOMIC) || '0xffffff';
            
            const code = `ThreeJSInitializer.createObject('sphere', { radius: ${radius}, color: ${color} })`;
            return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
        };
        
        // Henger létrehozása
        Blockly.JavaScript['threejs_create_cylinder'] = function(block) {
            const radius = Blockly.JavaScript.valueToCode(block, 'RADIUS', Blockly.JavaScript.ORDER_ATOMIC) || '0.5';
            const height = Blockly.JavaScript.valueToCode(block, 'HEIGHT', Blockly.JavaScript.ORDER_ATOMIC) || '1';
            const color = Blockly.JavaScript.valueToCode(block, 'COLOR', Blockly.JavaScript.ORDER_ATOMIC) || '0xffffff';
            
            const code = `ThreeJSInitializer.createObject('cylinder', { radiusTop: ${radius}, radiusBottom: ${radius}, height: ${height}, color: ${color} })`;
            return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
        };
        
        // Pozíció beállítása
        Blockly.JavaScript['threejs_set_position'] = function(block) {
            const object = Blockly.JavaScript.valueToCode(block, 'OBJECT', Blockly.JavaScript.ORDER_ATOMIC);
            const x = Blockly.JavaScript.valueToCode(block, 'X', Blockly.JavaScript.ORDER_ATOMIC) || '0';
            const y = Blockly.JavaScript.valueToCode(block, 'Y', Blockly.JavaScript.ORDER_ATOMIC) || '0';
            const z = Blockly.JavaScript.valueToCode(block, 'Z', Blockly.JavaScript.ORDER_ATOMIC) || '0';
            
            return `if (${object}) { ${object}.position.set(${x}, ${y}, ${z}); }\n`;
        };
        
        // Forgatás beállítása
        Blockly.JavaScript['threejs_set_rotation'] = function(block) {
            const object = Blockly.JavaScript.valueToCode(block, 'OBJECT', Blockly.JavaScript.ORDER_ATOMIC);
            const x = Blockly.JavaScript.valueToCode(block, 'X', Blockly.JavaScript.ORDER_ATOMIC) || '0';
            const y = Blockly.JavaScript.valueToCode(block, 'Y', Blockly.JavaScript.ORDER_ATOMIC) || '0';
            const z = Blockly.JavaScript.valueToCode(block, 'Z', Blockly.JavaScript.ORDER_ATOMIC) || '0';
            
            return `if (${object}) { ${object}.rotation.set(${x}, ${y}, ${z}); }\n`;
        };
        
        // Méret beállítása
        Blockly.JavaScript['threejs_set_scale'] = function(block) {
            const object = Blockly.JavaScript.valueToCode(block, 'OBJECT', Blockly.JavaScript.ORDER_ATOMIC);
            const scale = Blockly.JavaScript.valueToCode(block, 'SCALE', Blockly.JavaScript.ORDER_ATOMIC) || '1';
            
            return `if (${object}) { ${object}.scale.set(${scale}, ${scale}, ${scale}); }\n`;
        };
        
        // Animáció
        Blockly.JavaScript['threejs_animate'] = function(block) {
            const object = Blockly.JavaScript.valueToCode(block, 'OBJECT', Blockly.JavaScript.ORDER_ATOMIC);
            const animate = Blockly.JavaScript.statementToCode(block, 'ANIMATE');
            
            const functionName = 'animate_' + Math.floor(Math.random() * 10000);
            
            return `
// Animáció definiálása az objektumhoz
function ${functionName}() {
    if (${object}) {
        ${animate}
    }
    requestAnimationFrame(${functionName});
}
// Animáció indítása
${functionName}();\n`;
        };
        
        // Forgatás
        Blockly.JavaScript['threejs_rotate_by'] = function(block) {
            const x = Blockly.JavaScript.valueToCode(block, 'X', Blockly.JavaScript.ORDER_ATOMIC) || '0';
            const y = Blockly.JavaScript.valueToCode(block, 'Y', Blockly.JavaScript.ORDER_ATOMIC) || '0';
            const z = Blockly.JavaScript.valueToCode(block, 'Z', Blockly.JavaScript.ORDER_ATOMIC) || '0';
            
            return `
// Forgatás
this.rotation.x += ${x};
this.rotation.y += ${y};
this.rotation.z += ${z};\n`;
        };
    }
    
    /**
     * Generál JavaScript kódot a Blockly workspace-ből
     * @returns {string} - Generált JavaScript kód
     */
    function generateCode() {
        if (!workspace || !Blockly || !Blockly.JavaScript) {
            console.error('Blockly workspace vagy JavaScript generátor nem érhető el!');
            return '';
        }
        
        return Blockly.JavaScript.workspaceToCode(workspace);
    }
    
    /**
     * Végrehajtja a generált kódot
     */
    function runCode() {
        if (!threejsInstance) {
            console.error('Three.js inicializáló nem érhető el!');
            return;
        }
        
        // Először alaphelyzetbe állítjuk a jelenetet
        threejsInstance.resetScene();
        
        // Generáljuk a kódot
        const code = generateCode();
        
        // Kód végrehajtása
        try {
            // A ThreeJSInitializer hivatkozást átadjuk a kód végrehajtási környezetének
            // A kódot egy függvénybe csomagoljuk, hogy lokális változókkal dolgozhasson
            const runFunction = new Function('ThreeJSInitializer', code);
            runFunction(threejsInstance);
        } catch (e) {
            console.error('Hiba a kód végrehajtása közben:', e);
            // Itt lehet megjeleníteni a hibát a felhasználónak
            const event = new CustomEvent('blocklyThreejsExecutionError', {
                detail: { error: e.toString() }
            });
            document.dispatchEvent(event);
        }
    }
    
    /**
     * Inkrementális kód végrehajtás blokkonként (fejlesztői módban)
     */
    function startStepByStepExecution() {
        if (!workspace || !Blockly || !Blockly.JavaScript) {
            console.error('Blockly workspace vagy JavaScript generátor nem érhető el!');
            return;
        }
        
        // Először alaphelyzetbe állítjuk a jelenetet
        threejsInstance.resetScene();
        
        // Generáljuk a kódot
        const code = generateCode();
        
        // Létrehozzuk a JavaScript interpretert
        initInterpreter(code);
        
        // Elindítjuk a lépésenkénti végrehajtást
        executionPaused = false;
        executeNextStep();
    }
    
    /**
     * Inicializálja a JavaScript interpretert
     * @param {string} code - Végrehajtandó kód
     */
    function initInterpreter(code) {
        // Ebben a példában nem használunk valós JavaScript interpretert,
        // de egy komplex alkalmazásban használhatunk egyet (pl. JS-Interpreter)
        interpreter = {
            code: code,
            currentStep: 0,
            steps: code.split('\n')
        };
    }
    
    /**
     * Végrehajtja a következő kódlépést
     */
    function executeNextStep() {
        if (!interpreter || executionPaused) return;
        
        // Ha van még végrehajtandó lépés
        if (interpreter.currentStep < interpreter.steps.length) {
            const step = interpreter.steps[interpreter.currentStep];
            interpreter.currentStep++;
            
            // Végrehajtjuk a kódlépést
            try {
                // Itt egyszerűen csak kiírjuk a konzolra a lépést
                console.log(`Executing step ${interpreter.currentStep}:`, step);
                
                // Egy valódi megvalósításban itt lenne a kód tényleges végrehajtása
                // és a megfelelő Blockly blokkok kiemelése
                
                // Rövid szünet után végrehajtjuk a következő lépést
                setTimeout(executeNextStep, highlightPause);
            } catch (e) {
                console.error('Hiba a kódlépés végrehajtása közben:', e);
                executionPaused = true;
            }
        } else {
            // Végrehajtás befejezve
            console.log('Execution finished');
            interpreter = null;
        }
    }
    
    /**
     * Szünetelteti a kód végrehajtását
     */
    function pauseExecution() {
        executionPaused = true;
    }
    
    /**
     * Folytatja a kód végrehajtását
     */
    function resumeExecution() {
        executionPaused = false;
        executeNextStep();
    }
    
    /**
     * Leállítja a kód végrehajtását és visszaállítja a jelenetet
     */
    function stopExecution() {
        executionPaused = true;
        interpreter = null;
        threejsInstance.resetScene();
    }
    
    // Publikus API
    return {
        init,
        generateCode,
        runCode,
        startStepByStepExecution,
        pauseExecution,
        resumeExecution,
        stopExecution
    };
})();