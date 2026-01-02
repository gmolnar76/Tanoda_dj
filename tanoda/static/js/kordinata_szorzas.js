document.addEventListener('DOMContentLoaded', function() {
    let szorzo2D, szorzando2D, szorzo3D1, szorzo3D2, szorzo3D3;
    let isNegativeProduct2D = false;
    let canvas2D, ctx2D;

    function initGraphs() {
        const plot2DContainer = document.getElementById('plotly-2d-graph');
        const plot3DContainer = document.getElementById('plotly-3d-graph');

        if (plot2DContainer) {
            // Replace Plotly with Canvas for 2D
            plot2DContainer.innerHTML = '<canvas id="canvas-2d-graph" width="400" height="400"></canvas>';
            canvas2D = document.getElementById('canvas-2d-graph');
            ctx2D = canvas2D.getContext('2d');
            updatePlot2D();
        } else {
            console.warn("2D plot container not found");
        }

        if (plot3DContainer) {
            // Replace Plotly with CSS 3D for 3D
            plot3DContainer.innerHTML = `
                <div id="css-3d-container" style="width: 100%; height: 400px; position: relative; perspective: 1000px;">
                    <div id="css-3d-cube" style="width: 100%; height: 100%; position: relative; transform-style: preserve-3d;">
                        <div id="cuboid-container" style="width: 100%; height: 100%; position: absolute; transform-style: preserve-3d; transform: rotateX(-20deg) rotateY(-30deg);">
                        </div>
                    </div>
                </div>
            `;
            updatePlot3D();
        } else {
            console.warn("3D plot container not found");
        }
    }

    function generateRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function updatePlotLayouts() {
        const width = window.innerWidth;
        
        if (canvas2D) {
            // Set canvas size based on container width
            const container = document.getElementById('plotly-2d-graph');
            const containerWidth = container.offsetWidth;
            canvas2D.width = containerWidth;
            canvas2D.height = containerWidth * 0.75;
            updatePlot2D(); // Redraw on resize
        }
        
        // Update 3D container size if needed
        const container3D = document.getElementById('css-3d-container');
        if (container3D) {
            const containerWidth = document.getElementById('plotly-3d-graph').offsetWidth;
            container3D.style.height = containerWidth * 0.75 + 'px';
        }
    }

    function updatePlot2D() {
        szorzo2D = generateRandomNumber(-10, 10);
        szorzando2D = generateRandomNumber(-10, 10);
        isNegativeProduct2D = (szorzo2D * szorzando2D) < 0;
        
        document.getElementById('szorzo-2d').textContent = szorzo2D;
        document.getElementById('szorzando-2d').textContent = szorzando2D;

        let maxAbsValue = Math.max(Math.abs(szorzo2D), Math.abs(szorzando2D), 10);
        
        // Draw 2D graph using canvas
        drawCoordinateSystem2D(ctx2D, canvas2D, maxAbsValue);
        drawRectangle2D(ctx2D, canvas2D, szorzo2D, szorzando2D, maxAbsValue);
    }

    function drawCoordinateSystem2D(ctx, canvas, maxValue) {
        const padding = 40;
        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const scale = (Math.min(width, height) - padding * 2) / (2 * maxValue);
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Background
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, width, height);
        
        // Grid lines
        ctx.strokeStyle = '#4ecca3';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        
        // Draw grid
        for (let i = -maxValue; i <= maxValue; i += 2) {
            if (i === 0) continue; // Skip center lines as they'll be drawn separately
            
            const x = centerX + i * scale;
            const y = centerY + i * scale;
            
            // Vertical grid line
            ctx.moveTo(x, padding);
            ctx.lineTo(x, height - padding);
            
            // Horizontal grid line
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
        }
        
        ctx.stroke();
        
        // Draw axes
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        // X-axis
        ctx.moveTo(padding, centerY);
        ctx.lineTo(width - padding, centerY);
        
        // Y-axis
        ctx.moveTo(centerX, padding);
        ctx.lineTo(centerX, height - padding);
        
        ctx.stroke();
        
        // Draw axis ticks and numbers
        ctx.fillStyle = '#e0e0e0';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        for (let i = -maxValue; i <= maxValue; i += 2) {
            if (i === 0) continue; // Skip zero
            
            const x = centerX + i * scale;
            const y = centerY + i * scale;
            
            // X-axis ticks and numbers
            ctx.fillText(i.toString(), x, centerY + 15);
            
            // Y-axis ticks and numbers
            ctx.fillText(i.toString(), centerX - 15, y);
        }
        
        // Draw zero
        ctx.fillText('0', centerX - 15, centerY + 15);
    }

    function drawRectangle2D(ctx, canvas, szorzoX, szorzandoY, maxValue) {
        const padding = 40;
        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const scale = (Math.min(width, height) - padding * 2) / (2 * maxValue);
        
        // Calculate rectangle coordinates
        const x0 = centerX; // Origin (0,0)
        const y0 = centerY;
        const x1 = centerX + szorzoX * scale; // Right side of rectangle
        const y1 = centerY - szorzandoY * scale; // Top side of rectangle (y-axis inverted in canvas)
        
        // Draw filled rectangle
        ctx.fillStyle = 'rgba(78, 204, 163, 0.3)';
        ctx.strokeStyle = '#4ecca3';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(x0, y0); // Start at origin
        ctx.lineTo(x1, y0); // Go right to (szorzoX, 0)
        ctx.lineTo(x1, y1); // Go up to (szorzoX, szorzandoY)
        ctx.lineTo(x0, y1); // Go left to (0, szorzandoY)
        ctx.closePath();
        
        ctx.fill();
        ctx.stroke();
        
        // Add text in the middle
        const midX = (x0 + x1) / 2;
        const midY = (y0 + y1) / 2;
        
        ctx.fillStyle = '#e0e0e0';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${szorzoX} * ${szorzandoY} = ?`, midX, midY);
        
        // If negative product, draw additional visual explanation
        if (isNegativeProduct2D) {
            ctx.fillStyle = 'rgba(255, 99, 71, 0.3)';
            ctx.strokeStyle = '#ff6347';
            
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x0 + Math.abs(szorzoX) * scale, y0);
            ctx.lineTo(x0 + Math.abs(szorzoX) * scale, y0 - Math.abs(szorzandoY) * scale);
            ctx.lineTo(x0, y0 - Math.abs(szorzandoY) * scale);
            ctx.closePath();
            
            ctx.fill();
            ctx.stroke();
        }
    }

    function updatePlot3D() {
        szorzo3D1 = generateRandomNumber(1, 10);
        szorzo3D2 = generateRandomNumber(1, 10);
        szorzo3D3 = generateRandomNumber(1, 10);
        document.getElementById('szorzo-3d-1').textContent = szorzo3D1;
        document.getElementById('szorzo-3d-2').textContent = szorzo3D2;
        document.getElementById('szorzo-3d-3').textContent = szorzo3D3;
    
        const container = document.getElementById('cuboid-container');
        container.innerHTML = ''; // Clear previous content
        
        const maxValue = Math.max(szorzo3D1, szorzo3D2, szorzo3D3, 10) * 1.2;
        const scale = 20; // Scale factor for CSS units
        
        // Create cuboid using faces
        const faces = [
            { // Front face
                transform: `translateZ(${szorzo3D3 * scale/2}px)`,
                width: `${szorzo3D1 * scale}px`,
                height: `${szorzo3D2 * scale}px`,
                background: 'rgba(78, 204, 163, 0.5)',
                border: '1px solid #4ecca3'
            },
            { // Back face
                transform: `translateZ(${-szorzo3D3 * scale/2}px)`,
                width: `${szorzo3D1 * scale}px`,
                height: `${szorzo3D2 * scale}px`,
                background: 'rgba(78, 204, 163, 0.5)',
                border: '1px solid #4ecca3'
            },
            { // Top face
                transform: `rotateX(90deg) translateZ(${szorzo3D2 * scale/2}px)`,
                width: `${szorzo3D1 * scale}px`,
                height: `${szorzo3D3 * scale}px`,
                background: 'rgba(78, 204, 163, 0.5)',
                border: '1px solid #4ecca3'
            },
            { // Bottom face
                transform: `rotateX(-90deg) translateZ(${szorzo3D2 * scale/2}px)`,
                width: `${szorzo3D1 * scale}px`,
                height: `${szorzo3D3 * scale}px`,
                background: 'rgba(78, 204, 163, 0.5)',
                border: '1px solid #4ecca3'
            },
            { // Right face
                transform: `rotateY(90deg) translateZ(${szorzo3D1 * scale/2}px)`,
                width: `${szorzo3D3 * scale}px`,
                height: `${szorzo3D2 * scale}px`,
                background: 'rgba(78, 204, 163, 0.5)',
                border: '1px solid #4ecca3'
            },
            { // Left face
                transform: `rotateY(-90deg) translateZ(${szorzo3D1 * scale/2}px)`,
                width: `${szorzo3D3 * scale}px`,
                height: `${szorzo3D2 * scale}px`,
                background: 'rgba(78, 204, 163, 0.5)',
                border: '1px solid #4ecca3'
            }
        ];
        
        // Create axes
        const axes = [
            { // X axis
                transform: `translateX(${szorzo3D1 * scale/2}px)`,
                width: `${szorzo3D1 * scale}px`,
                height: '2px',
                background: 'red',
                label: 'X'
            },
            { // Y axis
                transform: `rotateZ(90deg) translateX(${szorzo3D2 * scale/2}px)`,
                width: `${szorzo3D2 * scale}px`,
                height: '2px',
                background: 'green',
                label: 'Y'
            },
            { // Z axis
                transform: `rotateY(90deg) translateX(${szorzo3D3 * scale/2}px)`,
                width: `${szorzo3D3 * scale}px`,
                height: '2px',
                background: 'blue',
                label: 'Z'
            }
        ];
        
        // Add cuboid faces to the container
        faces.forEach((face, index) => {
            const faceElement = document.createElement('div');
            Object.assign(faceElement.style, {
                position: 'absolute',
                width: face.width,
                height: face.height,
                background: face.background,
                border: face.border,
                transform: face.transform,
                transformOrigin: 'center',
                backfaceVisibility: 'visible',
                left: `calc(50% - ${parseInt(face.width)/2}px)`,
                top: `calc(50% - ${parseInt(face.height)/2}px)`
            });
            container.appendChild(faceElement);
        });
        
        // Add axes to the container
        axes.forEach((axis, index) => {
            const axisElement = document.createElement('div');
            Object.assign(axisElement.style, {
                position: 'absolute',
                width: axis.width,
                height: axis.height,
                background: axis.background,
                transform: axis.transform,
                transformOrigin: 'left',
                left: '50%',
                top: '50%'
            });
            
            // Add label to axis
            const labelElement = document.createElement('div');
            Object.assign(labelElement.style, {
                position: 'absolute',
                color: axis.background,
                right: '-15px',
                top: '-10px',
                fontWeight: 'bold'
            });
            labelElement.textContent = axis.label;
            axisElement.appendChild(labelElement);
            
            container.appendChild(axisElement);
        });
        
        // Add volume formula text
        const textElement = document.createElement('div');
        Object.assign(textElement.style, {
            position: 'absolute',
            color: '#e0e0e0',
            background: 'rgba(0,0,0,0.7)',
            padding: '5px',
            borderRadius: '3px',
            bottom: '10px',
            right: '10px'
        });
        textElement.textContent = `${szorzo3D1} × ${szorzo3D2} × ${szorzo3D3} = ?`;
        container.parentElement.appendChild(textElement);
        
        // Make the 3D shape rotatable
        makeCuboidRotatable();
    }

    function makeCuboidRotatable() {
        const cube = document.getElementById('css-3d-cube');
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        let rotation = { x: -20, y: -30 };
        
        // Set initial rotation
        updateCuboidRotation();
        
        function updateCuboidRotation() {
            const container = document.getElementById('cuboid-container');
            container.style.transform = `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`;
        }
        
        cube.addEventListener('mousedown', (e) => {
            isDragging = true;
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaMove = {
                x: e.clientX - previousMousePosition.x,
                y: e.clientY - previousMousePosition.y
            };
            
            rotation.y += deltaMove.x * 0.5;
            rotation.x += deltaMove.y * 0.5;
            
            updateCuboidRotation();
            
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        // Add touch support for mobile
        cube.addEventListener('touchstart', (e) => {
            isDragging = true;
            previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            e.preventDefault();
        });
        
        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            const deltaMove = {
                x: e.touches[0].clientX - previousMousePosition.x,
                y: e.touches[0].clientY - previousMousePosition.y
            };
            
            rotation.y += deltaMove.x * 0.5;
            rotation.x += deltaMove.y * 0.5;
            
            updateCuboidRotation();
            
            previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            e.preventDefault();
        });
        
        document.addEventListener('touchend', () => {
            isDragging = false;
        });
    }

    function checkAnswer(inputId, resultDivId, correctAnswer, updateFunction) {
        let valasz = parseInt(document.getElementById(inputId).value);
        let eredmenyDiv = document.getElementById(resultDivId);
        if (valasz === correctAnswer) {
            let magyarazat = isNegativeProduct2D ?
                "Helyes! Két különböző előjelű szám szorzata negatív." :
                "Helyes! Két azonos előjelű szám szorzata pozitív.";
            eredmenyDiv.innerHTML = `<strong>Gratulálunk!</strong> ${magyarazat}<br>
                                     <em>Szabály: Két azonos előjelű szám szorzata pozitív, 
                                     két különböző előjelű szám szorzata negatív lesz.</em>`;
            eredmenyDiv.className = 'alert alert-success mt-2';
            document.getElementById(inputId).value = '';
            setTimeout(updateFunction, 3000);
        } else {
            if (isNegativeProduct2D && valasz === Math.abs(correctAnswer)) {
                eredmenyDiv.innerHTML = `<strong>Majdnem!</strong> De ne feledd, két különböző előjelű szám szorzata negatív.<br>
                                         A helyes válasz: ${correctAnswer}<br>
                                         <em>Szabály: Két azonos előjelű szám szorzata pozitív, 
                                         két különböző előjelű szám szorzata negatív lesz.</em>`;
                eredmenyDiv.className = 'alert alert-warning mt-2';
            } else {
                eredmenyDiv.innerHTML = `<strong>Helytelen.</strong> A helyes válasz: ${correctAnswer}<br>
                                         <em>Szabály: Két azonos előjelű szám szorzata pozitív, 
                                         két különböző előjelű szám szorzata negatív lesz.</em>`;
                eredmenyDiv.className = 'alert alert-danger mt-2';
            }
        }
        eredmenyDiv.style.display = 'block';
    }

    function check2D() {
        checkAnswer('valasz-2d', 'eredmeny-2d', szorzo2D * szorzando2D, updatePlot2D);
    }

    function check3D() {
        checkAnswer('valasz-3d', 'eredmeny-3d', szorzo3D1 * szorzo3D2 * szorzo3D3, updatePlot3D);
    }

    function setupInputHandling(inputId, checkFunction) {
        const input = document.getElementById(inputId);
        const yinYangButton = document.getElementById('ellenorzes-' + inputId.split('-')[1]);

        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                checkFunction();
            }
        });

        yinYangButton.addEventListener('click', checkFunction);
    }

    // Handle window resize
    window.addEventListener('resize', updatePlotLayouts);

    // Inicializálás
    initGraphs();

    // Input kezelés beállítása
    setupInputHandling('valasz-2d', check2D);
    setupInputHandling('valasz-3d', check3D);
});