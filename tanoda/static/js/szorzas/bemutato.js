// Konstansok
const GRID_SIZE = 15;
const BASE_ROW = 1;
const CENTER_OFFSET = 7;

// Globális változók
let grid;

// Grid inicializálása
function initializeGrid() {
    grid = document.getElementById('multiplication-grid');
    if (!grid) {
        console.error('Multiplication grid nem található!');
        return false;
    }
    return true;
}

// Grid létrehozása
function createMultiplicationGrid() {
    if (!initializeGrid()) return;
    
    grid.innerHTML = '';  // Grid tisztítása
    
    // Random számok generálása (3 jegyű)
    const num1 = generateRandomNumber(100, 999);
    const num2 = generateRandomNumber(100, 999);
    
    // Grid adatok mentése
    grid.dataset.num1 = num1;
    grid.dataset.num2 = num2;
    
    // Grid cellák létrehozása
    createGridCells();
    
    return true;
}

// Random szám generálása ----------------------------------------------1 és nullák csökkentése
function generateRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Grid cellák létrehozása
function createGridCells() {
    if (!grid) return;

    for(let row = 0; row < GRID_SIZE; row++) {
        for(let col = 0; col < GRID_SIZE; col++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.id = `cell-${row}-${col}`;
            grid.appendChild(cell);
        }
    }
}


function handleFinalInput(event) {
    const input = event.target;
    const value = input.value.trim();
    
    // Csak számjegyek engedélyezése
    if (!/^\d?$/.test(value)) {
        input.value = '';
        return;
    }

    const cell = input.closest('.grid-cell');
    if (!cell) return;

    // Pozíció meghatározása
    const position = parseInt(input.dataset.col);
    const expectedResult = calculateFinalResult();
    const expectedDigit = getDigitAtPosition(expectedResult, position);

    // Eredmény ellenőrzése
    if (value !== '') {
        if (parseInt(value) === expectedDigit) {
            markCellAsCorrect(cell);
            if (position > 0) { // Ha nem az utolsó számjegy
                moveToNextFinalInput(input);
            } else {
                checkIfComplete();
            }
        } else {
            markCellAsIncorrect(cell);
        }
    }
}


function markCellAsCorrect(cell) {
    cell.classList.add('correct');
    cell.classList.remove('incorrect');
    playCorrectSound(); // Opcionális hangeffekt
}

function markCellAsIncorrect(cell) {
    cell.classList.add('incorrect');
    cell.classList.remove('correct');
    cell.classList.add('shake');
    setTimeout(() => cell.classList.remove('shake'), 500);
}

function checkIfComplete() {
    const allInputs = document.querySelectorAll('.final-result input');
    const isComplete = Array.from(allInputs).every(input => 
        input.closest('.grid-cell').classList.contains('correct')
    );
    
    if (isComplete) {
        showCompletionMessage();
        disableAllInputs();
    }
}



// Billentyűzet események kezelése a végeredménynél
function handleFinalKeydown(event) {
    const input = event.target;
    
    switch(event.key) {
        case 'ArrowLeft':
            event.preventDefault();
            moveFinalInput(input, -1);
            break;
        case 'ArrowRight':
            event.preventDefault();
            moveFinalInput(input, 1);
            break;
        case 'Backspace':
            if (!input.value) {
                event.preventDefault();
                moveFinalInput(input, -1);
            }
            break;
    }
}



// Fókusz kezelése a végeredménynél
function handleFinalFocus(event) {
    const cell = event.target.closest('.grid-cell');
    if (cell) {
        cell.classList.add('active-cell');
    }
}

// Fókusz elvesztésének kezelése
function handleFinalBlur(event) {
    const cell = event.target.closest('.grid-cell');
    if (cell) {
        cell.classList.remove('active-cell');
    }
}

// Segédfüggvények a végeredmény kezeléséhez
function calculateFinalResult() {
    const num1 = parseInt(grid.dataset.num1);
    const num2 = parseInt(grid.dataset.num2);
    return num1 * num2;
}

