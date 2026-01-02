document.addEventListener('DOMContentLoaded', function() {
    const graphContainer = document.querySelector('.graph-container');

    function adjustLayout() {
        // Ellenőrizzük, hogy léteznek-e a grafikonok az oldalon
        if (document.getElementById('plotly-2d-graph')) {
            Plotly.relayout('plotly-2d-graph', {
                autosize: true
            });
        }
        
        if (document.getElementById('plotly-3d-graph')) {
            Plotly.relayout('plotly-3d-graph', {
                autosize: true
            });
        }
    }

    // Canvas willReadFrequently beállítása
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeName === 'CANVAS') {
                        node.willReadFrequently = true;
                    }
                });
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    window.addEventListener('resize', adjustLayout);

    adjustLayout(); // Kezdeti beállítás
});