const PYTHON_API = "http://localhost:5050";

// ── TABS ──
function switchTab(tab, btn) {
  document.querySelectorAll(".ck-tab").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".ck-panel").forEach(p => p.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById("panel-" + tab).classList.add("active");
}

// ── FILE INPUTS ──
function setupDrop(inputId, filenameId, previewId) {
  const input   = document.getElementById(inputId);
  const fname   = document.getElementById(filenameId);
  const preview = document.getElementById(previewId);

  if (!input) return;  

  input.addEventListener("change", () => {
    const file = input.files[0];
    if (!file) return;
    fname.textContent = file.name;
    if (preview) {
      preview.src = URL.createObjectURL(file);
      preview.style.display = "block";
    }
  });

  const zone = input.closest(".ck-drop");
  if (!zone) return;  
  zone.addEventListener("dragover",  e => { e.preventDefault(); zone.classList.add("drag-over"); });
  zone.addEventListener("dragleave", () => zone.classList.remove("drag-over"));
  zone.addEventListener("drop",      () => zone.classList.remove("drag-over"));
}

setupDrop("hideImage",   "hideFilename",   "hidePreview");
setupDrop("revealImage", "revealFilename", "revealPreview");

// ── HIDE ──
async function doHide() {
  const image     = document.getElementById("hideImage").files[0];
  const text      = document.getElementById("hideText").value.trim();
  const password  = document.getElementById("hidePassword").value.trim();
  const resultBox = document.getElementById("hideResult");
  const content   = document.getElementById("hideResultContent");

  if (!image || !text || !password) {
    showError(resultBox, content, "სურათი, ტექსტი და პაროლი სავალდებულოა.");
    return;
  }

  setLoading("hideBtn", "hideSpinner", true);
  resultBox.style.display = "none";

  const fd = new FormData();
  fd.append("image",    image, image.name);
  fd.append("text",     text);
  fd.append("password", password);

  try {
    const res = await fetch(`${PYTHON_API}/api/hide`, { 
      method: "POST",
      headers: { "X-API-Key": "cybersteglab_secret_2026" },
      body: fd 
    });

    if (!res.ok) {
      const err = await res.json();
      showError(resultBox, content, err.error || "სერვერის შეცდომა");
      return;
    }

    const colorKey = res.headers.get("X-Color-Key");
    const psnr     = res.headers.get("X-PSNR");
    const blob     = await res.blob();
    const url      = URL.createObjectURL(blob);

    resultBox.classList.remove("error");
    content.innerHTML = `
      <p class="ck-label" style="margin-bottom:8px;">COLOR-KEY</p>
      <div class="ck-key-box">
        <span class="ck-key-val">${colorKey}</span>
        <button class="ck-copy-btn" onclick="copyKey('${colorKey}', this)">COPY</button>
      </div>
      <div class="ck-stats">
        <span><span class="ck-stat-label">PSNR:</span><span class="ck-stat-val">${psnr} dB</span></span>
        <span><span class="ck-stat-label">STATUS:</span><span class="ck-stat-val">OK ✓</span></span>
      </div>
      <a class="ck-download" href="${url}" download="stego.png">⬇ stego.png გადმოწერა</a>
      <p class="text-muted" style="font-size:11px;">შეინახე Color-Key — გარეშე ტექსტის ამოღება შეუძლებელია.</p>
    `;
    resultBox.style.display = "block";

  } catch {
    showError(resultBox, content, "Python სერვერთან კავშირი ვერ მოხერხდა (localhost:5050)");
  } finally {
    setLoading("hideBtn", "hideSpinner", false);
  }
}

// ── REVEAL ──
async function doReveal() {
  const image     = document.getElementById("revealImage").files[0];
  const key       = document.getElementById("revealKey").value.trim();
  const resultBox = document.getElementById("revealResult");
  const content   = document.getElementById("revealResultContent");

  if (!image || !key) {
    showError(resultBox, content, "სურათი და Color-Key სავალდებულოა.");
    return;
  }
  if (key.length !== 64) {
    showError(resultBox, content, "Color-Key უნდა იყოს 64-სიმბოლოიანი hex.");
    return;
  }

  setLoading("revealBtn", "revealSpinner", true);
  resultBox.style.display = "none";

  const fd = new FormData();
  fd.append("image",    image);
  fd.append("password", key);

  try {
    const res  = await fetch(`${PYTHON_API}/api/reveal`, { 
      method: "POST", 
      headers: { "X-API-Key": "cybersteglab_secret_2026" },
      body: fd 
    });
    const data = await res.json();

    if (!res.ok) {
      showError(resultBox, content, data.error || "ამოღება ვერ მოხერხდა");
      return;
    }

    resultBox.classList.remove("error");
    content.innerHTML = `
      <div class="ck-secret">${escapeHtml(data.secret)}</div>
      <p class="text-muted mt-8" style="font-size:11px;">წარმატებით გაიშიფრა ✓</p>
    `;
    resultBox.style.display = "block";

  } catch {
    showError(resultBox, content, "Python სერვერთან კავშირი ვერ მოხერხდა (localhost:5050)");
  } finally {
    setLoading("revealBtn", "revealSpinner", false);
  }
}

// ── HELPERS ──
function showError(box, content, msg) {
  box.classList.add("error");
  content.innerHTML = `<p class="error">⚠ ${msg}</p>`;
  box.style.display = "block";
}