function getDigitAtPosition(number, position) {
    return Math.floor(number / Math.pow(10, position)) % 10;
}

function moveToNextFinalInput(currentInput) {
    const currentPosition = parseInt(currentInput.dataset.col);
    const nextInput = document.querySelector(`.result-value[data-col="${currentPosition - 1}"]`);
    if (nextInput) {
        nextInput.focus();
    }
}

function moveFinalInput(currentInput, direction) {
    const currentPosition = parseInt(currentInput.dataset.col);
    const nextInput = document.querySelector(`.result-value[data-col="${currentPosition + direction}"]`);
    if (nextInput) {
        nextInput.focus();
    }
}


// Grid tisztítása
function clearGrid() {
    if (!grid) return;
    const cells = grid.querySelectorAll('.grid-cell');
    cells.forEach(cell => {
        cell.className = 'grid-cell';
        cell.textContent = '';
    });
}

// Művelet megjelenítése
function displayOperation(num1, num2) {
    const num1Str = num1.toString();
    const num2Str = num2.toString();
    const startCol = GRID_SIZE - (num1Str.length + num2Str.length + 3);
    
    // Szorzandó megjelenítése
    for(let i = 0; i < num1Str.length; i++) {
        const cell = document.getElementById(`cell-${BASE_ROW}-${startCol + i}`);
        if (cell) {
            cell.textContent = num1Str[i];
            cell.classList.add('operation-number');
        }
    }
    
    // Szorzójel
    const multiplicationCell = document.getElementById(`cell-${BASE_ROW}-${startCol + num1Str.length}`);
    if (multiplicationCell) {
        multiplicationCell.textContent = '×';
        multiplicationCell.classList.add('multiplication-sign');
    }
    
    // Szorzó megjelenítése
    for(let i = 0; i < num2Str.length; i++) {
        const col = startCol + num1Str.length + 1 + i;
        const cell = document.getElementById(`cell-${BASE_ROW}-${col}`);
        if (cell) {
            cell.textContent = num2Str[i];
            cell.classList.add('operation-number');
        }
    }
}


// Részeredmények létrehozása
function setupPartialResults() {
    try {
        const grid = document.getElementById('multiplication-grid');
        const num1 = parseInt(grid.dataset.num1);
        const num2 = parseInt(grid.dataset.num2);
        const basePosition = CENTER_OFFSET + Math.floor(num1.toString().length / 2);
        const digits = num2.toString().split('').reverse();
        
        digits.forEach((digit, rowIndex) => {
            createPartialResultRow(num1, parseInt(digit), rowIndex, basePosition);
        });
        
        console.log('Részeredmény sorok létrehozva');
    } catch (error) {
        console.error('Hiba a részeredmények beállításakor:', error);
    }
}

function createPartialResultRow(num1, digit, offset) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'partial-result-row';
    
    // Ellenőrizzük, hogy ez-e az utolsó részeredmény sor
    const num2Length = grid.dataset.num2.toString().length;
    if (offset === num2Length - 1) {
        rowDiv.classList.add('last-partial-result');
    }

    // Offset cellák hozzáadása
    for(let i = 0; i < offset; i++) {
        const spacer = document.createElement('div');
        spacer.className = 'grid-cell empty';
        rowDiv.appendChild(spacer);
    }
    
    // Input mezők létrehozása
    const expectedResult = num1 * digit;
    const resultStr = expectedResult.toString();
    
    for(let i = resultStr.length - 1; i >= 0; i--) {
        const cell = createInputCell({
            rowIndex: offset,
            digitPosition: resultStr.length - 1 - i,
            expectedValue: parseInt(resultStr[i])
        });
        rowDiv.appendChild(cell);
    }
    
    return rowDiv;
}


