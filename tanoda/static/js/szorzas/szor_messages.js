/*
Egységesített üzenetkezelő rendszer, amely támogatja a különböző típusú üzeneteket:

Fő funkciók:
- showSuccess: Sikeres válasz esetén megjelenő üzenet (szabállyal)
- showError: Hibás válasz esetén megjelenő üzenet (segítséggel)
- showWarning: Figyelmeztető üzenet
- showInfo: Információs üzenet

Speciális funkciók:
- showInitialGuide: Kezdő útmutató az első lépésekhez
- showResultMessage: Részeredmény ellenőrzésének visszajelzése
- showFinalResult: Végső ellenőrzés eredménye
- showNextStepGuide: Következő lépés útmutatója
- clearMessages: Üzenetek törlése
*/

class MessageHandler {
    constructor(options = {}) {
        this.toastContainer = null;
        // Alapértelmezett beállítások
        this.config = {
            displayMode: options.displayMode || 'toast', // 'toast' vagy 'inline' vagy 'fixed'
            duration: options.duration || 7000,          // alapértelmezetten 7 másodperc 
            position: options.position || 'top-center',  // 'top-center', 'top-right', stb.
            animations: options.animations !== false,    // animációk engedélyezése/tiltása
            targetElementId: options.targetElementId || null, // cél elem ID inline módhoz
            targetSelector: options.targetSelector || null,   // CSS szelektor a relatív pozicionáláshoz
            clickToClose: options.clickToClose !== false,  // kattintásra eltűnjön
            maxWidth: options.maxWidth || '100%'        // maximum szélesség 100%
        };
        
        this.initContainer();
    }

    // Konténer inicializálása a megjelenítési módtól függően
    initContainer() {
        if (this.config.displayMode === 'toast') {
            this.toastContainer = document.createElement('div');
            this.toastContainer.id = 'unified-message-container';
            this.toastContainer.style.position = 'fixed';
            this.toastContainer.style.zIndex = '9999';
            this.toastContainer.style.maxWidth = this.config.maxWidth;
            
            // Pozicionálás a beállítás alapján
            if (this.config.position.includes('top')) {
                this.toastContainer.style.top = '20px';
            } else {
                this.toastContainer.style.bottom = '20px';
            }
            
            if (this.config.position.includes('right')) {
                this.toastContainer.style.right = '20px';
            } else if (this.config.position.includes('left')) {
                this.toastContainer.style.left = '20px';
            } else {
                this.toastContainer.style.left = '50%';
                this.toastContainer.style.transform = 'translateX(-50%)';
            }
            
            document.body.appendChild(this.toastContainer);
        } else if (this.config.displayMode === 'inline') {
            // Inline mód esetén ellenőrizzük, hogy létezik-e a cél elem
            if (this.config.targetElementId) {
                this.targetElement = document.getElementById(this.config.targetElementId);
                if (!this.targetElement) {
                    console.error(`Cél elem nem található: ${this.config.targetElementId}`);
                    // Ha nincs cél elem, hozzunk létre egyet
                    this.targetElement = document.createElement('div');
                    this.targetElement.id = this.config.targetElementId;
                    document.body.appendChild(this.targetElement);
                }
            } else {
                console.error('Inline módhoz szükséges a targetElementId beállítása');
            }
        } else if (this.config.displayMode === 'fixed') {
            // Fix pozícionálás egy adott elem után/előtt
            this.toastContainer = document.createElement('div');
            this.toastContainer.id = 'unified-message-fixed-container';
            this.toastContainer.style.position = 'relative';
            this.toastContainer.style.zIndex = '999';
            this.toastContainer.style.maxWidth = this.config.maxWidth;
            this.toastContainer.style.margin = '15px auto';
            
            if (this.config.targetSelector) {
                const targetElement = document.querySelector(this.config.targetSelector);
                if (targetElement) {
                    // Ha van megadott szülő elem, akkor ahhoz adjuk hozzá vagy utána szúrjuk be
                    const parentElement = this.config.parentSelector 
                        ? document.querySelector(this.config.parentSelector) 
                        : targetElement.parentElement;
                    
                    if (this.config.position === 'after') {
                        // Az elem után szúrjuk be
                        if (targetElement.nextSibling) {
                            parentElement.insertBefore(this.toastContainer, targetElement.nextSibling);
                        } else {
                            parentElement.appendChild(this.toastContainer);
                        }
                    } else if (this.config.position === 'before') {
                        // Az elem elé szúrjuk be
                        parentElement.insertBefore(this.toastContainer, targetElement);
                    } else {
                        // Alapértelmezetten utána szúrjuk be
                        if (targetElement.nextSibling) {
                            parentElement.insertBefore(this.toastContainer, targetElement.nextSibling);
                        } else {
                            parentElement.appendChild(this.toastContainer);
                        }
                    }
                } else {
                    console.error(`Cél elem nem található a szelektor alapján: ${this.config.targetSelector}`);
                    // Ha nincs cél elem, adjuk hozzá a body-hoz
                    document.body.appendChild(this.toastContainer);
                }
            } else {
                console.error('Fixed módhoz szükséges a targetSelector beállítása');
                // Ha nincs targetSelector, adjuk hozzá a body-hoz
                document.body.appendChild(this.toastContainer);
            }
        }
    }

