// static/js/population_quiz.js

const quizQuestions = [
    {
        question: "Mennyivel nőtt a Föld lakóinak száma 1960 és 2020 között?",
        answer: "4.71",
        explanation: "A világ népessége 1960-ban 3.03 milliárd, 2020-ban 7.74 milliárd volt. A növekedés 7.74 - 3.03 = 4.71 milliárd."
    },
    {
        question: "Arányaiban(!) melyik kontinens népessége nőtt a leggyorsabban 1960 és 2020 között?",
        answer: "Afrika",
        explanation: "Afrika népessége nőtt a leggyorsabban, több mint ötszörösére az 1960-as értéknek."
    },
    {
        question: "Körülbelül hány milliárd ember élt a Földön 1990-ben?",
        answer: "5.32 milliárd",
        explanation: "A grafikon szerint 1990-ben a világ népessége körülbelül 5.32 milliárd volt."
    },
    {
        question: "Melyik kontinensen éltek a legkevesebben 2020-ban?",
        answer: "Ausztrália és Óceánia",
        explanation: "A grafikon alapján Ausztrália és Óceánia népessége a legalacsonyabb, körülbelül 0.43 milliárd 2020-ban."
    }
];

function initQuiz() {
    const quizContainer = document.getElementById('quiz-container');
    if (!quizContainer) {
        console.error('Quiz container not found!');
        return;
    }

    quizQuestions.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question mb-3';
        questionDiv.innerHTML = `
            <p>${index + 1}. ${q.question}</p>
            <input type="text" class="form-control" id="answer${index}">
            <button class="btn btn-primary mt-2" onclick="checkAnswer(${index})">Ellenőrzés</button>
            <div id="feedback${index}" class="mt-2"></div>
        `;
        quizContainer.appendChild(questionDiv);
    });
}

function checkAnswer(index) {
    const userAnswer = document.getElementById(`answer${index}`).value.toLowerCase();
    const feedback = document.getElementById(`feedback${index}`);
    const correctAnswer = quizQuestions[index].answer.toLowerCase();
    
    if (userAnswer === correctAnswer) {
        feedback.innerHTML = '<div class="alert alert-success">Helyes válasz!</div>';
    } else {
        feedback.innerHTML = `<div class="alert alert-danger">
            Sajnos nem helyes. A helyes válasz: ${quizQuestions[index].answer}<br>
            ${quizQuestions[index].explanation}
        </div>`;
    }
}

// Várjuk meg, amíg a DOM teljesen betöltődik
document.addEventListener('DOMContentLoaded', function() {
    const populationTab = document.getElementById('population-tab');
    const quizContainer = document.getElementById('quiz-container');
    
    // Ha a population fül aktív, inicializáljuk a kvízt
    if (populationTab && quizContainer) {
        populationTab.addEventListener('shown.bs.tab', function (e) {
            if (quizContainer.children.length === 0) {
                initQuiz();
            }
        });
    } else {
        console.error('Population tab or quiz container not found!');
    }
});