// Végeredmény sor létrehozása
function createFinalResultRow() {
    // Számoljuk ki a szükséges sorokat a részeredmények alapján
    const num2Length = grid.dataset.num2.toString().length;
    // Egy sorral feljebb visszük: nem kell +2, csak +1 a részeredmények miatt
    const finalRow = BASE_ROW + num2Length + 1; 
    const maxCol = GRID_SIZE - 7; // 6 oszloppal balra tolás
    
    // Végeredmény beviteli mezők létrehozása
    const resultLength = calculateExpectedResultLength();
    for (let i = 0; i < resultLength; i++) {
        const col = maxCol - i;
        const cell = document.getElementById(`cell-${finalRow}-${col}`);
        if (cell) {
            cell.className = 'grid-cell result-input final-result';
            createFinalResultInput(cell, col);
        }
    }
}

// Segédfüggvények
function calculateExpectedResultLength() {
    const num1 = parseInt(grid.dataset.num1);
    const num2 = parseInt(grid.dataset.num2);
    return (num1 * num2).toString().length;
}

function createFinalResultInput(cell, col) {
    const input = document.createElement('input');
    input.type = 'text';
    input.maxLength = '1';
    input.className = 'result-value final';
    input.dataset.row = 'final';
    input.dataset.col = col;
    
    // Event listeners hozzáadása
    input.addEventListener('input', handleFinalInput);
    input.addEventListener('keydown', handleFinalKeydown);
    input.addEventListener('focus', handleFinalFocus);
    input.addEventListener('blur', handleFinalBlur);
    
    cell.innerHTML = '';
    cell.appendChild(input);
}


// Egy részeredmény sor létrehozása
function createPartialResultRow(number, multiplier, rowIndex, basePosition) {
    const row = BASE_ROW + rowIndex + 1; // +1 mert a művelet alatt kezdjük
    const startCol = basePosition - rowIndex; // Minden sor egy pozícióval balrább
    
    // Létrehozzuk a beviteli mezőket
    for(let i = 0; i < number.toString().length + 1; i++) { // +1 a lehetséges átvitel miatt
        const col = startCol - i;
        createInputCell(row, col, {
            rowIndex,
            digitPosition: i,
            multiplier
        });
    }
}


// Beviteli mező létrehozása
function createInputCell(row, col, metadata) {
    const cell = document.getElementById(`cell-${row}-${col}`);
    if(!cell) return;

    cell.className = 'grid-cell result-input';
    cell.innerHTML = `
        <span class="remainder" id="remainder-${row}-${col}"></span>
        <input type="text" 
               maxlength="1" 
               class="result-value"
               data-row="${metadata.rowIndex}"
               data-position="${metadata.digitPosition}"
               data-multiplier="${metadata.multiplier}">
    `;

    const input = cell.querySelector('input');
    input.addEventListener('input', (e) => handleInput(e, metadata));
}

// Egyesített handleInput függvény a teljes logikával
function handleInput(event, metadata) {
    const input = event.target;
    const value = input.value.trim();
    let isCorrect = false;
    
    // Csak számjegyek engedélyezése
    if (!/^\d?$/.test(value)) {
        input.value = '';
        return;
    }

    const cell = input.closest('.grid-cell');
    if (!cell) return;


        if (checkIfComplete()) {
        SzorzasEllenorzo.validateFinalResult();
    }
    if (value) {
        const numValue = parseInt(value);
        const expectedResult = calculatePartialResult(
            parseInt(grid.dataset.num1), 
            metadata
        );

        // Helyes válasz ellenőrzése
        isCorrect = numValue === expectedResult.digit;

        if (isCorrect) {
            handleCorrectInput(cell, metadata, expectedResult);
            
            // Teljes művelet ellenőrzése
            if (checkFullOperation()) {
                showCompletionMessage();
                disableAllInputs(); // Ez hiányzott a refaktorált verzióból
            }
            
            // Következő mezőre lépés - ez is explicit módon itt kell legyen
            const nextInput = getNextInput(metadata);
            if (nextInput) {
                nextInput.focus();
                nextInput.select(); // Ez hiányzott a refaktorált verzióból
            }
        } else {
            handleIncorrectInput(cell);
        }
    } else {
        cell.classList.remove('correct', 'incorrect');
    }
    
}