    // Általános üzenetmegjelenítő metódus
    showMessage(content, type, options = {}) {
        const messageElement = this.createMessageElement(content, type, options);
        
        if (this.config.displayMode === 'toast') {
            this.showToast(messageElement, options.clickToClose !== undefined ? options.clickToClose : this.config.clickToClose);
        } else if (this.config.displayMode === 'inline') {
            this.showInline(messageElement, options.clickToClose !== undefined ? options.clickToClose : this.config.clickToClose);
        } else if (this.config.displayMode === 'fixed') {
            this.showFixed(messageElement, options.clickToClose !== undefined ? options.clickToClose : this.config.clickToClose);
        }
        
        return messageElement; // Visszaadjuk az elemet, ha később szükség lenne rá
    }

    // Üzenetelem létrehozása
    createMessageElement(content, type, options = {}) {
        const message = document.createElement('div');
        message.className = `unified-message unified-message-${type}`;
        
        if (this.config.animations) {
            message.style.opacity = '0';
            message.style.transition = 'opacity 0.3s ease';
        }
        
        // Ha van külön fejléc és tartalom
        if (options.header) {
            message.innerHTML = `
                <div class="unified-message-header">
                    <strong>${options.header}</strong>
                </div>
                <div class="unified-message-body">
                    ${content}
                </div>
            `;
        } else {
            message.innerHTML = content;
        }

        // Ha kattintásra el kell tüntetni, adjunk hozzá egy jelzést
        if (this.config.clickToClose || options.clickToClose) {
            const closeHint = document.createElement('div');
            closeHint.className = 'unified-message-close-hint';
            closeHint.textContent = 'Kattints a bezáráshoz';
            message.appendChild(closeHint);
            
            // Kurzor stílus
            message.style.cursor = 'pointer';
        }
        
        return message;
    }

    // Toast megjelenítése
    showToast(messageElement, clickToClose = false) {
        // Előző toast eltávolítása, ha van
        const existingToast = this.toastContainer.querySelector('.unified-message');
        if (existingToast) {
            existingToast.remove();
        }

        this.toastContainer.appendChild(messageElement);

        // Animáció
        if (this.config.animations) {
            setTimeout(() => {
                messageElement.style.opacity = '1';
            }, 10);
        }

        // Kattintásra eltűntetés
        if (clickToClose) {
            messageElement.addEventListener('click', () => {
                this.hideMessage(messageElement);
            });
        } 
        
        // Időzített eltávolítás, ha nincs kattintásra eltűntetés
        if (!clickToClose && this.config.duration > 0) {
            setTimeout(() => {
                this.hideMessage(messageElement);
            }, this.config.duration);
        }
    }

    // Inline megjelenítés
    showInline(messageElement, clickToClose = false) {
        if (this.targetElement) {
            // Töröljük az előző üzenetet
            this.targetElement.innerHTML = '';
            this.targetElement.appendChild(messageElement);
            
            // Animáció
            if (this.config.animations) {
                setTimeout(() => {
                    messageElement.style.opacity = '1';
                }, 10);
            }
            
            // Kattintásra eltűntetés
            if (clickToClose) {
                messageElement.addEventListener('click', () => {
                    this.hideMessage(messageElement);
                });
            }
            
            // Időzített eltávolítás, ha nincs kattintásra eltűntetés
            if (!clickToClose && this.config.duration > 0) {
                setTimeout(() => {
                    this.hideMessage(messageElement);
                }, this.config.duration);
            }
        }
    }

    // Fix pozíciójú megjelenítés
    showFixed(messageElement, clickToClose = false) {
        if (this.toastContainer) {
            // Töröljük az előző üzenetet
            this.toastContainer.innerHTML = '';
            this.toastContainer.appendChild(messageElement);
            
            // Animáció
            if (this.config.animations) {
                setTimeout(() => {
                    messageElement.style.opacity = '1';
                }, 10);
            }
            
            // Kattintásra eltűntetés
            if (clickToClose) {
                messageElement.addEventListener('click', () => {
                    this.hideMessage(messageElement);
                });
            }
            
            // Időzített eltávolítás, ha nincs kattintásra eltűntetés
            if (!clickToClose && this.config.duration > 0) {
                setTimeout(() => {
                    this.hideMessage(messageElement);
                }, this.config.duration);
            }
        }
    }

