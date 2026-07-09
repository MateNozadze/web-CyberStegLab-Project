
let allChallenges = [];

async function loadChallenges() {
  const grid = document.getElementById('challenges-grid');

  try {
    const res = await fetch(`${API}/api/challenge`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    allChallenges = await res.json();
    renderChallenges(allChallenges);

  } catch (err) {
    grid.innerHTML = `<p class="text-error">ჩატვირთვა ვერ მოხერხდა</p>`;
  }
}

function renderChallenges(list) {
  const grid = document.getElementById('challenges-grid');

  if (list.length === 0) {
    grid.innerHTML = `<p class="text-muted">challenge არ მოიძებნა</p>`;
    return;
  }

  grid.innerHTML = list.map(ch => `
    <div class="challenge-card" onclick="location.href='challenge-detail.html?id=${ch.id}'">
      <div class="ch-type">${ch.type}</div>
      <div class="ch-title">${ch.title}</div>
      <!-- აი აქ შევცვალეთ კლასი ch-desc-preview-ზე -->
      <div class="ch-desc-preview">${ch.description}</div>
      <div class="ch-footer">
        <span class="ch-xp">+${ch.xp} XP</span>
        <span class="badge badge-${ch.difficulty}">${ch.difficulty}</span>
      </div>
    </div>
  `).join('');
}

function filterChallenges(difficulty, btn) {
  // active კლასი
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const filtered = difficulty === 'all'
    ? allChallenges
    : allChallenges.filter(ch => ch.difficulty === difficulty);

  renderChallenges(filtered);
}

// გვერდის ჩატვირთვისას
requireAuth();
loadChallenges();