// Helyes válasz kezelése - kibővített verzió
function handleCorrectInput(cell, metadata, expectedResult) {
    cell.classList.add('correct');
    cell.classList.remove('incorrect', 'shake'); // shake eltávolítása is szükséges
    
    // Maradék kezelése
    if (expectedResult.remainder > 0) {
        handleRemainder(cell, metadata, expectedResult.remainder);
    }
    
    // Pontszám frissítése - ez hiányzott mindkét verzióból
    updateScore(metadata.rowIndex);
    
    // Animáció hozzáadása
    cell.classList.add('correct-animation');
    setTimeout(() => {
        cell.classList.remove('correct-animation');
    }, 500);
}

// Helytelen válasz kezelése - kibővített verzió
function handleIncorrectInput(cell) {
    cell.classList.add('incorrect');
    cell.classList.remove('correct');
    
    // Shake animáció
    cell.classList.add('shake');
    setTimeout(() => cell.classList.remove('shake'), 500);
    
    // Visszajelzés
    showErrorFeedback(cell);
}

// Maradék kezelése - pontosított verzió
function handleRemainder(cell, metadata, remainder) {
    showRemainder(metadata, remainder);
    const remainderElement = cell.querySelector('.remainder');
    if (remainderElement) {
        remainderElement.textContent = remainder;
        remainderElement.style.animation = 'fadeIn 0.3s';
        
        // Maradék automatikus továbbvitele
        updateNextCellRemainder(metadata, remainder);
    }
}


// Következő input megkeresése - kibővített verzió
function getNextInput(metadata) {
    const grid = document.getElementById('multiplication-grid');
    const num1 = grid.dataset.num1;
    const maxDigits = num1.toString().length;
    
    // Következő pozíció meghatározása
    if (metadata.digitPosition < maxDigits - 1) {
        // Ugyanabban a sorban következő cella
        return document.querySelector(
            `.result-input[data-row="${metadata.rowIndex}"][data-position="${
                metadata.digitPosition + 1
            }"] input`
        );
    } else if (metadata.rowIndex < parseInt(grid.dataset.num2.toString().length) - 1) {
        // Következő sor első cellája
        return document.querySelector(
            `.result-input[data-row="${metadata.rowIndex + 1}"][data-position="0"] input`
        );
    }
    return null;
}

// Részeredmény számítás
function calculatePartialResult(num1, metadata) {
    const digit = parseInt(num1.toString().split('').reverse()[metadata.digitPosition] || 0);
    const prevRemainder = getPreviousRemainder(metadata);
    
    const result = digit * metadata.multiplier + prevRemainder;
    return {
        digit: result % 10,
        remainder: Math.floor(result / 10)
    };
}


// Új segédfüggvények
function updateNextCellRemainder(metadata, remainder) {
    const nextCell = document.querySelector(
        `.result-input[data-row="${metadata.rowIndex}"][data-position="${
            metadata.digitPosition - 1
        }"]`
    );
    if (nextCell) {
        const remainderElement = nextCell.querySelector('.remainder');
        if (remainderElement) {
            remainderElement.textContent = remainder;
            remainderElement.classList.add('show');
        }
    }
}

function showErrorFeedback(cell) {
    const feedback = document.createElement('div');
    feedback.className = 'error-feedback';
    feedback.textContent = 'Próbáld újra!';
    cell.appendChild(feedback);
    
    setTimeout(() => {
        feedback.remove();
    }, 2000);
}

function updateScore(rowIndex) {
    const scoreElement = document.getElementById('current-score');
    if (scoreElement) {
        const currentScore = parseInt(scoreElement.textContent) || 0;
        scoreElement.textContent = currentScore + (10 - rowIndex); // Magasabb pontszám az első sorokért
    }
}

