function checkQuiz() {
    let score = 0;
    let total = 3;
    let result = document.getElementById('quiz-result');
    
    // 1. kérdés
    let q1Correct = document.getElementById('quiz1-1').checked &&
                    !document.getElementById('quiz1-2').checked &&
                    document.getElementById('quiz1-3').checked;
    if (q1Correct) score++;
    highlightAnswers('quiz1-1', true);
    highlightAnswers('quiz1-2', false);
    highlightAnswers('quiz1-3', true);
    
    // 2. kérdés
    let q2Correct = document.getElementById('quiz2-4').checked;
    if (q2Correct) score++;
    for (let i = 1; i <= 4; i++) {
      highlightAnswers(`quiz2-${i}`, i === 4);
    }
    
    // 3. kérdés
    let q3Correct = document.getElementById('quiz3-1').checked &&
                    document.getElementById('quiz3-2').checked &&
                    document.getElementById('quiz3-3').checked;
    if (q3Correct) score++;
    highlightAnswers('quiz3-1', true);
    highlightAnswers('quiz3-2', true);
    highlightAnswers('quiz3-3', true);
    
    result.innerHTML = `<div class="alert alert-info">Eredmény: ${score}/${total} pont</div>`;
  }
  
  function highlightAnswers(id, isCorrect) {
    let label = document.querySelector(`label[for="${id}"]`);
    if (isCorrect) {
      if (document.getElementById(id).checked) {
        label.style.color = 'green';
      } else {
        label.style.color = 'blue';
      }
    } else {
      if (document.getElementById(id).checked) {
        label.style.color = 'red';
      }
    }
  }