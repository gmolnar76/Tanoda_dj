// Globális változók
let populationData = [];
let chart;

function createWorldPopulationPlot(element, startYear = 1950, endYear = 2100) {
    populationData = [
        {
            name: 'Afrika',
            x: [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020, 2030, 2040, 2050, 2060, 2070, 2080, 2090, 2100],
            y: [0.23, 0.28, 0.36, 0.48, 0.63, 0.81, 1.04, 1.34, 1.69, 2.08, 2.48, 2.87, 3.25, 3.58, 3.86, 4.08],
            stackgroup: 'one',
            fillcolor: 'rgba(78, 78, 78, 0.7)',  // 70% átlátszó szürke
            line: {width: 0}
        },
        {
            name: 'Ázsia',
            x: [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020, 2030, 2040, 2050, 2060, 2070, 2080, 2090, 2100],
            y: [1.40, 1.70, 2.13, 2.63, 3.21, 3.71, 4.17, 4.54, 4.82, 5.01, 5.11, 5.13, 5.06, 4.92, 4.74, 4.54],
            stackgroup: 'one',
            fillcolor: 'rgba(255, 215, 0, 0.7)',  // 70% átlátszó arany
            line: {width: 0}
        },
        {
            name: 'Európa',
            x: [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020, 2030, 2040, 2050, 2060, 2070, 2080, 2090, 2100],
            y: [0.55, 0.61, 0.66, 0.69, 0.72, 0.73, 0.74, 0.74, 0.73, 0.72, 0.71, 0.69, 0.68, 0.67, 0.66, 0.65],
            stackgroup: 'one',
            fillcolor: '#4169E1',
            line: {width: 0}
        },
        {
            name: 'Észak-Amerika',
            x: [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020, 2030, 2040, 2050, 2060, 2070, 2080, 2090, 2100],
            y: [0.17, 0.20, 0.23, 0.25, 0.28, 0.31, 0.34, 0.37, 0.39, 0.41, 0.43, 0.44, 0.45, 0.46, 0.47, 0.48],
            stackgroup: 'one',
            fillcolor: '#DC143C',
            line: {width: 0}
        },
        {
            name: 'Dél- és Közép-Amerika',
            x: [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020, 2030, 2040, 2050, 2060, 2070, 2080, 2090, 2100],
            y: [0.17, 0.22, 0.29, 0.36, 0.44, 0.52, 0.59, 0.65, 0.70, 0.73, 0.75, 0.76, 0.76, 0.75, 0.73, 0.71],
            stackgroup: 'one',
            fillcolor: '#32CD32',
            line: {width: 0}
        },
        {
            name: 'Ausztrália és Óceánia',
            x: [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020, 2030, 2040, 2050, 2060, 2070, 2080, 2090, 2100],
            y: [0.01, 0.02, 0.02, 0.02, 0.03, 0.03, 0.04, 0.04, 0.05, 0.05, 0.06, 0.06, 0.06, 0.07, 0.07, 0.07],
            stackgroup: 'one',
            fillcolor: '#8B4513',
            line: {width: 0}
        }
    ];

    const layout = {
        title: {
            text: 'A világ népessége régiók szerint 1950-2010 (tény)<br>2011-2100 (2010. évi ENSZ előreszámítás, közepes változat)',
            font: {
                size: 14,
                color: '#e0e0e0'
            }
        },
        xaxis: { 
            title: '',
            range: [startYear, endYear],
            tickmode: 'linear',
            dtick: 10,
            tickfont: {
                size: 10,
                color: '#39FF14'
            },
            linecolor: '#39FF14',
            linewidth: 2,
            tickcolor: '#39FF14',
            tickwidth: 2,
            gridcolor: '#4ecca3',
            gridwidth: 1,
            zerolinecolor: '#39FF14',
            zerolinewidth: 2
        },
        yaxis: { 
            title: {
                text: 'Milliárd fő',
                font: {
                    size: 12,
                    color: '#39FF14'
                }
            },
            range: [0, 12],
            tickformat: 'd',
            tickfont: {
                size: 10,
                color: '#39FF14'
            },
            linecolor: '#39FF14',
            linewidth: 2,
            tickcolor: '#39FF14',
            tickwidth: 2,
            gridcolor: '#4ecca3',
            gridwidth: 1,
            zerolinecolor: '#39FF14',
            zerolinewidth: 2
        },
        legend: {
            orientation: 'h',
            yanchor: 'bottom',
            y: -0.3,
            xanchor: 'center',
            x: 0.5,
            font: {
                size: 10,
                color: '#e0e0e0'
            },
            bgcolor: 'rgba(0,0,0,0)',
            bordercolor: '#39FF14'
        },
        showlegend: true,
        hovermode: 'closest',
        plot_bgcolor: 'rgba(0,0,0,0)',
        paper_bgcolor: 'rgba(0,0,0,0)',
        font: {
            family: 'Arial, sans-serif',
            color: '#e0e0e0'
        },
        margin: {t: 60, b: 100, l: 60, r: 20},
        autosize: true
    };

    const config = {
        displayModeBar: false,
        responsive: true
    };

    Plotly.newPlot(element, populationData, layout, config).then(gd => {
        chart = gd;
        addInteractiveFeatures(gd);
    });
}

