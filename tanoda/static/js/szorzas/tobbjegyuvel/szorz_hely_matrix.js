import { MessageHandler } from '../szor_messages.js';
import { SzorzasDemo } from '../demo_animation.js';
import { setupCustomTaskButton } from './sajat.js';

class SimpleValidator {
    constructor(szorzando, szorzo) {
        this.szorzando = parseInt(szorzando);
        this.szorzo = parseInt(szorzo);
        this.expectedResult = this.szorzando * this.szorzo;
        this.partialResults = [];
    }
 
    // Részeredmény validálása
    checkPartialResult(row) {
        const szorzoReversed = this.szorzo.toString().split('').reverse();
        const szorzoDigit = parseInt(szorzoReversed[row-1]);
        const expected = this.szorzando * szorzoDigit;
        
        return {
            expected,
            isValid: (input) => {
                const parsed = parseInt(input);
                return parsed === expected;
            }
        };
    }
    
    // Calculate carries for a multiplication
    calculateCarries(digit) {
        const szorzandoStr = this.szorzando.toString();
        let carry = 0;
        const carries = [];
        
        for (let i = szorzandoStr.length - 1; i >= 0; i--) {
            const currentDigit = parseInt(szorzandoStr[i]);
            const product = currentDigit * digit + carry;
            const resultDigit = product % 10;
            carry = Math.floor(product / 10);
            carries.unshift(carry);
        }
        
        return carries;
    }
 
    checkFinal(userInput) {
        const input = parseInt(userInput);
        const expectedResult = this.expectedResult;
        const sumOfPartials = this.partialResults.reduce((sum, val) => sum + val, 0);
        
        return {
            isCorrect: input === this.expectedResult,
            expected: this.expectedResult,
            matchesPartials: sumOfPartials === this.expectedResult,
            details: {
                userInput: input,
                expectedResult: this.expectedResult,
                difference: Math.abs(input - this.expectedResult),
                sumOfPartials
            }
        };
    }
 
    addPartialResult(result) {
        this.partialResults.push(parseInt(result));
    }
 
    reset() {
        this.partialResults = [];
    }
}

class HelyiertekMatrix {
    constructor() {
        this.szorzando = 0;
        this.szorzo = 0;
        this.validator = null;
        this.validatorClass = SimpleValidator;
        this.container = document.querySelector('.helyiertek-matrix');
        this.messageHandler = new MessageHandler();
        this.aktivCella = null;
        this.matrixSize = {
            rows: 5,
            cols: 12,
        };
        this.lastPartialRow = 0;
        this.customHandler = null;
        this.startCol = 4;
        this.showCarryDigits = false;
    }

    init() {
        this.createMatrix();
        this.createNumberPad();
        this.generalSzamok();
        this.initEventListeners();
        this.initCarryDigitToggle();
    }
    
    initCarryDigitToggle() {
        const carryToggle = document.getElementById('show-carry-digits');
        if (carryToggle) {
            carryToggle.addEventListener('change', (e) => {
                this.showCarryDigits = e.target.checked;
                this.updateCarryDigitsVisibility();
            });
        }
    }
    
    updateCarryDigitsVisibility() {
        const carryElements = this.container.querySelectorAll('.carry-digit');
        carryElements.forEach(carry => {
            if (this.showCarryDigits) {
                carry.style.display = 'block';
            } else {
                carry.style.display = 'none';
            }
        });
    }
    
