/**
 * Custom Task Module for Multiplication Practice
 * 
 * This module handles the functionality for custom multiplication tasks
 * where users can input their own numbers to practice with.
 */

export class CustomTaskHandler {
    /**
     * Creates a new CustomTaskHandler
     * @param {Object} matrixInstance - The parent HelyiertekMatrix instance
     */
    constructor(matrixInstance) {
        this.matrix = matrixInstance;
        this.startCol = matrixInstance.startCol || 4; // Use the updated startCol (now 4)
        this.inputLength = 3;
    }

    /**
     * Prepares the matrix for custom task input
     */
    prepareCustomTaskInput() {
        // Reset the matrix
        this.matrix.resetMatrix();
    
        // Create input fields for szorzando
        for (let i = 0; i < this.inputLength; i++) {
            const cell = this.matrix.getCell(0, this.startCol + i);
            if (cell) {
                cell.textContent = '';
                cell.classList.remove('fixed-number');
                cell.classList.add('custom-input', 'szorzando-input', 'bottom-line');
                // Add specific CSS for better visual appearance
                cell.style.backgroundColor = 'rgba(255, 255, 0, 0.2)';
                cell.style.overflow = 'hidden';
                cell.style.textAlign = 'center';
                cell.style.fontSize = '1.2em';
                cell.style.maxWidth = '100%';
                cell.style.boxSizing = 'border-box';
                // Prevent multiple digits in one cell
                cell.setAttribute('maxlength', '1');
            }
        }
    
        // Multiplication sign - make it fixed and not editable
        const multiplyCell = this.matrix.getCell(0, this.startCol + this.inputLength);
        if (multiplyCell) {
            multiplyCell.textContent = '×';
            multiplyCell.classList.remove('custom-input');
            multiplyCell.classList.add('multiply-sign', 'fixed-number');
            multiplyCell.style.backgroundColor = ''; 
            multiplyCell.style.cursor = 'default';
        }
    
        // Create input fields for szorzo
        for (let i = 0; i < this.inputLength; i++) {
            const cell = this.matrix.getCell(0, this.startCol + this.inputLength + 1 + i);
            if (cell) {
                cell.textContent = '';
                cell.classList.remove('fixed-number');
                cell.classList.add('custom-input', 'szorzo-input');
                // Add specific CSS for better visual appearance
                cell.style.backgroundColor = 'rgba(255, 255, 0, 0.2)';
                cell.style.overflow = 'hidden';
                cell.style.textAlign = 'center';
                cell.style.fontSize = '1.2em';
                cell.style.maxWidth = '100%';
                cell.style.boxSizing = 'border-box';
                // Prevent multiple digits in one cell
                cell.setAttribute('maxlength', '1');
            }
        }
    
        // Focus on the rightmost szorzando cell (for right-to-left input)
        const firstInputCell = this.matrix.getCell(0, this.startCol + this.inputLength - 1);
        if (firstInputCell) {
            this.matrix.selectCell(firstInputCell);
            firstInputCell.classList.add('blinking-cursor');
        }
    
        // Update message - using the proper message methods
        try {
            // First try to use showResultMessage
            this.matrix.messageHandler.showResultMessage(true, "Add meg a szorzandót és a szorzót a kijelölt cellákban. Ha kész vagy, kattints az 'Ellenőrzés' gombra.");
        } catch (e) {
            // Fallback to any available method
            const messageElement = document.querySelector('.message-container');
            if (messageElement) {
                messageElement.textContent = "Add meg a szorzandót és a szorzót a kijelölt cellákban. Ha kész vagy, kattints az 'Ellenőrzés' gombra.";
            } else {
                console.log("Add meg a szorzandót és a szorzót a kijelölt cellákban. Ha kész vagy, kattints az 'Ellenőrzés' gombra.");
            }
        }
    }

    /**
     * Process the custom task input and set up the matrix
     */
    processCustomTaskInput() {
        let szorzandoStr = '';
        let szorzoStr = '';

        // Collect szorzando digits
        for (let i = 0; i < this.inputLength; i++) {
            const cell = this.matrix.getCell(0, this.startCol + i);
            if (cell) {
                szorzandoStr += cell.textContent || '0'; // Default to '0' if empty
            }
        }

        // Collect szorzo digits
        for (let i = 0; i < this.inputLength; i++) {
            const cell = this.matrix.getCell(0, this.startCol + this.inputLength + 1 + i);
            if (cell) {
                szorzoStr += cell.textContent || '0'; // Default to '0' if empty
            }
        }

        const szorzando = parseInt(szorzandoStr);
        const szorzo = parseInt(szorzoStr);

        // Basic validation
        if (isNaN(szorzando) || isNaN(szorzo) || szorzando <= 0 || szorzo <= 0) {
            this.matrix.messageHandler.showResultMessage(false, "Kérlek, adj meg érvényes pozitív számokat.");
            return false;
        }

        // Set up the matrix with the custom values
        this.matrix.resetMatrix();
        
        // Store the values in the matrix instance
        this.matrix.szorzando = szorzando;
        this.matrix.szorzo = szorzo;
        
        // Create a new validator with the custom values
        this.matrix.validator = new this.matrix.validatorClass(szorzando, szorzo);
        
        // Reset tracking variables
        this.matrix.lastPartialRow = 0;
        
        // Set up the visual representation
        this.matrix.displayNumbers();
        
        // Show guide for the user
        this.matrix.messageHandler.showInitialGuide(szorzando, szorzo);
        
        // Position the cursor in the first input row for partial results
        // This will now use the updated positionInputCursor method
        this.matrix.positionInputCursor(1);
        
        console.log(`Egyéni feladat beállítva: ${szorzando} × ${szorzo} = ${szorzando * szorzo}`);
        return true;
    }

