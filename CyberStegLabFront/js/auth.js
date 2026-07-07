const API = "http://localhost:5243";


// REGISTER

async function register() {
  const username = document.getElementById("username").value;
  const email    = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const result   = document.getElementById("result");

  try {
    const res = await fetch(`${API}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, username })
    });

    const data = await res.json();

    if (data.idToken) {
      localStorage.setItem("token", data.idToken);
      localStorage.setItem("email", email);
      localStorage.setItem("username", username);
      localStorage.setItem("uid", data.localId);
      result.innerHTML = `<span class="success">რეგისტრაცია წარმატებულია ✔</span>`;
      setTimeout(() => window.location.href = "../pages/home.html", 1000);
    } else {
      result.innerHTML = `<span class="error">რეგისტრაცია ვერ მოხერხდა ❌</span>`;
    }

  } catch (err) {
    result.innerHTML = `<span class="error">Server error</span>`;
  }
}


// LOGIN

async function login() {
  const email    = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  const result   = document.getElementById("loginResult");

  try {
    const res = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.idToken) {
      localStorage.setItem("token", data.idToken);
      localStorage.setItem("email", email);
      localStorage.setItem("uid", data.localId);

      const adminRes = await fetch(`${API}/api/admin/check`, {
        headers: { "Authorization": `Bearer ${data.idToken}` }
      });
      if (adminRes.ok) localStorage.setItem("isAdmin", "true");
      else localStorage.removeItem("isAdmin");

      result.innerHTML = `<span class="success">შესვლა წარმატებულია ✔</span>`;
      setTimeout(() => window.location.href = "../pages/home.html", 1000);
    } else {
      result.innerHTML = `<span class="error">არასწორი მონაცემები ❌</span>`;
    }

  } catch (err) {
    result.innerHTML = `<span class="error">Server error</span>`;
  }
}


// LOGOUT

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("email");
  localStorage.removeItem("username");
  localStorage.removeItem("isAdmin");
  window.location.href = "../pages/login.html";
}


// AUTH GUARD

function requireAuth() {
  const token = localStorage.getItem("token");
  if (!token) window.location.href = "../pages/login.html";
}