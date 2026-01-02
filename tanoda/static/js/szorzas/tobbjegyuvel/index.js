/**
 * Entry point for the tobbjegyuvel module
 * This file exports all the necessary components for the module
 */

import { CustomTaskHandler, setupCustomTaskButton } from './sajat.js';
// Import from the new local path
import { initHelyiertekMatrix } from './szorz_hely_matrix.js';

// Re-export all components
export {
    CustomTaskHandler,
    setupCustomTaskButton,
    initHelyiertekMatrix
};

/**
 * Initialize the custom task module with a matrix instance
 * @param {Object} matrixInstance - The HelyiertekMatrix instance
 * @returns {boolean} - Whether initialization was successful
 */
export function initializeCustomTaskModule(matrixInstance) {
    // If no matrix instance is provided, try to get it from the window
    if (!matrixInstance && window.helyiertekMatrix) {
        matrixInstance = window.helyiertekMatrix;
    }
    
    if (matrixInstance) {
        // Set up the custom task button
        matrixInstance.customHandler = setupCustomTaskButton(matrixInstance);
        return true;
    } else {
        console.error("No matrix instance found. Make sure to initialize HelyiertekMatrix first.");
        return false;
    }
}

// For backward compatibility
window.initTobbjegyuvel = initializeCustomTaskModule;
