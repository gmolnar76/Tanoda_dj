export class SzorzasDemo {
    constructor(matrix) {
        this.matrix = matrix;
        this.steps = [];
        this.currentStep = 0;
        this.speed = 1000;
        this.running = false;
    }

    async start() {
        if (this.running) return;
        this.running = true;
        this.initializeSteps();
        
        for (const step of this.steps) {
            await this.executeStep(step);
            await this.wait(this.speed);
        }
        
        this.running = false;
    }

    async executeStep(step) {
        await Promise.resolve(step.action());
        this.showMessage(step.message);
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    showMessage(message) {
        this.matrix.messageHandler.showInitialGuide(message);
    }

    highlightSzorzoDigit(position) {
        const cell = this.matrix.getCell(0, position);
        if (cell) {
            cell.classList.add('highlight');
            setTimeout(() => cell.classList.remove('highlight'), this.speed);
        }
    }

    initializeSteps() {
        const szorzo = this.matrix.szorzo.toString();
        
        this.steps = [
            {
                message: "Kezdjük a szorzást a szorzó egyes helyiértékén álló számmal",
                action: () => this.highlightSzorzoDigit(szorzo.length - 1)
            },
            {
                message: `Szorozzuk meg a szorzandót (${this.matrix.szorzando}) a szorzó egyes helyiértékén álló számmal (${szorzo[szorzo.length-1]})`,
                action: () => this.calculatePartial(1)
            },
            {
                message: "Most a tízes helyiértéken álló számmal szorzunk",
                action: () => this.highlightSzorzoDigit(szorzo.length - 2)
            },
            {
                message: `Szorozzuk meg a szorzandót (${this.matrix.szorzando}) a szorzó tízes helyiértékén álló számmal (${szorzo[szorzo.length-2]})`,
                action: () => this.calculatePartial(2)
            },
            {
                message: "Végül a százas helyiértéken álló számmal szorzunk",
                action: () => this.highlightSzorzoDigit(szorzo.length - 3)  
            },
            {
                message: `Szorozzuk meg a szorzandót (${this.matrix.szorzando}) a szorzó százas helyiértékén álló számmal (${szorzo[szorzo.length-3]})`,
                action: () => this.calculatePartial(3)
            }
        ];
    }
 
    calculatePartial(row) {
        return new Promise(resolve => {
            const szorzoDigit = parseInt(this.matrix.szorzo.toString()[this.matrix.szorzo.toString().length - row]);
            const result = this.matrix.szorzando * szorzoDigit;
            const resultStr = result.toString();
            
            let completedDigits = 0;
            resultStr.split('').reverse().forEach((digit, index) => {
                setTimeout(() => {
                    const cell = this.matrix.getCell(row, 
                        // Minden sort eggyel balrább tolunk az előzőhöz képest
                        this.matrix.matrixSize.cols - 6 - index - (row - 1));
                    if (cell) {
                        cell.textContent = digit;
                        cell.classList.add('filled');
                    }
                    completedDigits++;
                    if (completedDigits === resultStr.length) {
                        resolve();
                    }
                }, index * 300);
            });
        });
    }
 }