async function checkAdminNav() {
  const token = localStorage.getItem("token");
  if (!token) return;

  const res = await fetch(`${API}/api/admin/check`, {
    headers: { "Authorization": `Bearer ${token}` }
  });

  if (res.ok) {
    document.getElementById("adminNavBtn").style.display = "inline-block";
    localStorage.setItem("isAdmin", "true");
  } else {
    localStorage.removeItem("isAdmin");
  }
}

function loadNav() {
  fetch('../components/nav.html')
    .then(r => r.text())
    .then(html => {
      document.getElementById('nav').innerHTML = html;

      const page = location.pathname.split('/').pop();
      document.querySelectorAll('.nav-btn').forEach(btn => {
        if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(page)) {
          btn.classList.add('active');
        }
      });

      checkAdminNav(); 
    });
}


loadNav();