function addInteractiveFeatures(gd) {
    gd.on('plotly_click', function(data) {
        const point = data.points[0];
        const region = point.data.name;
        const year = point.x;
        const population = point.y;
        updateQuizByRegionAndYear(region, year, population);
    });

    // Időszak kijelölés hozzáadása
    const rangeSelector = document.createElement('div');
    rangeSelector.innerHTML = `
        <input type="range" id="time-range-selector" min="1950" max="2100" step="10" value="2020">
        <span id="selected-year">2020</span>
    `;
    gd.parentElement.appendChild(rangeSelector);

    document.getElementById('time-range-selector').addEventListener('input', function(e) {
        const selectedYear = parseInt(e.target.value);
        document.getElementById('selected-year').textContent = selectedYear;
        updateChartByYear(selectedYear);
    });
}

function updateChartByYear(year) {
    Plotly.relayout(chart, {
        'xaxis.range': [1950, year]
    });
    updateQuizByYear(year);
}

function updateQuizByRegionAndYear(region, year, population) {
    // Itt generálhatunk és frissíthetünk kvíz kérdéseket a kiválasztott régió és év alapján
    console.log(`Kiválasztott régió: ${region}, Év: ${year}, Népesség: ${population.toFixed(2)} milliárd`);
    // Példa kvíz kérdés generálása:
    const quizQuestion = `Mennyi volt ${region} népessége ${year}-ben?`;
    const quizAnswer = `${population.toFixed(2)} milliárd`;
    updateQuizContainer(quizQuestion, quizAnswer);
}

function updateQuizByYear(year) {
    // Itt generálhatunk és frissíthetünk kvíz kérdéseket a kiválasztott év alapján
    console.log(`Kiválasztott év: ${year}`);
    // Példa kvíz kérdés generálása:
    const totalPopulation = getTotalPopulationForYear(year);
    const quizQuestion = `Mennyi volt a világ össznépessége ${year}-ben?`;
    const quizAnswer = `${totalPopulation.toFixed(2)} milliárd`;
    updateQuizContainer(quizQuestion, quizAnswer);
}

function updateQuizContainer(question, answer) {
    const quizContainer = document.getElementById('quiz-container');
    quizContainer.innerHTML = `
        <p><strong>Kérdés:</strong> ${question}</p>
        <input type="text" id="quiz-answer" class="form-control" placeholder="Add meg a választ">
        <button onclick="checkQuizAnswer('${answer}')" class="btn btn-primary mt-2">Ellenőrzés</button>
        <div id="quiz-feedback" class="mt-2"></div>
    `;
}

function checkQuizAnswer(correctAnswer) {
    const userAnswer = document.getElementById('quiz-answer').value;
    const feedback = document.getElementById('quiz-feedback');
    if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
        feedback.innerHTML = '<div class="alert alert-success">Helyes válasz!</div>';
    } else {
        feedback.innerHTML = `<div class="alert alert-danger">Sajnos nem helyes. A helyes válasz: ${correctAnswer}</div>`;
    }
}

function updateChart() {
    const startYear = parseInt(document.getElementById('start-year').value);
    const endYear = parseInt(document.getElementById('end-year').value);

    if (startYear > endYear) {
        alert('A kezdő év nem lehet nagyobb, mint a végző év!');
        return;
    }

    Plotly.relayout('world-population-graph', {
        'xaxis.range': [startYear, endYear]
    });
}

function runQuery() {
    const queryType = document.getElementById('query-type').value;
    const startYear = parseInt(document.getElementById('start-year').value);
    const endYear = parseInt(document.getElementById('end-year').value);
    let result = 0;

    switch(queryType) {
        case 'total-growth':
            result = calculateTotalGrowth(startYear, endYear);
            break;
        case 'average-growth-rate':
            result = calculateAverageGrowthRate(startYear, endYear);
            break;
        case 'total-population':
            result = calculateTotalPopulation(endYear);
            break;
        case 'projected-population-2100':
            result = calculateTotalPopulation(2100);
            break;
    }

    displayQueryResult(queryType, result);
}