    /**
     * Handle number input for custom task cells specifically
     */
    handleCustomCellInput(cell, number) {
        // Remove blinking cursor
        cell.classList.remove('blinking-cursor');
        
        // Set input value
        cell.textContent = number;
        cell.classList.add('filled');
        
        const currentCol = parseInt(cell.dataset.col);
        const currentRow = parseInt(cell.dataset.row);
        
        // Handle navigation for szorzando and szorzo input cells
        if (cell.classList.contains('szorzando-input')) {
            if (currentCol === this.startCol) {
                // We reached the leftmost szorzando cell, move to first szorzo cell
                const szorzoCell = this.matrix.getCell(currentRow, this.startCol + this.inputLength + (this.inputLength-1));
                if (szorzoCell && szorzoCell.classList.contains('custom-input')) {
                    this.matrix.selectCell(szorzoCell);
                    szorzoCell.classList.add('blinking-cursor');
                }
            } else {
                // Move to next szorzando cell to the left
                const nextCell = this.matrix.getCell(currentRow, currentCol - 1);
                if (nextCell && nextCell.classList.contains('custom-input')) {
                    this.matrix.selectCell(nextCell);
                    nextCell.classList.add('blinking-cursor');
                }
            }
        } else if (cell.classList.contains('szorzo-input')) {
            // Move to next szorzo cell to the left
            const nextCell = this.matrix.getCell(currentRow, currentCol - 1);
            if (nextCell && nextCell.classList.contains('custom-input')) {
                this.matrix.selectCell(nextCell);
                nextCell.classList.add('blinking-cursor');
            }
        }
        
        return true; // Input was handled
    }

    /**
     * Handle keyboard navigation for custom inputs
     * @param {HTMLElement} cell - The current active cell
     * @param {string} key - The pressed key
     * @returns {boolean} - Whether the key was handled
     */
    handleCustomKeyboardNavigation(cell, key) {
        if (!cell || !cell.classList.contains('custom-input')) {
            return false;
        }

        const currentCol = parseInt(cell.dataset.col);
        const currentRow = parseInt(cell.dataset.row);

        switch (key) {
            case 'ArrowRight':
                // Move to the next cell to the right if possible
                if (cell.classList.contains('szorzando-input') && 
                    currentCol < this.startCol + this.inputLength - 1) {
                    const nextCell = this.matrix.getCell(currentRow, currentCol + 1);
                    if (nextCell) {
                        this.matrix.selectCell(nextCell);
                        nextCell.classList.add('blinking-cursor');
                        return true;
                    }
                } else if (cell.classList.contains('szorzo-input') && 
                    currentCol < this.startCol + this.inputLength * 2) {
                    const nextCell = this.matrix.getCell(currentRow, currentCol + 1);
                    if (nextCell && nextCell.classList.contains('custom-input')) {
                        this.matrix.selectCell(nextCell);
                        nextCell.classList.add('blinking-cursor');
                        return true;
                    }
                }
                break;

            case 'ArrowLeft':
                // Move to the previous cell to the left if possible
                if ((cell.classList.contains('szorzando-input') && currentCol > this.startCol) ||
                    (cell.classList.contains('szorzo-input') && 
                    currentCol > this.startCol + this.inputLength + 1)) {
                    const prevCell = this.matrix.getCell(currentRow, currentCol - 1);
                    if (prevCell && prevCell.classList.contains('custom-input')) {
                        this.matrix.selectCell(prevCell);
                        prevCell.classList.add('blinking-cursor');
                        return true;
                    }
                }
                break;

            case 'Tab':
                // Switch between szorzando and szorzo sections
                if (cell.classList.contains('szorzando-input')) {
                    // Go to first szorzo cell
                    const szorzoCell = this.matrix.getCell(currentRow, 
                                     this.startCol + this.inputLength + 1);
                    if (szorzoCell) {
                        this.matrix.selectCell(szorzoCell);
                        szorzoCell.classList.add('blinking-cursor');
                        return true;
                    }
                } else if (cell.classList.contains('szorzo-input')) {
                    // Go to first szorzando cell
                    const szorzandoCell = this.matrix.getCell(currentRow, this.startCol);
                    if (szorzandoCell) {
                        this.matrix.selectCell(szorzandoCell);
                        szorzandoCell.classList.add('blinking-cursor');
                        return true;
                    }
                }
                break;
        }
        
        return false;
    }

    /**
     * Check if a cell is a custom input cell
     */
    isCustomInputCell(cell) {
        return cell && cell.classList.contains('custom-input');
    }
}

// Setup function to attach the custom task handler to a button
export function setupCustomTaskButton(matrix) {
    const customHandler = new CustomTaskHandler(matrix);
    
    // Attach event listener to the "Saját feladat" button
    const customTaskButton = document.getElementById('sajat-feladat-btn');
    if (customTaskButton) {
        console.log("Found 'Saját feladat' button, attaching event listener.");

        customTaskButton.addEventListener('click', () => {
            console.log("'Saját feladat' button clicked.");
            try {
                customHandler.prepareCustomTaskInput();
                console.log("prepareCustomTaskInput() executed.");
            } catch (error) {
                console.error("Error executing prepareCustomTaskInput:", error);
            }
        });
        
        return customHandler;
    } else {
        console.error("'Saját feladat' button not found. Ensure the button has the correct ID: 'sajat-feladat-btn'.");
        return null;
    }
}
