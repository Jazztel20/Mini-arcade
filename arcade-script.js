
console.log('✅ Script chargé');

window.showPage = function(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const section = document.getElementById(id);
  if (section) section.classList.add('active');
};

let score = 0;

window.addClick = function() {
  score++;
  document.getElementById('points').textContent = score;
};

window.checkAnswer = function() {
  const val = document.getElementById('answer').value.trim();
  const result = document.getElementById('result');
  if (val === '4') {
    result.textContent = '✅ Correct !';
  } else {
    result.textContent = '❌ Incorrect.';
  }
};