function calculateTotalGrowth(startYear, endYear) {
    const startPopulation = getTotalPopulationForYear(startYear);
    const endPopulation = getTotalPopulationForYear(endYear);
    return endPopulation - startPopulation;
}

function calculateAverageGrowthRate(startYear, endYear) {
    const startPopulation = getTotalPopulationForYear(startYear);
    const endPopulation = getTotalPopulationForYear(endYear);
    const years = endYear - startYear;
    return Math.pow(endPopulation / startPopulation, 1/years) - 1;
}

function calculateTotalPopulation(year) {
    return getTotalPopulationForYear(year);
}

function getTotalPopulationForYear(year) {
    let total = 0;
    populationData.forEach(region => {
        const index = region.x.indexOf(year);
        if (index !== -1) {
            total += region.y[index];
        }
    });
    return total;
}

function displayQueryResult(queryType, result) {
    const resultDiv = document.getElementById('query-result');
    let formattedResult = '';

    switch(queryType) {
        case 'total-growth':
            formattedResult = `Teljes növekedés: ${result.toFixed(2)} milliárd fő`;
            break;
        case 'average-growth-rate':
            formattedResult = `Átlagos éves növekedési ráta: ${(result * 100).toFixed(2)}%`;
            break;
        case 'total-population':
        case 'projected-population-2100':
            formattedResult = `Népesség: ${result.toFixed(2)} milliárd fő`;
            break;
    }

    resultDiv.innerHTML = formattedResult;
}

// Inicializálás és ablakméret-változás kezelése
function initializeAndResizeChart() {
    const populationGraph = document.getElementById('world-population-graph');
    if (!populationGraph) {
        console.error('Population graph element not found');
        return;
    }

    const containerWidth = populationGraph.offsetWidth;
    const containerHeight = Math.max(400, window.innerHeight * 0.7); // Minimum 400px magasság

    if (!chart) {
        createWorldPopulationPlot('world-population-graph');
    }

    Plotly.relayout('world-population-graph', {
        width: containerWidth,
        height: containerHeight
    });

    setupEventListeners();
}

function setupEventListeners() {
    // Frissítés gomb
    const updateChartBtn = document.getElementById('update-chart');
    if (updateChartBtn) {
        updateChartBtn.addEventListener('click', updateChart);
    }

    // Lekérdezés futtatása gomb
    const runQueryBtn = document.getElementById('run-query');
    if (runQueryBtn) {
        runQueryBtn.addEventListener('click', runQuery);
    }

    // Időszak választó
    const timeRangeSelector = document.getElementById('time-range-selector');
    if (timeRangeSelector) {
        timeRangeSelector.addEventListener('input', function(e) {
            const selectedYear = parseInt(e.target.value);
            const selectedYearDisplay = document.getElementById('selected-year');
            if (selectedYearDisplay) {
                selectedYearDisplay.textContent = selectedYear;
            }
            updateChartByYear(selectedYear);
        });
    }

    // Régió kattintás eseménykezelő
    if (chart) {
        chart.on('plotly_click', function(data) {
            if (data.points && data.points.length > 0) {
                const point = data.points[0];
                const region = point.data.name;
                const year = point.x;
                const population = point.y;
                updateQuizByRegionAndYear(region, year, population);
            }
        });
    }

    // Visszajelzés ikonok
    setupFeedbackIcons();
}

function setupFeedbackIcons() {
    const likeIcon = document.getElementById('like-icon');
    const dislikeIcon = document.getElementById('dislike-icon');
    if (likeIcon && dislikeIcon) {
        likeIcon.addEventListener('click', () => handleFeedback(true));
        dislikeIcon.addEventListener('click', () => handleFeedback(false));
    }
}

// Lazy loading: csak akkor inicializáljuk, amikor szükséges
function lazyInitializeChart() {
    const populationTab = document.getElementById('population-tab');
    if (populationTab && populationTab.classList.contains('active')) {
        initializeAndResizeChart();
    }
}



// DOM betöltődés után inicializálás
document.addEventListener('DOMContentLoaded', function() {
    lazyInitializeChart();
    
    // Tab váltás kezelése
    const tabButtons = document.querySelectorAll('#myTab button');
    tabButtons.forEach(button => {
        button.addEventListener('shown.bs.tab', function (event) {
            if (event.target.id === 'population-tab') {
                lazyInitializeChart();
            }
        });
    });
});

// Ablak átméretezés kezelése, debounce funkcióval
let resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        lazyInitializeChart();
    }, 250);
});