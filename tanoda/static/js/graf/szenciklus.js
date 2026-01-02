// szenciklus.js

document.addEventListener('DOMContentLoaded', function() {
    const xValues = [
        -250000000, -10000, 1750, 1800, 1850, 1900, 1950, 2000, 2020
    ];
    const yValues = [
        1, 2, 3, 5, 10, 50, 200, 1000, 2000
    ];

    const trace = {
        x: xValues,
        y: yValues,
        type: 'scatter',
        mode: 'lines+markers',
        marker: {size: 8, color: '#4ecca3'},
        line: {shape: 'spline', smoothing: 1.3, color: '#4ecca3'},
        name: 'Civilizáció fejlődése'
    };

    const layout = {
        title: 'Az emberi civilizáció fejlődésének felgyorsulása',
        xaxis: {
            title: 'Idő (év)',
            type: 'log',
            autorange: true,
            tickformat: '.0e',
            tickfont: {color: '#39FF14'},
            gridcolor: '#4ecca3'
        },
        yaxis: {
            title: 'Relatív fejlődési sebesség',
            type: 'log',
            autorange: true,
            tickfont: {color: '#39FF14'},
            gridcolor: '#4ecca3'
        },
        plot_bgcolor: '#1a1a2e',
        paper_bgcolor: '#1a1a2e',
        font: {color: '#e0e0e0'},
        showlegend: false
    };

    Plotly.newPlot('szenciklusPlot', [trace], layout);

    initQuiz();
});

function updateAxisType(axis) {
    var update = {};
    update[axis] = {type: document.getElementById(axis + '-scale').value};
    Plotly.relayout('szenciklusPlot', update);
}

function addExplanation() {
    const explanationDiv = document.getElementById('szenciklusExplanation');
    explanationDiv.innerHTML = `
        <h3>Magyarázat</h3>
        <p>Ez a grafikon az emberi civilizáció fejlődésének felgyorsulását mutatja be, különös tekintettel az utóbbi 250 év ipari forradalmára.</p>
        <p>A görbe meredek emelkedése az ipari forradalom kezdetétől (kb. 1750) jól szemlélteti azt az elképzelést, hogy az emberiség fejlődése exponenciálisan felgyorsult a fosszilis energiahordozók intenzív használatával.</p>
        <p>Az elmélet szerint a természet által 250 millió év alatt elraktározott energia felszabadítása révén az emberiség olyan energiabőséghez jutott, ami kb. 2 milliószor gyorsabb fejlődést tett lehetővé.</p>
        <p>Ez a hirtelen gyorsulás számos területen megfigyelhető: technológiai fejlődés, népességnövekedés, gazdasági növekedés, de ugyanakkor a környezeti terhelés növekedése is.</p>
    `;
}

function initQuiz() {
    const quizContainer = document.getElementById('civilizationQuiz');
    if (!quizContainer) return;

    const quizQuestions = [
        {
            question: "Hányszorosára gyorsult fel a civilizációnk működése az ipari forradalom óta?",
            options: ["Kb. 200-szorosára", "Kb. 2000-szeresére", "Kb. 2 000 000-szorosára"],
            correctAnswer: 2,
            explanation: "Az elmélet szerint a természet által 250 millió év alatt elraktározott energia felszabadítása révén az emberiség olyan energiabőséghez jutott, ami kb. 2 milliószor gyorsabb fejlődést tett lehetővé."
        },
        {
            question: "Szerinted ez a felgyorsulás összességében:",
            options: ["Jó, mert elősegíti a fejlődést", "Rossz, mert veszélyezteti a környezetet", "Attól függ, hogyan kezeljük a következményeit"],
            correctAnswer: 2,
            explanation: "Ez egy összetett kérdés. A gyors fejlődés számos előnnyel jár, de jelentős kihívásokat is teremt, különösen környezeti és társadalmi szempontból. A kulcs a fenntartható fejlődés megvalósítása."
        },
        {
            question: "Melyik esemény jelzi az emberi civilizáció felgyorsulásának kezdetét a grafikonon?",
            options: ["A mezőgazdasági forradalom", "Az ipari forradalom", "Az információs forradalom"],
            correctAnswer: 1,
            explanation: "A grafikon az ipari forradalomtól (kb. 1750-től) mutat meredek emelkedést, ami jelzi a civilizáció működésének felgyorsulását."
        }
    ];

    quizQuestions.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'quiz-question mb-4';
        questionDiv.innerHTML = `
            <p class="font-weight-bold">${index + 1}. ${q.question}</p>
            ${q.options.map((option, i) => `
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="question${index}" id="q${index}o${i}" value="${i}">
                    <label class="form-check-label" for="q${index}o${i}">${option}</label>
                </div>
            `).join('')}
            <button class="btn btn-primary mt-2" onclick="checkAnswer(${index})">Ellenőrzés</button>
            <div id="feedback${index}" class="mt-2"></div>
        `;
        quizContainer.appendChild(questionDiv);
    });
}

function checkAnswer(questionIndex) {
    const selectedOption = document.querySelector(`input[name="question${questionIndex}"]:checked`);
    const feedbackDiv = document.getElementById(`feedback${questionIndex}`);
    
    if (!selectedOption) {
        feedbackDiv.innerHTML = '<div class="alert alert-warning">Kérlek, válassz egy opciót!</div>';
        return;
    }

    const quizQuestions = [
        // ... (a fent definiált kérdések) ...
    ];

    const question = quizQuestions[questionIndex];
    const isCorrect = parseInt(selectedOption.value) === question.correctAnswer;

    feedbackDiv.innerHTML = isCorrect 
        ? '<div class="alert alert-success">Helyes válasz!</div>'
        : '<div class="alert alert-danger">Sajnos nem helyes. Próbáld újra!</div>';
    
    feedbackDiv.innerHTML += `<div class="mt-2"><strong>Magyarázat:</strong> ${question.explanation}</div>`;
}