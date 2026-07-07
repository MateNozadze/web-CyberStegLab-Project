const API = "http://localhost:5243";


// AUTH
function adminHeaders() {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("token")}`
  };
}

function checkAdminAccess() {
  if (localStorage.getItem("isAdmin") !== "true") {
    document.getElementById("loginError").innerHTML = `<span class="error">წვდომა აკრძალულია</span>`;
    return;
  }
  document.getElementById("admin-login").classList.add("hidden");
  document.getElementById("admin-panel").classList.remove("hidden");
  loadChallenges();
}

function adminLogout() {
  localStorage.removeItem("isAdmin");
  localStorage.removeItem("token");
  localStorage.removeItem("email");
  localStorage.removeItem("username");
  window.location.href = "../pages/login.html";
}


// TABS

function showTab(tab, btn) {
  document.getElementById("tab-challenges").classList.add("hidden");
  document.getElementById("tab-lessons").classList.add("hidden");
  document.getElementById("tab-" + tab).classList.remove("hidden");
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  if (tab === "lessons") loadLessons();
}


// CHALLENGES

async function loadChallenges() {
  const res = await fetch(`${API}/api/admin/challenges`, { headers: adminHeaders() });

  const data = await res.json();
  renderChallenges(data);
}

function renderChallenges(list) {
  document.getElementById("challenges-list").innerHTML = list.map(ch => `
    <div class="admin-row">
      <div class="admin-row-info">
        <span class="text-green">${ch.title}</span>
        <span class="badge badge-${ch.difficulty}">${ch.difficulty}</span>
        <span class="text-muted">${ch.type} — ${ch.xp} XP</span>
      </div>
      <div class="admin-row-actions">
        <button class="btn btn-outline" onclick="editChallenge(${JSON.stringify(ch).replace(/"/g, '&quot;')})">EDIT</button>
        <button class="btn" style="border:1px solid var(--error);color:var(--error);" onclick="deleteChallenge('${ch.id}')">DELETE</button>
      </div>
    </div>
  `).join('');
}

document.getElementById("ch-type").addEventListener("change", function () {
  const quizFields = document.getElementById("quiz-fields");
  quizFields.style.display = this.value === "quiz" ? "block" : "none";
});

function showChallengeForm() {
  document.getElementById("ch-edit-id").value = "";
  document.getElementById("ch-title").value = "";
  document.getElementById("ch-description").value = "";
  document.getElementById("ch-xp").value = "";
  document.getElementById("ch-answer").value = "";
  document.getElementById("ch-image-file").value = "";
  document.getElementById("ch-image-url").value = "";
  document.getElementById("quiz-fields").style.display = "none";
  document.getElementById("challenge-form").classList.remove("hidden");
}

function hideChallengeForm() {
  document.getElementById("challenge-form").classList.add("hidden");
}

async function editChallenge(ch) {
    //ჯერ მივმართავთ ადმინის სპეციალურ ენდპოინტს, რომელსაც 100%-ით მოაქვს პასუხი
    const res = await fetch(`${API}/api/admin/challenges/${ch.id}`, { headers: adminHeaders() });
    const fullChallenge = await res.json();

    // ვავსებთ ველებს სერვერიდან მოსული ახალი და სრული მონაცემებით
    document.getElementById("ch-edit-id").value = fullChallenge.id || fullChallenge.Id;
    document.getElementById("ch-title").value = fullChallenge.title || fullChallenge.Title;
    document.getElementById("ch-description").value = fullChallenge.description || fullChallenge.Description;
    document.getElementById("ch-difficulty").value = fullChallenge.difficulty || fullChallenge.Difficulty;
    document.getElementById("ch-type").value = fullChallenge.type || fullChallenge.Type;
    document.getElementById("ch-xp").value = fullChallenge.xp || fullChallenge.XP;
    
    // აი აქ გარანტირებულად ჩაჯდება სწორი პასუხი ადმინის ენდპოინტიდან!
    document.getElementById("ch-answer").value = fullChallenge.correctAnswer || fullChallenge.CorrectAnswer || "";
    
    document.getElementById("ch-image-file").value = "";
    document.getElementById("ch-image-url").value = fullChallenge.imagePath || fullChallenge.ImagePath || "";
    document.getElementById("challenge-form").classList.remove("hidden");
}
async function uploadToCloudinary(file) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", "miw2urcc");

  const res = await fetch("https://api.cloudinary.com/v1_1/dkrnevbo1/image/upload", {
    method: "POST",
    body: fd
  });

  const data = await res.json();
  return data.secure_url;
}

async function saveChallenge() {
  const id = document.getElementById("ch-edit-id").value;
  const type = document.getElementById("ch-type").value;
  const imageFile = document.getElementById("ch-image-file").files[0];

  let imagePath = document.getElementById("ch-image-url").value;
  if (imageFile) {
    imagePath = await uploadToCloudinary(imageFile);
  }
  
  const body = {
    title: document.getElementById("ch-title").value,
    description: document.getElementById("ch-description").value,
    difficulty: document.getElementById("ch-difficulty").value,
    type: document.getElementById("ch-type").value,
    xP: parseInt(document.getElementById("ch-xp").value),
    CorrectAnswer: document.getElementById("ch-answer").value,
    imagePath: imagePath,
    hint: document.getElementById("ch-hint").value
  };

  if (type === "quiz") {
    body.options = [
      document.getElementById("ch-option1").value,
      document.getElementById("ch-option2").value,
      document.getElementById("ch-option3").value,
      document.getElementById("ch-option4").value
    ].filter(o => o.trim() !== "");
  }

  const url = id ? `${API}/api/admin/challenges/${id}` : `${API}/api/admin/challenges`;
  const method = id ? "PUT" : "POST";

  const res = await fetch(url, { method, headers: adminHeaders(), body: JSON.stringify(body) });
  const data = await res.json();

  document.getElementById("ch-form-result").innerHTML =
    res.ok ? `<span class="success">${data.message}</span>` : `<span class="error">${data.error}</span>`;

  if (res.ok) { hideChallengeForm(); loadChallenges(); }
}

async function deleteChallenge(id) {
  if (!confirm("დარწმუნებული ხარ?")) return;
  await fetch(`${API}/api/admin/challenges/${id}`, { method: "DELETE", headers: adminHeaders() });
  loadChallenges();
}


// LESSONS

async function loadLessons() {
  const res = await fetch(`${API}/api/admin/lessons`, { headers: adminHeaders() });
  const data = await res.json();
  renderLessons(data);
}

function renderLessons(list) {
  document.getElementById("lessons-list").innerHTML = list.map(l => `
    <div class="admin-row">
      <div class="admin-row-info">
        <span class="text-green">${l.title}</span>
        <span class="badge badge-${l.badge}">${l.badge}</span>
        <span class="text-muted">order: ${l.order}</span>
      </div>
      <div class="admin-row-actions">
        <button class="btn btn-outline" onclick="editLesson(${JSON.stringify(l).replace(/"/g, '&quot;')})">EDIT</button>
        <button class="btn" style="border:1px solid var(--error);color:var(--error);" onclick="deleteLesson('${l.id}')">DELETE</button>
      </div>
    </div>
  `).join('');
}

function showLessonForm() {
  document.getElementById("ls-edit-id").value = "";
  document.getElementById("ls-title").value = "";
  document.getElementById("ls-content").value = "";
  document.getElementById("ls-order").value = "";
  document.getElementById("lesson-form").classList.remove("hidden");
}

function hideLessonForm() {
  document.getElementById("lesson-form").classList.add("hidden");
}

function editLesson(l) {
  document.getElementById("ls-edit-id").value = l.id;
  document.getElementById("ls-title").value = l.title;
  document.getElementById("ls-content").value = l.content;
  document.getElementById("ls-badge").value = l.badge;
  document.getElementById("ls-order").value = l.order;
  document.getElementById("lesson-form").classList.remove("hidden");
}

async function saveLesson() {
  const id = document.getElementById("ls-edit-id").value;
  const body = {
    title: document.getElementById("ls-title").value,
    content: document.getElementById("ls-content").value,
    badge: document.getElementById("ls-badge").value,
    order: parseInt(document.getElementById("ls-order").value)
  };

  const url = id ? `${API}/api/admin/lessons/${id}` : `${API}/api/admin/lessons`;
  const method = id ? "PUT" : "POST";

  const res = await fetch(url, { method, headers: adminHeaders(), body: JSON.stringify(body) });
  const data = await res.json();

  document.getElementById("ls-form-result").innerHTML =
    res.ok ? `<span class="success">${data.message}</span>` : `<span class="error">${data.error}</span>`;

  if (res.ok) { hideLessonForm(); loadLessons(); }
}

async function deleteLesson(id) {
  if (!confirm("დარწმუნებული ხარ?")) return;
  await fetch(`${API}/api/admin/lessons/${id}`, { method: "DELETE", headers: adminHeaders() });
  loadLessons();
}