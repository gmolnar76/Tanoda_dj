// ui-handler.js módosítása
class UIHandler {
    constructor() {
        this.elements = {
            multiplicandElement: null,
            multiplierElement: null,
            answerInput: null,
            checkButton: null,
            resultDiv: null,
            matrix: null
        };
        this.isInitialized = false;
    }

    async init() {
        // Várjunk egy kis időt, hogy biztosan betöltődjenek az elemek
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!this.initElements()) {
            console.error('DOM elemek inicializálása sikertelen');
            console.log('Elérhető elemek:', {
                multiplicand: document.getElementById('szorzo'),
                multiplier: document.getElementById('szorzando'),
                answer: document.getElementById('valasz'),
                check: document.getElementById('ellenorzes'),
                result: document.getElementById('eredmeny'),
                matrix: document.getElementById('pythagoras-matrix')
            });
            return false;
        }
        
        this.initEventListeners();
        this.isInitialized = true;
        return true;
    }

    initElements() {
        const elementIds = {
            multiplicandElement: 'szorzo',
            multiplierElement: 'szorzando',
            answerInput: 'valasz',
            checkButton: 'ellenorzes',
            resultDiv: 'eredmeny',
            matrix: 'pythagoras-matrix'
        };

        let allFound = true;
        for (const [key, id] of Object.entries(elementIds)) {
            this.elements[key] = document.getElementById(id);
            if (!this.elements[key]) {
                console.error(`Nem található: ${id}`);
                allFound = false;
            }
        }
        
        return allFound;
    }
}

export const uiHandler = new UIHandler();