    calculateCarryDigits(row) {
        if (!this.showCarryDigits) return;
        
        // Clear existing carries for this row
        const rowCells = this.container.querySelectorAll(`[data-row="${row}"]`);
        rowCells.forEach(cell => {
            const carryElem = cell.querySelector('.carry-digit');
            if (carryElem) carryElem.textContent = '';
        });
        
        // Get multiplier digit for this row
        const szorzoReversed = this.szorzo.toString().split('').reverse();
        const szorzoDigit = parseInt(szorzoReversed[row-1]);
        const szorzandoStr = this.szorzando.toString();
        const szorzandoDigits = szorzandoStr.split('').map(d => parseInt(d));
        
        // Do the entire multiplication manually to get carries
        let carry = 0;
        const carries = [];
        
        // Go from right to left through szorzando digits
        for (let i = szorzandoDigits.length - 1; i >= 0; i--) {
            // Current digit's product plus previous carry
            const product = szorzandoDigits[i] * szorzoDigit + carry;
            // Next carry is the tens digit
            carry = Math.floor(product / 10);
            // Store the carry (for the digit to the left)
            carries.unshift(carry);
        }
        
        // Display carries above cells that have content
        const szorzandoLength = szorzandoStr.length;
        const startDigitCol = this.startCol + szorzandoLength - 1; // Right-most digit col
        
        // For each digit in the partial result
        for (let i = 0; i < szorzandoLength; i++) {
            const col = startDigitCol - i;
            const cell = this.getCell(row, col);
            
            if (cell && cell.textContent) {
                if (i < szorzandoLength - 1) { // There's no carry for the leftmost digit
                    const carryValue = carries[i];
                    if (carryValue > 0) {
                        let carryElem = cell.querySelector('.carry-digit');
                        if (!carryElem) {
                            carryElem = document.createElement('span');
                            carryElem.className = 'carry-digit';
                            cell.appendChild(carryElem);
                        }
                        carryElem.textContent = carryValue;
                        carryElem.style.display = this.showCarryDigits ? 'block' : 'none';
                    }
                }
            }
        }
    }

    createMatrix() {
        if (!this.container) return;
        this.container.innerHTML = '';
        this.container.style.display = 'grid';
        this.container.style.gridTemplateRows = `repeat(${this.matrixSize.rows}, 1fr)`;
        this.container.style.gridTemplateColumns = `repeat(${this.matrixSize.cols}, 1fr)`;
        
        for (let i = 0; i < this.matrixSize.rows; i++) {
            for (let j = 0; j < this.matrixSize.cols; j++) {
                const cell = document.createElement('div');
                cell.className = 'matrix-cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                this.container.appendChild(cell);
            }
        }
    }

    createNumberPad() {
        const padContainer = document.createElement('div');
        padContainer.className = 'matrix-number-pad';
        
        const numbers = [
            [7, 8, 9],
            [4, 5, 6],
            [1, 2, 3],
            ['←', 0, 'DEL']
        ];

        numbers.forEach((row) => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'numpad-row';
            
            row.forEach(num => {
                const button = document.createElement('button');
                button.className = 'number-button';
                
                if (num === 'DEL' || num === '←') {
                    button.className += ' special-button';
                    button.dataset.action = num === 'DEL' ? 'delete' : 'backspace';
                    
                    if (num === 'DEL') {
                        button.innerHTML = '⌫';
                        button.title = 'Delete';
                    } else {
                        button.innerHTML = '←';
                        button.title = 'Backspace';
                    }
                } else {
                    button.dataset.number = num;
                    button.textContent = num;
                }
                
                rowDiv.appendChild(button);
            });
            
            padContainer.appendChild(rowDiv);
        });

