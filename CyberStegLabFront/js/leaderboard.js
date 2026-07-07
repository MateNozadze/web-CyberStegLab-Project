
async function loadLeaderboard() {
  const list = document.getElementById('leaderboard-list');

  try {
    const res = await fetch(`${API}/api/score/leaderboard`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    const data = await res.json();
    renderLeaderboard(data);

  } catch (err) {
    list.innerHTML = `<p class="text-error">ჩატვირთვა ვერ მოხერხდა</p>`;
  }
}

function renderLeaderboard(data) {
  const list = document.getElementById('leaderboard-list');

  if (data.length === 0) {
    list.innerHTML = `<p class="text-muted">ჯერ არავინ არ არის</p>`;
    return;
  }

  const topClass = ['top1', 'top2', 'top3'];
  const medals = ['🥇', '🥈', '🥉'];

  list.innerHTML = data.map((entry, i) => `
    <div class="lb-row ${topClass[i] || ''}">
      <div class="lb-rank">${medals[i] || i + 1}</div>
      <div class="lb-name">${entry.username || entry.userId}</div>
      <div class="lb-score">${entry.totalPoints} XP</div>
    </div>
  `).join('');
}

requireAuth();
loadLeaderboard();