function disableAllInputs() {
    const inputs = document.querySelectorAll('.result-input input');
    inputs.forEach(input => {
        input.disabled = true;
    });
}

// ---------------------------------------------------------------------HANDLE VÉGE----------------------------//



// Előző maradék lekérése
function getPreviousRemainder(metadata) {
    const prevCell = document.querySelector(
        `#remainder-${BASE_ROW + metadata.rowIndex + 1}-${
            CENTER_OFFSET - metadata.rowIndex - metadata.digitPosition + 1
        }`
    );
    return prevCell ? parseInt(prevCell.textContent) || 0 : 0;
}

// Maradék megjelenítése
function showRemainder(metadata, value) {
    const remainderElement = document.querySelector(
        `#remainder-${BASE_ROW + metadata.rowIndex + 1}-${
            CENTER_OFFSET - metadata.rowIndex - metadata.digitPosition
        }`
    );
    
    if (remainderElement) {
        remainderElement.textContent = value;
        remainderElement.classList.add('show');
    }
}

// Következő cella aktiválása
function activateNextCell(currentMetadata) {
    const grid = document.getElementById('multiplication-grid');
    const num1 = grid.dataset.num1;
    const maxDigits = num1.toString().length;
    let nextCell = null;
    
    if (currentMetadata.digitPosition < maxDigits) {
        // Ugyanabban a sorban következő cella
        nextCell = document.querySelector(
            `.result-input[data-row="${currentMetadata.rowIndex}"][data-position="${
                currentMetadata.digitPosition + 1
            }"]`
        );
    } else if (currentMetadata.rowIndex < 2) { // 3 jegyű szorzónál
        // Következő sor első cellája
        nextCell = document.querySelector(
            `.result-input[data-row="${currentMetadata.rowIndex + 1}"][data-position="0"]`
        );
    }
    
    if (nextCell) {
        const input = nextCell.querySelector('input');
        if (input) input.focus();
    }
}



// Hiányzik a teljes művelet ellenőrzése
function checkFullOperation() {
    const allInputs = document.querySelectorAll('.result-value');
    return Array.from(allInputs).every(input => 
        input.classList.contains('correct')
    );
}





// Következő vagy előző mezőre lépés
function moveFinalInput(currentInput, direction) {
    const currentPosition = parseInt(currentInput.dataset.col);
    const nextPosition = currentPosition + direction;
    const maxPosition = calculateExpectedResultLength() - 1;
    
    if (nextPosition >= 0 && nextPosition <= maxPosition) {
        const nextInput = document.querySelector(
            `.final-result input[data-col="${nextPosition}"]`
        );
        if (nextInput) {
            nextInput.focus();
            nextInput.select();
        }
    }
}

// Teljes művelet befejezésének kezelése
function showCompletionMessage() {
    const message = document.createElement('div');
    message.className = 'completion-message';
    message.innerHTML = `
        <div class="success-message">
            <h3>Gratulálok!</h3>
            <p>Sikeresen elvégezted a szorzást!</p>
            <button onclick="createMultiplicationGrid()">Új feladat</button>
        </div>
    `;
    document.body.appendChild(message);
}



// Inicializációs logika egy helyre kiszervezve
function initializeMultiplicationTask() {
    if (createMultiplicationGrid()) {
        displayOperation(
            parseInt(grid.dataset.num1),
            parseInt(grid.dataset.num2)
        );
        setupPartialResults();
        createFinalResultRow();
        focusFirstInput();
    }
}

function focusFirstInput() {
    setTimeout(() => {
        const firstInput = document.querySelector('.result-value');
        if (firstInput) firstInput.focus();
    }, 500);
}
// Event listeners beállítása
document.addEventListener('DOMContentLoaded', () => {
    initializeMultiplicationTask();
    
    const newTaskBtn = document.getElementById('new-task-btn');
    if(newTaskBtn) {
        newTaskBtn.addEventListener('click', initializeMultiplicationTask);
    }
});