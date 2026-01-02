document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.pitagorasz-container');
    const zoomIn = document.getElementById('zoom-in');
    const zoomOut = document.getElementById('zoom-out');
    const zoomReset = document.getElementById('zoom-reset');
    
    let currentScale = 1;
    
    function setZoom(scale) {
        currentScale = scale;
        container.style.transform = `scale(${scale})`;
    }
    
    zoomIn.addEventListener('click', () => {
        setZoom(currentScale + 0.1);
    });
    
    zoomOut.addEventListener('click', () => {
        setZoom(Math.max(0.5, currentScale - 0.1));
    });
    
    zoomReset.addEventListener('click', () => {
        setZoom(1);
    });
    
    // Pinch zoom kezelése érintőképernyőkön
    let initialDistance = 0;
    container.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            initialDistance = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            );
        }
    });
    
    container.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2) {
            const currentDistance = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            );
            const scale = currentScale * (currentDistance / initialDistance);
            setZoom(Math.min(Math.max(0.5, scale), 3));
            initialDistance = currentDistance;
        }
    });
    
    // Pitagorasz táblázat generálása
    const grid = document.getElementById('pitagorasz-grid');
    let html = '<div class="grid-item header">X</div>';
    
    for (let i = 1; i <= 10; i++) {
        html += `<div class="grid-item header">${i}</div>`;
    }
    
    for (let i = 1; i <= 10; i++) {
        html += `<div class="grid-item header">${i}</div>`;
        for (let j = 1; j <= 10; j++) {
            const isPrimary = i === j ? 'primary' : '';
            html += `<div class="grid-item ${isPrimary}">${i * j}</div>`;
        }
    }
    
    grid.innerHTML = html;
});