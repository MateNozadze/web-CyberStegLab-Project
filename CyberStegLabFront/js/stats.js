async function loadStats() {
  try {
    const challenges = await fetchChallenges();

    const totalChallenges = challenges.length;
    const distinctLevels = new Set(challenges.map(c => c.difficulty)).size;
    const totalXP = challenges.reduce((sum, c) => sum + (c.xp || 0), 0);

    renderStats(totalChallenges, distinctLevels, totalXP);
  } catch (error) {
    console.error("სტატისტიკის ჩატვირთვა ვერ მოხერხდა:", error);
  }
}

async function fetchChallenges() {
  const res = await fetch(`${API}/api/Challenge`);
  if (!res.ok) {
    throw new Error(`Challenge-ების წამოღება ვერ მოხერხდა: ${res.status}`);
  }
  return res.json();
}

function renderStats(challengeCount, levelCount, xp) {
  const statNums = document.querySelectorAll(".stat-card .stat-num");

  if (statNums.length < 3) {
    console.warn("მოსალოდნელი იყო 3 .stat-num ელემენტი, ნაპოვნია:", statNums.length);
    return;
  }

  statNums[0].textContent = `${challengeCount}+`;
  statNums[1].textContent = `${levelCount}`;
  statNums[2].textContent = `${xp}`;
}

document.addEventListener("DOMContentLoaded", loadStats);