        const numberPadSection = document.querySelector('.numpad-container');
        if (numberPadSection) {
            numberPadSection.innerHTML = '';
            numberPadSection.appendChild(padContainer);
        }
    }

    initDemoButton() {
        const demoBtn = document.createElement('button');
        demoBtn.innerHTML = '▶ Bemutató';
        demoBtn.onclick = () => {
            const demo = new SzorzasDemo(this);
            demo.start();
        };
        this.container.parentNode.insertBefore(demoBtn, this.container);
    }

    generalSzamok() {
        let gen1 = () => Math.floor(Math.random() * 8) + 2;
        this.szorzando = gen1() * 100 + gen1() * 10 + gen1();
        this.szorzo = gen1() * 100 + gen1() * 10 + gen1();
        this.validator = new SimpleValidator(this.szorzando, this.szorzo);
        this.displayNumbers();
        this.messageHandler.showInitialGuide(this.szorzando, this.szorzo);
        this.lastPartialRow = 0;
    }

    collectRowDigits(row) {
        let digits = '';
        for (let col = this.matrixSize.cols - 1; col >= 0; col--) {
            const cell = this.getCell(row, col);
            if (cell && cell.textContent && !cell.classList.contains('fixed-number')) {
                digits = cell.textContent + digits;
            }
        }
        return digits.replace(/^0+/, '') || '0';
    }
    
    displayNumbers() {
        const startCol = this.startCol;
        const szorzandoStr = this.szorzando.toString();
        const szorzoStr = this.szorzo.toString();
        
        for (let i = 0; i < szorzandoStr.length; i++) {
            const cell = this.getCell(0, startCol + i);
            if (cell) {
                cell.textContent = szorzandoStr[i];
                cell.classList.add('fixed-number', 'bottom-line');
            }
        }

        const lastRow = this.szorzo.toString().length;
        for (let col = 0; col < this.matrixSize.cols; col++) {
            const cell = this.getCell(lastRow, col);
            if (cell) {
                cell.classList.add('bottom-line');
            }
        }

        const multiplyCell = this.getCell(0, startCol + szorzandoStr.length);
        if (multiplyCell) {
            multiplyCell.textContent = '×';
            multiplyCell.classList.add('multiply-sign');
        }
        
        for (let i = 0; i < szorzoStr.length; i++) {
            const cell = this.getCell(0, startCol + szorzandoStr.length + 1 + i);
            if (cell) {
                cell.textContent = szorzoStr[i];
                cell.classList.add('fixed-number');
            }
        }

        this.positionInputCursor(1);
    }

    positionInputCursor(row) {
        const szorzandoLength = this.szorzando.toString().length;
        const lastDigitCol = this.startCol + szorzandoLength - 1;
        let col = lastDigitCol;
        let cell = this.getCell(row, col);
        
        if (cell && cell.textContent) {
            let rightCol = lastDigitCol + 1;
            while (rightCol < this.matrixSize.cols) {
                const rightCell = this.getCell(row, rightCol);
                if (rightCell && !rightCell.textContent && 
                    !rightCell.classList.contains('fixed-number') && 
                    !rightCell.classList.contains('multiply-sign')) {
                    col = rightCol;
                    cell = rightCell;
                    break;
                }
                rightCol++;
            }
            
            if (col === lastDigitCol) {
                let leftCol = lastDigitCol - 1;
                while (leftCol >= 0) {
                    const leftCell = this.getCell(row, leftCol);
                    if (leftCell && !leftCell.textContent && 
                       !leftCell.classList.contains('fixed-number') && 
                       !leftCell.classList.contains('multiply-sign')) {
                        col = leftCol;
                        cell = leftCell;
                        break;
                    }
                    leftCol--;
                }
            }
        }
        
        if (cell && !cell.textContent && 
           !cell.classList.contains('fixed-number') && 
           !cell.classList.contains('multiply-sign')) {
            this.selectCell(cell);
            cell.classList.add('blinking-cursor');
        }
    }

    initEventListeners() {
        this.container.addEventListener('click', (e) => {
            const cell = e.target.closest('.matrix-cell');
            if (!cell || cell.classList.contains('fixed-number') || 
                cell.classList.contains('multiply-sign')) {
                return;
            }
            
            this.selectCell(cell);
            cell.classList.add('blinking-cursor');
        });

        const demoBtn = document.getElementById('demo-btn');
        if (demoBtn) {
            demoBtn.addEventListener('click', () => {
                const demo = new SzorzasDemo(this);
                demo.start();
            });
        }

        document.querySelectorAll('.number-button').forEach(button => {
            button.addEventListener('click', () => {
                if (!this.aktivCella) return;
                
                if (button.dataset.action) {
                    if (button.dataset.action === 'delete') {
                        this.handleDelete();
                    } else if (button.dataset.action === 'backspace') {
                        this.handleBackspace();
                    }
                } else if (button.dataset.number) {
                    this.handleNumberInput(button.dataset.number);
                }
            });
        });

        document.addEventListener('keydown', (e) => {
            if (!this.aktivCella) return;
            
            if (e.key === 'Delete') {
                e.preventDefault();
                this.handleDelete();
            } else if (e.key === 'Backspace') {
                e.preventDefault();
                this.handleBackspace();
            } else if ((e.key >= '0' && e.key <= '9') || (e.key >= 'Numpad0' && e.key <= 'Numpad9')) {
                e.preventDefault();
                const digit = e.key.replace('Numpad', '');
                this.handleNumberInput(digit);
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.moveLeft();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.moveRight();
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
                this.moveVertically(e.key === 'ArrowUp' ? -1 : 1);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const ellenorzesBtn = document.querySelector('button[id="ellenorzes-btn"]');
                if (ellenorzesBtn) {
                    ellenorzesBtn.click();
                }
            }
        });

        const ellenorzesBtn = document.querySelector('button[id="ellenorzes-btn"]');
        if (ellenorzesBtn) {
            ellenorzesBtn.addEventListener('click', () => {
                if (this.customHandler && this.container.querySelector('.custom-input')) {
                    this.customHandler.processCustomTaskInput();
                } else {
                    this.validateAllRows();
                }
            });
        }

        const ujFeladatBtn = document.querySelector('button[id="uj-feladat-btn"]');
        if (ujFeladatBtn) {
            ujFeladatBtn.addEventListener('click', () => {
                this.resetMatrix();
                this.generalSzamok();
            });
        }
    }

    handleDelete() {
        if (this.aktivCella) {
            this.aktivCella.textContent = '';
            this.aktivCella.classList.remove('filled');
        }
    }

    handleBackspace() {
        if (this.aktivCella) {
            this.aktivCella.textContent = '';
            this.aktivCella.classList.remove('filled');
            const currentCol = parseInt(this.aktivCella.dataset.col);
            const currentRow = parseInt(this.aktivCella.dataset.row);
            if (currentCol < this.matrixSize.cols - 1) {
                const nextCell = this.getCell(currentRow, currentCol + 1);
                if (nextCell && !nextCell.classList.contains('fixed-number')) {
                    this.selectCell(nextCell);
                    nextCell.classList.add('blinking-cursor');
                }
            }
        }
    }

    handleNumberInput(number) {
        if (!this.aktivCella) return;

        if (this.aktivCella.classList.contains('fixed-number') || 
            this.aktivCella.classList.contains('multiply-sign')) {
            return;
        }
        
        if (this.customHandler && this.aktivCella.classList.contains('custom-input')) {
            this.customHandler.handleCustomCellInput(this.aktivCella, number);
            return;
        }
        
        this.aktivCella.classList.remove('blinking-cursor');
        this.aktivCella.textContent = number;
        this.aktivCella.classList.add('filled');
        
        // Calculate carry for this specific digit if enabled
        if (this.showCarryDigits) {
            const currentRow = parseInt(this.aktivCella.dataset.row);
            // Only process for partial result rows
            if (currentRow > 0 && currentRow <= this.szorzo.toString().length) {
                const szorzoReversed = this.szorzo.toString().split('').reverse();
                const szorzoDigit = parseInt(szorzoReversed[currentRow-1]);
                const szorzandoStr = this.szorzando.toString();
                
                // Calculate the carry for the current position
                let carry = 0;
                const szorzandoDigits = szorzandoStr.split('').map(d => parseInt(d));
                const currentCol = parseInt(this.aktivCella.dataset.col);
                
                // Get the position of this cell relative to the right-most digit of szorzando
                const szorzandoLength = szorzandoStr.length;
                const startDigitCol = this.startCol + szorzandoLength - 1; // Right-most digit col
                const digitPosition = startDigitCol - currentCol;
                
                // We are filling from right to left, so we find which digit the user is currently filling
                if (digitPosition >= 0 && digitPosition < szorzandoLength) {
                    // Calculate carry: Each cell that has received input generates a carry for the next cell to the left
                    const cellToRight = this.getCell(currentRow, currentCol + 1);
                    if (cellToRight && cellToRight.textContent) {
                        // For each input digit, calculate carry based on the digit to its right
                        const rightIndex = digitPosition - 1;
                        
                        // At the right-most position, there's no carry from a previous calculation
                        if (rightIndex < 0) {
                            // This is the right-most digit, just calculate the product
                            const product = szorzandoDigits[szorzandoLength - 1] * szorzoDigit;
                            carry = Math.floor(product / 10);
                        } else if (rightIndex < szorzandoLength) {
                            // For other digits, we may have a carry from previous calculation
                            // Get the right digit's carry
                            const rightCellCarry = cellToRight.querySelector('.carry-digit');
                            const previousCarry = rightCellCarry ? parseInt(rightCellCarry.textContent || "0") : 0;
                            
                            // Calculate current digit's product plus carry from right
                            const product = szorzandoDigits[szorzandoLength - digitPosition - 1] * szorzoDigit;
                            const total = product + previousCarry;
                            carry = Math.floor(total / 10);
                        }
                        
                        // Update the carry digit on the current cell
                        if (carry > 0) {
                            let carryElem = this.aktivCella.querySelector('.carry-digit');
                            if (!carryElem) {
                                carryElem = document.createElement('span');
                                carryElem.className = 'carry-digit';
                                this.aktivCella.appendChild(carryElem);
                            }
                            carryElem.textContent = carry;
                            carryElem.style.display = this.showCarryDigits ? 'block' : 'none';
                        }
                    }
                }
            }
        }
        
        // Move to the next cell
        const currentCol = parseInt(this.aktivCella.dataset.col);
        const currentRow = parseInt(this.aktivCella.dataset.row);
        
        if (currentCol > 0) {
            const nextCell = this.getCell(currentRow, currentCol - 1);
            if (nextCell && !nextCell.classList.contains('fixed-number')) {
                this.selectCell(nextCell);
                nextCell.classList.add('blinking-cursor');
            }
        }
    }

    validateAllRows() {
        if (!this.aktivCella) return;
        
        const currentRow = parseInt(this.aktivCella.dataset.row);
        const rowContent = this.collectRowDigits(currentRow);
        
        if (!rowContent) {
            return;
        }

        if (currentRow <= this.szorzo.toString().length) {
            const validation = this.validator.checkPartialResult(currentRow);
            const isValid = validation.isValid(rowContent);

            this.markRowValidation(currentRow, isValid);
            
            if (isValid) {
                if (currentRow > this.lastPartialRow) {
                    this.validator.addPartialResult(rowContent);
                    this.lastPartialRow = currentRow;
                }
                
                if (currentRow === this.szorzo.toString().length) {
                    this.addLastRowLine();
                }
                
                this.moveToNextRow(currentRow);
                
                this.messageHandler.showResultMessage(true);
            } else {
                this.messageHandler.showResultMessage(false, validation.expected);
            }
            
            return;
        }

        const allPartialsValid = this.checkAllPartialResults();
        
        if (allPartialsValid) {
            const finalResult = this.validator.checkFinal(rowContent);
            
            this.markRowValidation(currentRow, finalResult.isCorrect);
            if (finalResult.isCorrect) {
                this.messageHandler.showFinalResult(true, this.calculateScore());
                this.disableInput();
            } else {
                this.messageHandler.showResultMessage(false, finalResult.expected);
            }
        } else {
            this.messageHandler.showFinalResult(false);
        }
    }
    
    checkAllPartialResults() {
        for (let row = 1; row <= this.szorzo.toString().length; row++) {
            const rowContent = this.collectRowDigits(row);
            if (!rowContent) return false;
            
            const validation = this.validator.checkPartialResult(row);
            if (!validation.isValid(rowContent)) return false;
        }
        return true;
    }

    calculateScore() {
        let score = 100;
        const digits = Math.max(
            this.szorzo.toString().length,
            this.szorzando.toString().length
        );
        score += digits * 10;
        return score;
    }

    validateCurrentRow() {
        if (!this.aktivCella) return;
        
        const currentRow = parseInt(this.aktivCella.dataset.row);
        if (currentRow === 0) return;

        const input = this.collectRowDigits(currentRow);
        const result = this.validator.validateRow(currentRow, input);

        this.handleValidationResult(result, currentRow);

        if (result.isValid) {
            this.moveToNextRow(currentRow);
        }
    }

    shouldMoveToNextRow(currentRow) {
        return currentRow < this.szorzo.toString().length;
    }

    moveToNextRow(currentRow) {
        const nextRow = currentRow + 1;
        if (nextRow <= this.szorzo.toString().length) {
            this.positionInputCursor(nextRow);
        }
    }

    calculateExpectedResult(row) {
        const szorzoDigit = parseInt(this.szorzo.toString().slice(-row)[0]);
        const partialResult = this.szorzando * szorzoDigit;
        return partialResult * Math.pow(10, row - 1);
    }

    markRowValidation(row, isCorrect) {
        const cells = this.container.querySelectorAll(`[data-row="${row}"]`);
        cells.forEach(cell => {
            cell.classList.remove('valid', 'invalid');
            cell.classList.add(isCorrect ? 'valid' : 'invalid');
        });
    }

    getCell(row, col) {
        return this.container.querySelector(
            `.matrix-cell[data-row="${row}"][data-col="${col}"]`
        );
    }

    getLastFilledColumn(row) {
        for (let col = this.matrixSize.cols - 1; col >= 0; col--) {
            const cell = this.getCell(row, col);
            if (cell && cell.textContent && !cell.classList.contains('fixed-number')) {
                return col;
            }
        }
        return -1;
    }

    selectCell(cell) {
        if (this.aktivCella) {
            this.aktivCella.classList.remove('active', 'blinking-cursor');
        }
        this.aktivCella = cell;
        cell.classList.add('active');
    }

    moveLeft() {
        if (!this.aktivCella) return;
        const currentCol = parseInt(this.aktivCella.dataset.col);
        const currentRow = parseInt(this.aktivCella.dataset.row);
        const nextCell = this.getCell(currentRow, currentCol - 1);
        if (nextCell && !nextCell.classList.contains('fixed-number')) {
            this.selectCell(nextCell);
        }
    }

    moveRight() {
        if (!this.aktivCella) return;
        const currentCol = parseInt(this.aktivCella.dataset.col);
        const currentRow = parseInt(this.aktivCella.dataset.row);
        const nextCell = this.getCell(currentRow, currentCol + 1);
        if (nextCell && !nextCell.classList.contains('fixed-number')) {
            this.selectCell(nextCell);
        }
    }

    moveVertically(direction) {
        if (!this.aktivCella) return;
        const currentCol = parseInt(this.aktivCella.dataset.col);
        const currentRow = parseInt(this.aktivCella.dataset.row);
        const nextRow = currentRow + direction;
        
        if (nextRow >= 0 && nextRow < this.matrixSize.rows) {
            const nextCell = this.getCell(nextRow, currentCol);
            if (nextCell && !nextCell.classList.contains('fixed-number') && 
                !nextCell.classList.contains('multiply-sign')) {
                this.selectCell(nextCell);
                nextCell.classList.add('blinking-cursor');
            }
        }
    }

    disableInput() {
        this.aktivCella = null;
        const cells = this.container.querySelectorAll('.matrix-cell');
        cells.forEach(cell => {
            cell.classList.remove('active', 'blinking-cursor');
        });
        
        document.querySelectorAll('.number-button').forEach(button => {
            button.disabled = true;
        });
    }

    resetMatrix() {
        const cells = this.container.querySelectorAll('.matrix-cell:not(.fixed-number):not(.multiply-sign)');
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('filled', 'active', 'valid', 'invalid', 'blinking-cursor');
        });
        this.aktivCella = null;
        
        document.querySelectorAll('.number-button').forEach(button => {
            button.disabled = false;
        });
        
        const carryDigits = this.container.querySelectorAll('.carry-digit');
        carryDigits.forEach(digit => {
            digit.textContent = '';
        });
    }

    addLastRowLine() {
        const lastResultRow = this.szorzo.toString().length;
        for (let col = 0; col < this.matrixSize.cols; col++) {
            const cell = this.getCell(lastResultRow, col);
            if (cell) {
                cell.classList.add('bottom-line');
            }
        }
    }
}

export function initHelyiertekMatrix() {
    const matrix = new HelyiertekMatrix();
    matrix.init();

    window.helyiertekMatrix = matrix;
    console.log("Matrix instance stored in window.helyiertekMatrix");

    matrix.customHandler = setupCustomTaskButton(matrix);
    
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('carry')) {
        const carryToggle = document.getElementById('show-carry-digits');
        if (carryToggle) {
            carryToggle.checked = true;
            matrix.showCarryDigits = true;
            matrix.updateCarryDigitsVisibility();
        }
    }
    
    return matrix;
}