    // Üzenet elrejtése
    hideMessage(messageElement) {
        if (this.config.animations) {
            messageElement.style.opacity = '0';
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.remove();
                }
            }, 300);
        } else {
            if (messageElement.parentNode) {
                messageElement.remove();
            }
        }
    }

    // Üzenetek törlése
    clearMessages() {
        if ((this.config.displayMode === 'toast' || this.config.displayMode === 'fixed') && this.toastContainer) {
            this.toastContainer.innerHTML = '';
        } else if (this.config.displayMode === 'inline' && this.targetElement) {
            this.targetElement.innerHTML = '';
        }
    }

    // Specifikus üzenet típusok

    // Sikeres üzenet
    showSuccess(message, details = null, options = {}) {
        let content;
        if (details) {
            content = `
                <div class="alert alert-success mb-0 rounded-bottom-0">
                    <strong>Helyes!</strong> ${message}
                </div>
                <div class="alert alert-info mt-0 border-top-0 rounded-top-0">
                    <div class="mb-2"><strong>Szabály:</strong> ${details.leiras || details}</div>
                    ${details.magyarazat ? `<div class="small">${details.magyarazat}</div>` : ''}
                </div>
            `;
        } else {
            content = `
                <div class="alert alert-success">
                    <strong>Helyes!</strong> ${message}
                </div>
            `;
        }
        
        return this.showMessage(content, 'success', options);
    }

    // Hiba üzenet
    showError(message, details = null, options = {}) {
        let content;
        if (details) {
            content = `
                <div class="alert alert-danger mb-0 rounded-bottom-0">
                    <strong>Hibás!</strong> ${message}
                </div>
                <div class="alert alert-warning mt-0 border-top-0 rounded-top-0">
                    <div class="mb-2"><strong>Segítség:</strong> ${details.leiras || details}</div>
                    ${details.alkalmazas ? `<div class="small">${details.alkalmazas}</div>` : ''}
                </div>
            `;
        } else {
            content = `
                <div class="alert alert-danger">
                    <strong>Hibás!</strong> ${message}
                </div>
            `;
        }
        
        return this.showMessage(content, 'error', options);
    }

    // Figyelmeztető üzenet
    showWarning(message, options = {}) {
        const content = `
            <div class="alert alert-warning">
                ${message}
            </div>
        `;
        
        return this.showMessage(content, 'warning', options);
    }

    // Információs üzenet
    showInfo(message, options = {}) {
        const content = `
            <div class="alert alert-info">
                ${message}
            </div>
        `;
        
        return this.showMessage(content, 'info', options);
    }

    // Kezdeti útmutató (már meglévő)
    showInitialGuide(szorzando, szorzo, options = {}) {
        const content = `
            <div class="toast-content guide">
                <h4>Szorzás lépésről lépésre</h4>
                <p>1. Kezdd az egyes helyiértékkel (${szorzo % 10})</p>
                <p>2. Szorozd be vele a szorzandó számjegyeit (${szorzando})</p>
                <p>3. Írd be a részeredményt jobbról balra haladva</p>
                <p><small>Kattints bárhova a folytatáshoz</small></p>
            </div>
        `;
        
        return this.showMessage(content, 'guide', { ...options, clickToClose: true });
    }

    // Részeredmény üzenet (már meglévő)
    showResultMessage(isCorrect, expectedValue = null, options = {}) {
        const message = isCorrect ? 
            'Helyes részeredmény! 👍' : 
            `Hibás részeredmény. ${expectedValue ? `A helyes érték: ${expectedValue}` : 'Próbáld újra!'}`;
            
        const content = `
            <div class="toast-content ${isCorrect ? 'success' : 'error'}">
                ${message}
            </div>
        `;
        
        return this.showMessage(content, isCorrect ? 'success' : 'error', options);
    }

    // Végeredmény üzenet (már meglévő)
    showFinalResult(isComplete, score = null, options = {}) {
        let message;
        let type;
        
        if (isComplete) {
            message = `
                <h4>Gratulálok! 🎉</h4>
                <p>Sikeresen megoldottad a szorzást!</p>
                ${score ? `<p>Elért pontszám: ${score}</p>` : ''}
                <small>Új feladatért kattints az "Új feladat" gombra</small>
            `;
            type = 'success';
        } else {
            message = `
                <h4>Még nem végeztél</h4>
                <p>Van még kitöltetlen vagy hibás részeredmény</p>
                <small>Ellenőrizd a pirossal jelölt sorokat</small>
            `;
            type = 'warning';
        }
        
        const content = `
            <div class="toast-content ${type}">
                ${message}
            </div>
        `;
        
        return this.showMessage(content, type, options);
    }

    // Következő lépés útmutatója (már meglévő)
    showNextStepGuide(currentRow, options = {}) {
        const content = `
            <div class="toast-content guide">
                <p>Most szorozd be a tízesek helyiértékén álló számmal</p>
                <small>Folytasd jobbról balra a beírást</small>
            </div>
        `;
        
        return this.showMessage(content, 'guide', options);
    }
}

// Singleton példányok különböző konfigurációkkal
const messageHandler = new MessageHandler();

// Az alapértelmezett template szorzás modul üzenetkezelőjeként szolgál
// közvetlenül a szorzás modul alatt, a statisztikák előtt
const szorzasMessageHandler = new MessageHandler({
    displayMode: 'fixed',
    targetSelector: '.feladat-rész',  // A .feladat-container helyett a .feladat-rész használata
    position: 'after',                // A célelem után
    clickToClose: true,               // Kattintásra eltűnik
    duration: 0,                      // Nem tűnik el automatikusan
    maxWidth: '100%'                  // Teljes szélesség
});

// Exportáljuk az osztályt és az alapértelmezett példányokat
export { MessageHandler, messageHandler, szorzasMessageHandler };