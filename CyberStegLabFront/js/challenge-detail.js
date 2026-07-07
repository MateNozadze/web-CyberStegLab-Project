
let challenge = null;

// URL-იდან id ამოღება
const params = new URLSearchParams(location.search);
const challengeId = params.get('id');

async function checkIfSolved() {
  const uid = localStorage.getItem('uid');
  if (!uid) return;

  try {
    const res  = await fetch(`${API}/api/progress/${uid}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();

    const solved = data.solvedChallenges?.find(c => c.challengeId === challengeId);
    if (solved) {
      document.getElementById('answer-area').style.opacity      = '0.4';
      document.getElementById('answer-area').style.pointerEvents = 'none';
      document.getElementById('submit-result').innerHTML =
        `<span class="success">✔ უკვე გადაჭრილია! +${solved.xpEarned} XP</span>`;
    }
  } catch (err) {
    console.error(err);
  }
}

async function loadChallenge() {
  try {
    const res = await fetch(`${API}/api/challenge/${challengeId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    challenge = await res.json();
    renderChallenge();
    await checkIfSolved();

  } catch (err) {
    document.getElementById('ch-title').textContent = 'ჩატვირთვა ვერ მოხერხდა';
  }
}

function renderChallenge() {
  document.getElementById('ch-title').textContent = challenge.title;
  document.getElementById('ch-desc').textContent  = challenge.description;
  document.getElementById('ch-xp').textContent    = `+${challenge.xp} XP`;
  document.getElementById('ch-type').textContent  = `// ${challenge.type}`;
  document.getElementById('ch-badge').innerHTML   =
    `<span class="badge badge-${challenge.difficulty}">${challenge.difficulty}</span>`;

  // სურათი და download ღილაკი
  if (challenge.imagePath) {
    document.getElementById('ch-image-wrap').innerHTML = `
      <a href="${challenge.imagePath}" download
         class="btn btn-outline mt-8" style="display:inline-block;">
        ⬇ DOWNLOAD IMAGE
      </a>
    `;
  }
  // quiz type-ისთვის ცალკე UI
  if (challenge.type === 'quiz') {
    renderQuizUI();
  }
}

function renderQuizUI() {
  const options = challenge.options || [];

  document.getElementById('answer-area').innerHTML = `
    <p class="text-cyan mb-16" style="font-size:14px;">${challenge.description || ''}</p>
    <div id="quiz-options">
      ${options.map(opt => `
        <button class="quiz-option" onclick="selectOption(this, '${opt}')">
          ${opt}
        </button>
      `).join('')}
    </div>
    <button class="btn btn-primary mt-16" onclick="submitAnswer()">SUBMIT →</button>
  `;
}

function selectOption(btn, value) {
  document.querySelectorAll('.quiz-option').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  document.getElementById('answer-input') || 
    document.getElementById('answer-area').insertAdjacentHTML('beforeend', 
      `<input type="hidden" id="answer-input" value="${value}">`);
  document.getElementById('answer-input').value = value;
}

async function submitAnswer() {
  const answer = document.getElementById('answer-input').value.trim();
  const result = document.getElementById('submit-result');
  const btn    = document.querySelector('.btn-primary');

  if (!answer) {
    result.innerHTML = `<span class="error">პასუხი ცარიელია</span>`;
    return;
  }

  btn.textContent = 'CHECKING...';
  btn.disabled = true;

  try {
    const res = await fetch(`${API}/api/challenge/${challengeId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        userId: localStorage.getItem('uid'),
        answer
      })
    });

    const data = await res.json();

    if (data.correct) {
      result.innerHTML = `<span class="success">✔ სწორია! +${data.points} XP დაემატა</span>`;
      document.getElementById('answer-area').style.opacity = '0.4';
      document.getElementById('answer-area').style.pointerEvents = 'none';
    } else {
      result.innerHTML = `<span class="error">✘ ${data.message}</span>`;
      btn.textContent = 'SUBMIT →';
      btn.disabled = false;
    }

  } catch (err) {
    result.innerHTML = `<span class="error">Server error</span>`;
    btn.textContent = 'SUBMIT →';
    btn.disabled = false;
  }
}

function showHint() {
  const hint = challenge.hint;

  const hints = {
    stego:    'გამოიყენე LSB decoder ხელსაწყო ან Python Pillow.',
    base64:   'სცადე browser console: atob("...")',
    rgb:      'გამოყავი წითელი არხი და გაანალიზე პიქსელები.',
    xor:      'გასაღები 3 ბაიტია. სცადე სხვადასხვა კომბინაცია.',
    password: 'შეაფასე სიგრძე, სიმბოლოები და entropy.'
  };

  const type = challenge?.type || '';
  const msg = hint || hints[type] || 'ყურადღებით წაიკითხე აღწერა.';
  document.getElementById('ch-hint').innerHTML =
    `<span class="text-cyan">${msg}</span>`;
}

requireAuth();
loadChallenge();