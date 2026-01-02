// Pythagoras test JS: copy or override logic as needed for test
function buildPitagoraszTable(size=10) {
    const table = document.getElementById('pitagorasz-tabla');
    if (!table) return;
    table.innerHTML = '';
    table.style.gridTemplateColumns = `repeat(${size+1}, 1fr)`;
    for (let r = 0; r <= size; r++) {
        for (let c = 0; c <= size; c++) {
            const cell = document.createElement('div');
            cell.className = 'grid-item' + ((r === 0 || c === 0) ? ' header-cell' : '');
            cell.dataset.row = r; cell.dataset.col = c;
            cell.textContent = r === 0 && c === 0 ? '' : (r === 0 ? c : (c === 0 ? r : r * c));
            table.appendChild(cell);
        }
    }
}
window.addEventListener('DOMContentLoaded', () => buildPitagoraszTable(10));
