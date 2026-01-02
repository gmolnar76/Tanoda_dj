class NumberGenerator {
    constructor() {
        this.excludedNumbers = [0, 1, 10, 100];
        this.maxNumber = 484;
    }

    generateNumber(level) {
        let number;
        do {
            number = Math.floor(Math.random() * this.getMaxForLevel(level)) + 2;
        } while (this.excludedNumbers.includes(number));
        return number;
    }
    getMaxForLevel(level) {
        switch(level) {
            case 1: return 100;
            case 2: return 225;
            case 3: return 484;
            default: return 100;
        }
    }

    generatePair(level) {
        return {
            multiplicand: this.generateNumber(level),
            multiplier: this.generateNumber(level)
        };
    }
}

export const numberGenerator = new NumberGenerator();