function setLoading(btnId, spinnerId, on) {
  document.getElementById(btnId).disabled = on;
  document.getElementById(spinnerId).style.display = on ? "inline-block" : "none";
}

function copyKey(text, btn) {
  navigator.clipboard.writeText(text);
  btn.textContent = "კოპირდა!";
  setTimeout(() => btn.textContent = "COPY", 1800);
}

function escapeHtml(t) {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
// ── SETUP FILE DROPS ──
setupDrop("hideFileImage", "hideFileImageName", "hideFilePreview");
setupDrop("revealFileImage", "revealFileImageName", "revealFilePreview");

// file input-ებისთვის (preview გარეშე)
document.getElementById("hideFileInput").addEventListener("change", function() {
  document.getElementById("hideFileName").textContent = this.files[0]?.name || "";
});

// ── HIDE FILE ──
async function doHideFile() {
  const image    = document.getElementById("hideFileImage").files[0];
  const file     = document.getElementById("hideFileInput").files[0];
  const password = document.getElementById("hideFilePassword").value.trim();
  const resultBox = document.getElementById("hideFileResult");
  const content   = document.getElementById("hideFileResultContent");

  if (!image || !file || !password) {
    showError(resultBox, content, "სურათი, ფაილი და პაროლი სავალდებულოა.");
    return;
  }

  setLoading("hideFileBtn", "hideFileSpinner", true);
  resultBox.style.display = "none";

  const fd = new FormData();
  fd.append("image",    image);
  fd.append("file",     file);
  fd.append("password", password);

  try {
    const res = await fetch(`${PYTHON_API}/api/hide-file`, { 
      method: "POST", 
      headers: { "X-API-Key": "cybersteglab_secret_2026" },
      body: fd 
    });

    if (!res.ok) {
      const err = await res.json();
      showError(resultBox, content, err.error || "სერვერის შეცდომა");
      return;
    }

    const colorKey = res.headers.get("X-Color-Key");
    const psnr     = res.headers.get("X-PSNR");
    const blob     = await res.blob();
    const url      = URL.createObjectURL(blob);

    resultBox.classList.remove("error");
    content.innerHTML = `
      <p class="ck-label" style="margin-bottom:8px;">COLOR-KEY</p>
      <div class="ck-key-box">
        <span class="ck-key-val">${colorKey}</span>
        <button class="ck-copy-btn" onclick="copyKey('${colorKey}', this)">COPY</button>
      </div>
      <div class="ck-stats">
        <span><span class="ck-stat-label">PSNR:</span><span class="ck-stat-val">${psnr} dB</span></span>
        <span><span class="ck-stat-label">STATUS:</span><span class="ck-stat-val">OK ✓</span></span>
      </div>
      <a class="ck-download" href="${url}" download="stego.png">⬇ stego.png გადმოწერა</a>
      <p class="text-muted" style="font-size:11px;">შეინახე Color-Key — გარეშე ფაილის ამოღება შეუძლებელია.</p>
    `;
    resultBox.style.display = "block";

  } catch {
    showError(resultBox, content, "Python სერვერთან კავშირი ვერ მოხერხდა (localhost:5050)");
  } finally {
    setLoading("hideFileBtn", "hideFileSpinner", false);
  }
}

// ── REVEAL FILE ──
async function doRevealFile() {
  const image     = document.getElementById("revealFileImage").files[0];
  const key       = document.getElementById("revealFileKey").value.trim();
  const resultBox = document.getElementById("revealFileResult");
  const content   = document.getElementById("revealFileResultContent");

  if (!image || !key) {
    showError(resultBox, content, "სურათი და Color-Key სავალდებულოა.");
    return;
  }
  if (key.length !== 64) {
    showError(resultBox, content, "Color-Key უნდა იყოს 64-სიმბოლოიანი hex.");
    return;
  }

  setLoading("revealFileBtn", "revealFileSpinner", true);
  resultBox.style.display = "none";

  const fd = new FormData();
  fd.append("image",    image);
  fd.append("password", key);

  try {
    const res = await fetch(`${PYTHON_API}/api/reveal-file`, { 
      method: "POST",
      headers: { "X-API-Key": "cybersteglab_secret_2026" },
      body: fd 
    });

    if (!res.ok) {
      const err = await res.json();
      showError(resultBox, content, err.error || "ამოღება ვერ მოხერხდა");
      return;
    }

    const filename = res.headers.get("X-Filename") || "file";
    const blob     = await res.blob();
    const url      = URL.createObjectURL(blob);

    resultBox.classList.remove("error");
    content.innerHTML = `
      <div class="ck-stats">
        <span><span class="ck-stat-label">ფაილი:</span><span class="ck-stat-val">${filename}</span></span>
        <span><span class="ck-stat-label">STATUS:</span><span class="ck-stat-val">OK ✓</span></span>
      </div>
      <a class="ck-download" href="${url}" download="${filename}">⬇ ${filename} გადმოწერა</a>
      <p class="text-muted" style="font-size:11px;">ფაილი წარმატებით ამოღებულია ✓</p>
    `;
    resultBox.style.display = "block";

  } catch {
    showError(resultBox, content, "Python სერვერთან კავშირი ვერ მოხერხდა (localhost:5050)");
  } finally {
    setLoading("revealFileBtn", "revealFileSpinner", false);
  }
}
requireAuth();