
document.addEventListener('DOMContentLoaded', () => {
  let globalScore = parseInt(localStorage.getItem('globalScore') || '0');
  let successes = JSON.parse(localStorage.getItem('successes') || '[]');
  let penduTimer, penduTimeLeft = 60;
  let penduTimerInterval;

  const updateScore = () => {
    document.getElementById('global-score').textContent = globalScore;
    localStorage.setItem('globalScore', globalScore);
  };

  const unlockSuccess = (name) => {
    if (!successes.includes(name)) {
      successes.push(name);
      localStorage.setItem('successes', JSON.stringify(successes));
      updateSuccessList();
    }
  };

  const updateSuccessList = () => {
    const ul = document.getElementById('success-list');
    ul.innerHTML = '';
    successes.forEach(s => {
      const li = document.createElement('li');
      li.textContent = '🏆 ' + s;
      ul.appendChild(li);
    });
  };

  updateScore();
  updateSuccessList();

  // PENDU
  const penduWords = {
    animaux: ['chat', 'chien', 'lion', 'zèbre'],
    tech: ['javascript', 'ordinateur', 'réseau', 'algorithme']
  };
  let currentCategory = 'animaux';
  let selectedWord = '';
  let guessed = [];
  let errors = 0;

  const startPendu = () => {
    clearInterval(penduTimerInterval);
    const words = penduWords[currentCategory];
    selectedWord = words[Math.floor(Math.random() * words.length)];
    guessed = [];
    errors = 0;
    penduTimeLeft = 60;
    document.getElementById('hidden-word').textContent = '_ '.repeat(selectedWord.length);
    document.getElementById('result-message').textContent = '';
    updateHangman();
    generateLetters();
    updateTimer();
    penduTimerInterval = setInterval(() => {
      penduTimeLeft--;
      updateTimer();
      if (penduTimeLeft <= 0) {
        document.getElementById('result-message').textContent = `⏰ Temps écoulé ! Le mot était : ${selectedWord}`;
        clearInterval(penduTimerInterval);
      }
    }, 1000);
  };

  const updateTimer = () => {
    let timerEl = document.getElementById('pendu-timer');
    if (!timerEl) {
      timerEl = document.createElement('div');
      timerEl.id = 'pendu-timer';
      timerEl.className = 'timer';
      document.getElementById('pendu-container').appendChild(timerEl);
    }
    timerEl.textContent = '⏱️ Temps restant : ' + penduTimeLeft + 's';
  };

  const updateHangman = () => {
    document.getElementById('hangman-drawing').textContent = 'Erreurs : ' + errors + ' / 6';
  };

  const generateLetters = () => {
    const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const container = document.getElementById('letters');
    container.innerHTML = '';
    letters.forEach(letter => {
      const btn = document.createElement('button');
      btn.textContent = letter;
      btn.onclick = () => guessLetter(letter);
      container.appendChild(btn);
    });
  };

  const guessLetter = (l) => {
    if (selectedWord.includes(l)) {
      guessed.push(l);
    } else {
      errors++;
      updateHangman();
    }
    const wordDisplay = selectedWord.split('').map(c => guessed.includes(c) ? c : '_').join(' ');
    document.getElementById('hidden-word').textContent = wordDisplay;
    if (!wordDisplay.includes('_')) {
      document.getElementById('result-message').textContent = '🎉 Gagné !';
      clearInterval(penduTimerInterval);
      globalScore += 5;
      updateScore();
      unlockSuccess('Victoire au pendu');
    }
  };

  document.querySelector('button[onclick="startGame()"]')?.addEventListener('click', startPendu);
  startPendu();

  // CLICKER
  let clicks = parseInt(localStorage.getItem('clicks') || '0');
  let multiplier = parseInt(localStorage.getItem('multiplier') || '1');

  const updateClicks = () => {
    document.getElementById('clicks').textContent = clicks;
    localStorage.setItem('clicks', clicks);
  };

  const addClick = () => {
    clicks += multiplier;
    globalScore += 1;
    updateClicks();
    updateScore();
    if (clicks >= 100) unlockSuccess('100 clics !');
  };

  window.addClick = addClick;

  // LOGIQUE
  const logicData = [
    { question: '2, 4, 6, ?', answer: '8' },
    { question: 'Carré de 5 ?', answer: '25' },
    { question: '8/2 = ?', answer: '4' }
  ];
  let logicIndex = 0;

  const showLogic = () => {
    document.getElementById('logic-question').textContent = logicData[logicIndex].question;
  };

  const checkLogicAnswer = () => {
    const answer = document.getElementById('logic-input').value.trim();
    if (answer === logicData[logicIndex].answer) {
      logicIndex = (logicIndex + 1) % logicData.length;
      globalScore += 3;
      updateScore();
      unlockSuccess('Bonne réponse logique');
      document.getElementById('logic-result').textContent = '✅ Correct !';
      showLogic();
    } else {
      document.getElementById('logic-result').textContent = '❌ Incorrect.';
    }
  };

  window.checkLogicAnswer = checkLogicAnswer;
  showLogic();
});
// CLICKER BOUTIQUE
  const shopContainer = document.createElement('div');
  shopContainer.className = 'shop';
  shopContainer.innerHTML = `
    <h3>Boutique</h3>
    <button onclick="buyUpgrade('auto')">Auto-clic (50 clics)</button>
    <button onclick="buyUpgrade('multi')">Multiplicateur x2 (100 clics)</button>
    <p id="shop-message"></p>
  `;
  document.getElementById('clicker-container')?.appendChild(shopContainer);

  let autoClickInterval;

  const buyUpgrade = (type) => {
    const msg = document.getElementById('shop-message');
    if (type === 'auto') {
      if (clicks >= 50) {
        clicks -= 50;
        updateClicks();
        msg.textContent = '✅ Auto-clic activé !';
        clearInterval(autoClickInterval);
        autoClickInterval = setInterval(() => addClick(), 1000);
      } else {
        msg.textContent = '❌ Pas assez de clics !';
      }
    }
    if (type === 'multi') {
      if (clicks >= 100) {
        clicks -= 100;
        multiplier *= 2;
        localStorage.setItem('multiplier', multiplier);
        updateClicks();
        msg.textContent = '✅ Multiplicateur x2 activé !';
      } else {
        msg.textContent = '❌ Pas assez de clics !';
      }
    }
  };

  window.buyUpgrade = buyUpgrade;

  // ESCAPE ROOM - navigation
  let escapeState = {
    room: 1,
    hasKey: false
  };

  const updateEscapeRoom = () => {
    const msg = document.getElementById('escape-message');
    msg.textContent = '';
    if (escapeState.room === 1) {
      msg.innerHTML = 'Tu es dans une pièce sombre avec une porte. <br><button onclick="goToRoom(2)">➡️ Aller dans le couloir</button>';
    } else if (escapeState.room === 2) {
      msg.innerHTML = 'Tu es dans le couloir. Une porte semble fermée à clé.<br>' +
        (escapeState.hasKey
          ? '<button onclick="openLockedDoor()">🔓 Utiliser la clé</button>'
          : '<button onclick="searchForKey()">🔍 Chercher une clé</button>');
    }
  };

  window.goToRoom = (room) => {
    escapeState.room = room;
    updateEscapeRoom();
  };

  window.searchForKey = () => {
    escapeState.hasKey = true;
    unlockSuccess('Clé trouvée dans le couloir');
    updateEscapeRoom();
  };

  window.openLockedDoor = () => {
    globalScore += 10;
    updateScore();
    unlockSuccess('Tu t'es échappé du niveau 2 !');
    document.getElementById('escape-message').innerHTML = '🎉 Bravo ! Tu es sorti !';
  };

  updateEscapeRoom();

  // INVENTAIRE
  const inventory = [];
  const inventoryDisplay = document.createElement('div');
  inventoryDisplay.id = 'inventory';
  inventoryDisplay.style.marginTop = '1em';
  inventoryDisplay.innerHTML = '<h3>Inventaire</h3><ul id="inventory-list"></ul>';
  document.getElementById('escape-container')?.appendChild(inventoryDisplay);

  const updateInventory = () => {
    const list = document.getElementById('inventory-list');
    list.innerHTML = '';
    inventory.forEach(item => {
      const li = document.createElement('li');
      li.textContent = '🧰 ' + item;
      list.appendChild(li);
    });
  };

  const addToInventory = (item) => {
    if (!inventory.includes(item)) {
      inventory.push(item);
      updateInventory();
    }
  };

  // Mise à jour du système de navigation avec salle 3
  const updateEscapeRoom = () => {
    const msg = document.getElementById('escape-message');
    msg.textContent = '';
    if (escapeState.room === 1) {
      msg.innerHTML = '🔦 <b>Pièce 1</b> : Tu es dans une pièce sombre. Il y a une porte vers le couloir.<br><button onclick="goToRoom(2)">➡️ Aller dans le couloir</button>';
    } else if (escapeState.room === 2) {
      msg.innerHTML = '🚪 <b>Couloir</b> : Une lumière blafarde éclaire un placard fermé.<br>' +
        (escapeState.hasKey
          ? '<button onclick="goToRoom(3)">🔓 Ouvrir la porte du fond</button>'
          : '<button onclick="searchForKey()">🔍 Fouiller le placard</button>') +
        '<br><button onclick="goToRoom(1)">⬅️ Revenir</button>';
    } else if (escapeState.room === 3) {
      msg.innerHTML = '🧩 <b>Salle 3</b> : Tu trouves un coffre verrouillé avec une énigme dessus.<br>' +
        'Énigme : <i>Je suis toujours devant toi, mais jamais là. Qui suis-je ?</i><br>' +
        '<input type="text" id="riddle-input" placeholder="Ta réponse"><button onclick="solveRiddle()">Valider</button>' +
        '<br><button onclick="goToRoom(2)">⬅️ Retour</button>';
    }
  };

  window.solveRiddle = () => {
    const input = document.getElementById('riddle-input');
    const msg = document.getElementById('escape-message');
    if (input.value.toLowerCase().trim() === 'avenir') {
      msg.innerHTML += '<br>🎉 Bonne réponse ! Tu ouvres le coffre et trouves un diamant.';
      addToInventory('Diamant mystérieux');
      globalScore += 20;
      updateScore();
      unlockSuccess('Enigme de la salle 3 résolue');
    } else {
      msg.innerHTML += '<br>❌ Mauvaise réponse.';
    }
  };

  window.searchForKey = () => {
    escapeState.hasKey = true;
    unlockSuccess('Clé trouvée dans le couloir');
    addToInventory('Clé rouillée');
    updateEscapeRoom();
  };

  updateInventory();


  // PSEUDO UTILISATEUR
  let pseudo = localStorage.getItem('pseudo');
  if (!pseudo) {
    pseudo = prompt('Entre ton pseudo pour commencer :');
    localStorage.setItem('pseudo', pseudo);
  }
  const header = document.querySelector('header');
  if (header && pseudo) {
    const playerTag = document.createElement('div');
    playerTag.style.marginTop = '0.5em';
    playerTag.innerHTML = `<strong>👾 Pseudo :</strong> ${pseudo}`;
    header.appendChild(playerTag);
  }

  // BARRE DE PROGRESSION
  const progressContainer = document.createElement('div');
  progressContainer.style.marginTop = '1em';
  progressContainer.innerHTML = '<h3>Progression</h3><progress id="score-progress" value="0" max="100"></progress>';
  document.getElementById('home')?.appendChild(progressContainer);

  const updateProgress = () => {
    const progress = document.getElementById('score-progress');
    progress.value = Math.min(globalScore, 100);
    if (globalScore >= 50 && !successes.includes('Nouveau jeu débloqué')) {
      unlockSuccess('Nouveau jeu débloqué');
      alert('🎉 Tu as débloqué un nouveau jeu bonus !');
    }
  };

  // SONS
  const clickSound = new Audio('https://www.soundjay.com/buttons/sounds/button-16.mp3');
  const successSound = new Audio('https://www.soundjay.com/buttons/sounds/button-4.mp3');

  const playClick = () => clickSound.play();
  const playSuccess = () => successSound.play();

  // Intégration sons dans les actions
  window.addClick = () => {
    playClick();
    clicks += multiplier;
    globalScore += 1;
    updateClicks();
    updateScore();
    updateProgress();
    if (clicks >= 100) unlockSuccess('100 clics !');
  };

  window.checkLogicAnswer = () => {
    const answer = document.getElementById('logic-input').value.trim();
    if (answer === logicData[logicIndex].answer) {
      logicIndex = (logicIndex + 1) % logicData.length;
      globalScore += 3;
      updateScore();
      updateProgress();
      playSuccess();
      unlockSuccess('Bonne réponse logique');
      document.getElementById('logic-result').textContent = '✅ Correct !';
      showLogic();
    } else {
      document.getElementById('logic-result').textContent = '❌ Incorrect.';
    }
  };

  updateProgress();
