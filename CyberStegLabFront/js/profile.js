
async function loadProfile() {
  const uid = localStorage.getItem('uid');
  const email = localStorage.getItem('email');
  const username = localStorage.getItem('username') || email?.split('@')[0];

  //მომხმარებლის ინფორმაციის ჩვენება პროფილის გვერდზე
  document.getElementById('profile-username').textContent = username;
  document.getElementById('profile-email').textContent = email;
  document.getElementById('profile-initial').textContent = username?.charAt(0).toUpperCase();

  try {
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

    const [progressRes, achievementsRes, challengesRes] = await Promise.all([
      fetch(`${API}/api/progress/${uid}`, { headers }),
      fetch(`${API}/api/achievement`, { headers }),
      fetch(`${API}/api/challenge`, { headers })
    ]);

    const data = await progressRes.json();
    const achievements = await achievementsRes.json();
    const challenges = await challengesRes.json();

    renderProfile(data, achievements, challenges);

  } catch (err) {
    console.error(err);
  }
}

function renderProfile(data, achievements, challenges) {
  document.getElementById('stat-xp').textContent = data.totalXP || 0;
  document.getElementById('stat-solved').textContent = data.solvedCount || 0;
  document.getElementById('stat-achievements').textContent = (data.unlockedAchievements || []).length;
  //მომხმარებლის მიერ გადაჭრილი გამოწვევების ჩვენება
  const solvedList = document.getElementById('solved-list');
  if (!data.solvedChallenges || data.solvedChallenges.length === 0) {
    solvedList.innerHTML = `<p class="text-muted" style="font-size:13px;">ჯერ არაფერი გადაჭრილა</p>`;
  } else {
    solvedList.innerHTML = data.solvedChallenges.map(ch => {
      const challenge = challenges.find(x => x.id === ch.challengeId);
      return `
      <div class="solved-item">
        <span class="text-green">✔</span>
        <span>${challenge?.title || ch.challengeId}</span>
        <span class="ch-xp">+${ch.xpEarned} XP</span>
      </div>
    `;
    }).join('');
  }
  //მომხმარებლის მიერ განბლოკილი მიღწევების ჩვენება
  const achList = document.getElementById('achievements-list');
  if (!data.unlockedAchievements || data.unlockedAchievements.length === 0) {
    achList.innerHTML = `<p class="text-muted" style="font-size:13px;">ჯერ არაფერი განბლოკილა</p>`;
  } else {
    achList.innerHTML = data.unlockedAchievements.map(a => {
      const ach = achievements.find(x => x.id === a.achievementId);
      return `
        <div class="achievement-item">
          <span class="ach-icon">${ach?.icon || '🏆'}</span>
          <span>${ach?.title || a.achievementId}</span>
        </div>
      `;
    }).join('');
  }
}

requireAuth();
loadProfile();