async function doHide() {
    const image    = document.getElementById("hideImage").files[0];
    const text     = document.getElementById("hideText").value;
    const password = document.getElementById("hidePassword").value;
    const result   = document.getElementById("hideResult");

    if (!image || !text || !password) {
        result.style.display = "block";
        result.innerHTML = '<span class="error">შეავსე ყველა ველი</span>';
        return;
    }

    const fd = new FormData();
    fd.append("image", image);
    fd.append("text", text);
    fd.append("password", password);

    result.style.display = "block";
    result.innerHTML = "მუშავდება...";

    const res = await fetch("/api/hide", { method: "POST", body: fd });

    if (!res.ok) {
        const data = await res.json();
        result.innerHTML = `<span class="error">${data.error}</span>`;
        return;
    }

    const colorKey = res.headers.get("X-Color-Key");
    const psnr     = res.headers.get("X-PSNR");
    const blob     = await res.blob();
    const url      = URL.createObjectURL(blob);

    result.innerHTML = `
        ✅ წარმატება!<br>
        PSNR: <b>${psnr} dB</b><br>
        Color-Key: <b>${colorKey}</b><br><br>
        <a href="${url}" download="stego.png">📥 გადმოწერა</a>
    `;
}

async function doReveal() {
    const image  = document.getElementById("revealImage").files[0];
    const key    = document.getElementById("revealKey").value;
    const result = document.getElementById("revealResult");

    if (!image || !key) {
        result.style.display = "block";
        result.innerHTML = '<span class="error">შეავსე ყველა ველი</span>';
        return;
    }

    const fd = new FormData();
    fd.append("image", image);
    fd.append("password", key);

    result.style.display = "block";
    result.innerHTML = "მუშავდება...";

    const res  = await fetch("/api/reveal", { method: "POST", body: fd });
    const data = await res.json();

    if (data.error) {
        result.innerHTML = `<span class="error">${data.error}</span>`;
        return;
    }

    result.innerHTML = `✅ ამოღებული ტექსტი:<br><b>${data.secret}</b>`;
}