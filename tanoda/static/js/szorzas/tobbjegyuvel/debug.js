/**
 * Debug utility for HelyiertekMatrix
 */

export function debugMatrix(matrixInstance) {
    if (!matrixInstance || !matrixInstance.container) {
        console.error("Matrix instance or container not found");
        return;
    }
    
    // Count actual rows and columns in the DOM
    const cells = matrixInstance.container.querySelectorAll('.matrix-cell');
    
    // Get max row and column from data attributes
    let maxRow = 0;
    let maxCol = 0;
    
    cells.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        if (!isNaN(row) && row > maxRow) maxRow = row;
        if (!isNaN(col) && col > maxCol) maxCol = col;
    });
    
    // Add 1 because indices are zero-based
    const actualRows = maxRow + 1;
    const actualCols = maxCol + 1;
    
    // Get configured dimensions
    const configRows = matrixInstance.matrixSize.rows;
    const configCols = matrixInstance.matrixSize.cols;
    
    console.log("==== Matrix Dimensions ====");
    console.log(`Configured: ${configRows} rows × ${configCols} columns`);
    console.log(`Actual DOM: ${actualRows} rows × ${actualCols} columns`);
    
    // Verify if number of cells matches the expected count
    const expectedCellCount = configRows * configCols;
    const actualCellCount = cells.length;
    
    console.log(`Expected cells: ${expectedCellCount}`);
    console.log(`Actual cells: ${actualCellCount}`);
    
    if (expectedCellCount !== actualCellCount) {
        console.warn("Mismatch between expected and actual cell count!");
    }
    
    return {
        configured: { rows: configRows, cols: configCols },
        actual: { rows: actualRows, cols: actualCols },
        cellCount: { expected: expectedCellCount, actual: actualCellCount }
    };
}
