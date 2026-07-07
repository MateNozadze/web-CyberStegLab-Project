const lessons = [
  {
    id: 'lsb',
    title: 'LSB სტეგანოგრაფია',
    badge: 'beginner',
    content: `
      <h3>რა არის LSB?</h3>
      <p>LSB (Least Significant Bit) არის სურათის თითოეული პიქსელის
      ყველაზე ნაკლებმნიშვნელოვანი ბიტი. მის შეცვლა სურათის
      გარეგნობას პრაქტიკულად არ ცვლის, მაგრამ ინფორმაციის
      დამალვის საშუალებას იძლევა.</p>

      <h3>რა ხელსაწყოები გამოიყენო</h3>
      <p>1. <code class="inline">stegonline.georgeom.net</code> — ონლაინ, კოდის გარეშე</p>
      <p>2. Python Pillow — კოდით, უფრო მოქნილი</p>

      <h3>Python კოდი — ნაბიჯ-ნაბიჯ</h3>
      <p>ჯერ დააინსტალირე:</p>
      <code class="inline">pip install Pillow</code>
      <p>შემდეგ გაუშვი:</p>
      <pre><code>from PIL import Image

def extract_lsb(image_path):
    img = Image.open(image_path).convert("RGB")
    pixels = list(img.getdata())
    bits = []
    for pixel in pixels:
        for channel in pixel:
            bits.append(channel & 1)
    chars = []
    for i in range(0, len(bits), 8):
        byte = bits[i:i+8]
        char = chr(int(''.join(map(str, byte)), 2))
        if char == '\0':
            break
        chars.append(char)
    return ''.join(chars)

print(extract_lsb("challenge.png"))</code></pre>

      <h3>მაგალითი</h3>
      <p>input: <code class="inline">challenge.png</code></p>
      <p>output: <code class="inline">FLAG{lsb_is_fun}</code></p>
    `
  },
  {
    id: 'base64',
    title: 'Base64 კოდირება',
    badge: 'beginner',
    content: `
      <h3>რა არის Base64?</h3>
      <p>Base64 არის კოდირების სისტემა რომელიც ბინარულ მონაცემებს
      ტექსტად გარდაქმნის. გამოიყენება მონაცემების გადასაცემად
      და დასამალად.</p>

      <h3>როგორ მუშაობს?</h3>
      <p>ტექსტი იყოფა 3-ბაიტიან ჯგუფებად, თითოეული გარდაიქმნება
      4 სიმბოლოდ ანბანიდან: <code class="inline">A-Z, a-z, 0-9, +, /</code></p>

      <h3>გაშიფვრა — browser console</h3>
      <pre><code>atob("aGVsbG8=")
// output: "hello"

atob("RkxBR3tiYXNlNjR9")
// output: "FLAG{base64}"</code></pre>

      <h3>გაშიფვრა — Python</h3>
      <pre><code>import base64

encoded = "RkxBR3tiYXNlNjR9"
decoded = base64.b64decode(encoded).decode()
print(decoded)
# output: FLAG{base64}</code></pre>

      <h3>მაგალითი</h3>
      <p>კოდირებული: <code class="inline">RkxBR3tiYXNlNjR9</code></p>
      <p>გაშიფრული: <code class="inline">FLAG{base64}</code></p>
      <h3>გაშიფვრა — CyberChef</h3>
      <p>1. გახსენი <code class="inline">gchq.github.io/CyberChef</code></p>
      <p>2. Operations-ში მოძებნე <code class="inline">From Base64</code></p>
      <p>3. Input-ში ჩასვი კოდირებული ტექსტი</p>
      <p>4. Output-ში გამოჩნდება გაშიფრული შედეგი</p>
    `
  },
  {
    id: 'password',
    title: 'Password Strength',
    badge: 'beginner',
    content: `
      <h3>რა განსაზღვრავს პაროლის სიძლიერეს?</h3>
      <p>სამი მთავარი კრიტერიუმი: სიგრძე, სიმბოლოების
      მრავალფეროვნება და entropy.</p>

      <h3>კრიტერიუმები</h3>
      <p><code class="inline">სიგრძე</code> — მინიმუმ 12 სიმბოლო</p>
      <p><code class="inline">სიმბოლოები</code> — დიდი, პატარა, ციფრი, სპეციალური</p>
      <p><code class="inline">Entropy</code> — რაც მეტია, მით ძნელია გამოცნობა</p>

      <h3>Python-ით შემოწმება</h3>
      <pre><code>import re

def check_strength(password):
    score = 0
    if len(password) >= 12:
        score += 1
    if re.search(r'[A-Z]', password):
        score += 1
    if re.search(r'[a-z]', password):
        score += 1
    if re.search(r'[0-9]', password):
        score += 1
    if re.search(r'[!@#$%^&*]', password):
        score += 1

    if score <= 2:
        return "weak"
    elif score <= 4:
        return "medium"
    else:
        return "strong"

print(check_strength("pass123"))
print(check_strength("P@ssw0rd!2024"))</code></pre>

      <h3>მაგალითი</h3>
      <p><code class="inline">pass123</code> → weak</p>
      <p><code class="inline">P@ssw0rd!2024</code> → strong</p>
    `
  },
  {
    id: 'rgb',
    title: 'RGB არხები',
    badge: 'intermediate',
    content: `
      <h3>რა არის RGB არხი?</h3>
      <p>სურათის თითოეული პიქსელი შედგება სამი არხისგან:
      წითელი (R), მწვანე (G) და ლურჯი (B).
      სტეგანოგრაფიაში ხშირად მხოლოდ ერთ არხს იყენებენ
      ინფორმაციის დასამალად.</p>

      <h3>Python-ით წითელი არხის ამოღება</h3>
      <pre><code>from PIL import Image

def extract_red_channel(image_path):
    img = Image.open(image_path).convert("RGB")
    pixels = list(img.getdata())

    bits = []
    for pixel in pixels:
        r, g, b = pixel
        bits.append(r & 1)

    chars = []
    for i in range(0, len(bits), 8):
        byte = bits[i:i+8]
        char = chr(int(''.join(map(str, byte)), 2))
        if char == '\0':
            break
        chars.append(char)

    return ''.join(chars)

print(extract_red_channel("challenge.png"))</code></pre>

      <h3>მაგალითი</h3>
      <p>R არხიდან output: <code class="inline">FLAG{red_channel}</code></p>
    `
  },
  {
    id: 'xor',
    title: 'XOR Cipher',
    badge: 'intermediate',
    content: `
      <h3>რა არის XOR?</h3>
      <p>XOR (Exclusive OR) არის ლოგიკური ოპერაცია.
      შიფრაციაში გამოიყენება ტექსტის გასაღებთან
      კომბინირებისთვის. იგივე ოპერაციით ხდება გაშიფვრაც.</p>

      <h3>პრინციპი</h3>
      <p><code class="inline">ტექსტი XOR გასაღები = შიფრი</code></p>
      <p><code class="inline">შიფრი XOR გასაღები = ტექსტი</code></p>

      <h3>Python კოდი — გასაღები ცნობილია</h3>
      <pre><code>key = 0x41
encrypted = [0x07, 0x2d, 0x2d, 0x28, 0x60, 0x18, 0x0e, 0x27, 0x3c]
result = ''.join(chr(b ^ key) for b in encrypted)
print(result)</code></pre>

      <h3>Python კოდი — გასაღები უცნობია</h3>
      <pre><code>encrypted = [0x07, 0x2d, 0x2d, 0x28, 0x60]

for key in range(256):
    result = ''.join(chr(b ^ key) for b in encrypted)
    if result.startswith("FLAG"):
        print(f"Key: {key}, Result: {result}")</code></pre>

      <h3>მაგალითი</h3>
      <p>გასაღები <code class="inline">0x41</code>, შედეგი: <code class="inline">FLAG{xor}</code></p>
    `
  },
  {
    id: 'double_encoded',
    title: 'Double Encoded Stego',
    badge: 'intermediate',
    content: `
      <h3>რა არის Double Encoded?</h3>
      <p>LSB-ით ამოღებული ტექსტი დამატებით Base64-ით კოდირებულია.
      ორი ნაბიჯი სჭირდება flag-ის მისაღებად.</p>

      <h3>ნაბიჯი 1 — LSB ამოღება</h3>
      <p>იგივე Python კოდი გამოიყენე. მიიღებ:</p>
      <code class="inline">RkxBR3tiYXNlNjRfc3RlZ299</code>

      <h3>ნაბიჯი 2 — Base64 გაშიფვრა</h3>
      <pre><code>import base64
encoded = "RkxBR3tiYXNlNjRfc3RlZ299"
print(base64.b64decode(encoded).decode())
# output: FLAG{base64_stego}</code></pre>

      <p>ან browser console-ში:</p>
      <code class="inline">atob("RkxBR3tiYXNlNjRfc3RlZ299")</code>

      <h3>მაგალითი</h3>
      <p>LSB output: <code class="inline">RkxBR3tiYXNlNjRfc3RlZ299</code></p>
      <p>Base64 decode: <code class="inline">FLAG{base64_stego}</code></p>
    `
  },
  {
    id: 'split_flag',
    title: 'Split Flag — RGB არხები',
    badge: 'advanced',
    content: `
      <h3>რა არის Split Flag?</h3>
      <p>flag სამ ნაწილადაა გაყოფილი სურათის R, G, B
      არხებში ცალ-ცალკე. სამივე ამოიღე და შეაერთე.</p>

      <h3>Python კოდი</h3>
      <pre><code>from PIL import Image

def extract_channel_lsb(image_path, channel):
    img = Image.open(image_path).convert("RGB")
    pixels = list(img.getdata())
    bits = []
    for pixel in pixels:
        bits.append(pixel[channel] & 1)
    chars = []
    for i in range(0, len(bits), 8):
        byte = bits[i:i+8]
        char = chr(int(''.join(map(str, byte)), 2))
        if char == '\0':
            break
        chars.append(char)
    return ''.join(chars)

r = extract_channel_lsb("challenge.png", 0)
g = extract_channel_lsb("challenge.png", 1)
b = extract_channel_lsb("challenge.png", 2)
print(r + g + b)</code></pre>

      <h3>მაგალითი</h3>
      <p>R: <code class="inline">FLAG{</code> + G: <code class="inline">split_</code> + B: <code class="inline">flag}</code></p>
      <p>შედეგი: <code class="inline">FLAG{split_flag}</code></p>
    `
  },
  {
    id: 'multilayer',
    title: 'Multi-Layer სტეგო',
    badge: 'advanced',
    content: `
      <h3>რა არის Multi-Layer?</h3>
      <p>ერთ სურათში რამდენიმე ფენაზე იმალება ინფორმაცია —
      LSB-ში ერთი შეტყობინება, RGB არხში მეორე.</p>

      <h3>სტრატეგია</h3>
      <p>1. ჯერ ყველა LSB ამოიღე</p>
      <p>2. შემდეგ თითოეული RGB არხი ცალ-ცალკე გაანალიზე</p>
      <p>3. ორივე შეტყობინება ცალ-ცალკე წაიკითხე</p>

      <h3>Python კოდი</h3>
      <pre><code>from PIL import Image

def extract_all_layers(image_path):
    img = Image.open(image_path).convert("RGB")
    pixels = list(img.getdata())

    all_bits = []
    for pixel in pixels:
        for channel in pixel:
            all_bits.append(channel & 1)

    r_bits = [pixel[0] & 1 for pixel in pixels]

    return all_bits, r_bits

all_bits, r_bits = extract_all_layers("challenge.png")
print("All channels:", all_bits[:24])
print("R channel:", r_bits[:8])</code></pre>

      <h3>რჩევა</h3>
      <p><code class="inline">stegsolve</code> ან <code class="inline">stegseek</code> ხელსაწყოები სცადე.</p>
    `
  }
];
let activeFilter = 'all';

function filterLessons(difficulty, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  activeFilter = difficulty;
  renderSidebar();
}

function renderSidebar() {
  const list = document.getElementById('lesson-list');

  const order = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
  let sorted = [...lessons].sort((a, b) => (order[a.badge] || 99) - (order[b.badge] || 99));

  if (activeFilter !== 'all') {
    sorted = sorted.filter(l => l.badge === activeFilter);
  }

  list.innerHTML = sorted.map(l => `
    <div class="lesson-item ${l.id === activeLesson ? 'active' : ''}"
         onclick="loadLesson('${l.id}')">
      <span class="badge badge-${l.badge}">${l.badge}</span>
      <p class="mt-8">${l.title}</p>
    </div>
  `).join('');
}

function loadLesson(id) {
  activeLesson = id;
  const lesson = lessons.find(l => l.id === id);
  renderSidebar();

  document.getElementById('lesson-body').innerHTML = `
    <div class="lesson-card">
      <div class="lesson-header">
        <span class="badge badge-${lesson.badge}">${lesson.badge}</span>
        <h2 class="mt-8">${lesson.title}</h2>
      </div>
      <div class="lesson-text mt-16">
        ${lesson.content}
      </div>
      <button class="btn btn-primary mt-24"
        onclick="location.href='challenges.html'">
        დავიწყო CHALLENGE →
      </button>
    </div>
  `;
}

// Firestore-იდან lessons-ის ჩატვირთვა
async function loadFirestoreLessons() {
  try {
    const res = await fetch(`${API}/api/lesson`);
    const data = await res.json();

    if (!data || data.length === 0) return;

    data.forEach(l => {
      const existing = lessons.findIndex(e => e.id === l.id);
      if (existing !== -1) {
        lessons[existing] = { id: l.id, title: l.title, badge: l.badge, content: l.content };
      } else {
        lessons.push({ id: l.id, title: l.title, badge: l.badge, content: l.content });
      }
    });

    renderSidebar();
    loadLesson(activeLesson);

  } catch (err) {
    console.error("Lessons ჩატვირთვა ვერ მოხერხდა", err);
  }
}

let activeLesson = lessons[0].id;
renderSidebar();
loadLesson(activeLesson);
loadFirestoreLessons();