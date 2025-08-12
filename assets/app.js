// --- UTIL ---
const qs = s => document.querySelector(s);
const qsa = s => [...document.querySelectorAll(s)];
const speak = (txt) => {
    if (!state.voice) return;
    try {
        const u = new SpeechSynthesisUtterance(txt);
        u.rate = 1; u.pitch = 1.1;
        speechSynthesis.cancel(); speechSynthesis.speak(u);
    } catch { }
};
const beep = (id) => { if (!state.sound) return; try { qs(id).currentTime = 0; qs(id).play(); } catch { } };
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const save = () => localStorage.setItem('pls', JSON.stringify(state));
const load = () => { try { return JSON.parse(localStorage.getItem('pls')) || {} } catch { return {} } };

const state = Object.assign({ sound: true, voice: false, colorScore: 0, countScore: 0 }, load());

// --- NAV ---
function openPanel(id) {
    qsa('.panel').forEach(p => p.classList.remove('active'));
    if (id) { qs('#home').style.display = 'none'; qs('#' + id).classList.add('active'); }
    else { qs('#home').style.display = 'grid'; }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
qs('#btn-home').addEventListener('click', () => openPanel(null));
qsa('[data-open]').forEach(b => b.addEventListener('click', () => openPanel(b.dataset.open)));

// --- SETTINGS ---
const dlg = qs('#grownups');
qs('#btn-grownups').addEventListener('click', () => dlg.showModal());
let seq = [];
dlg.addEventListener('keydown', (e) => {
    if (['1', '2', '3'].includes(e.key)) { seq.push(e.key); if (seq.join('') === '123') { qs('#settings').style.display = 'block'; } }
});
dlg.addEventListener('close', () => { seq = []; qs('#settings').style.display = 'none'; });

qs('#opt-voice').checked = !!state.voice;
qs('#opt-sound').checked = !!state.sound;
qs('#opt-voice').addEventListener('change', e => { state.voice = e.target.checked; save(); });
qs('#opt-sound').addEventListener('change', e => { state.sound = e.target.checked; save(); });
qs('#reset-progress').addEventListener('click', () => { state.colorScore = 0; state.countScore = 0; save(); updateScores(); alert('Scores reset'); });

qs('#btn-sound').setAttribute('aria-pressed', state.sound);
qs('#btn-voice').setAttribute('aria-pressed', state.voice);
qs('#btn-sound').addEventListener('click', () => { state.sound = !state.sound; save(); qs('#btn-sound').setAttribute('aria-pressed', state.sound); });
qs('#btn-voice').addEventListener('click', () => { state.voice = !state.voice; save(); qs('#btn-voice').setAttribute('aria-pressed', state.voice); });

// --- COLOR POP ---
const COLORS = [
    { name: 'red', hex: '#ef4444' }, { name: 'orange', hex: '#f59e0b' }, { name: 'yellow', hex: '#fde047' },
    { name: 'green', hex: '#22c55e' }, { name: 'blue', hex: '#38bdf8' }, { name: 'purple', hex: '#a78bfa' }, { name: 'pink', hex: '#f472b6' }
];
let targetColor = null;
function newColorRound() {
    const pool = [...COLORS].sort(() => Math.random() - 0.5).slice(0, 4);
    targetColor = rand(pool);
    qs('#color-prompt').innerHTML = `Tap the <strong style="color:${targetColor.hex}">${targetColor.name}</strong> one!`;
    const wrap = qs('#color-swatches'); wrap.innerHTML = '';
    pool.sort(() => Math.random() - 0.5).forEach(c => {
        const div = document.createElement('button');
        div.className = 'swatch'; div.style.background = c.hex; div.setAttribute('aria-label', c.name);
        div.addEventListener('click', () => {
            if (c.name === targetColor.name) { state.colorScore++; updateScores(); speak('Great job!'); beep('#snd-correct'); newColorRound(); }
            else { beep('#snd-wrong'); speak('Try again'); }
        });
        wrap.appendChild(div);
    });
    save();
}
qs('#color-new').addEventListener('click', newColorRound);

// --- DRAW ---
const pad = qs('#pad');
const ctx = pad.getContext('2d');
let drawing = false, last = [0, 0], color = '#ffffff';
function pos(e) { const r = pad.getBoundingClientRect(); const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left; const y = (e.touches ? e.touches[0].clientY : e.clientY) - r.top; return [x * pad.width / r.width, y * pad.height / r.height]; }
function drawto(x, y) { ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = color; ctx.lineWidth = +qs('#brush').value; ctx.beginPath(); ctx.moveTo(...last); ctx.lineTo(x, y); ctx.stroke(); last = [x, y]; }
pad.addEventListener('pointerdown', e => { drawing = true; last = pos(e); });
pad.addEventListener('pointermove', e => { if (drawing) { const [x, y] = pos(e); drawto(x, y); } });
window.addEventListener('pointerup', () => drawing = false);
qsa('[data-color]').forEach(b => b.addEventListener('click', () => { color = b.dataset.color; }));
qs('#clear').addEventListener('click', () => { ctx.clearRect(0, 0, pad.width, pad.height); });
qs('#save-png').addEventListener('click', () => { const a = document.createElement('a'); a.download = 'drawing.png'; a.href = pad.toDataURL('image/png'); a.click(); });

// --- ALPHABET ---
const AG = qs('#alpha-grid');
'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(ch => {
    const b = document.createElement('button'); b.className = 'letter'; b.textContent = ch; b.setAttribute('aria-label', `Letter ${ch}`);
    b.addEventListener('click', () => { speak(ch); b.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.1)' }, { transform: 'scale(1)' }], { duration: 180 }); });
    AG.appendChild(b);
});

// --- COUNTING ---
const things = ['🍎', '🫐', '🍌', '🍊', '🍇', '🍓', '🥕', '🍒', '🧁', '🍪'];
function newCount() {
    const n = Math.floor(Math.random() * 9) + 1; // 1..9
    const t = rand(things); qs('#count-thing').textContent = t;
    const wrap = qs('#count-wrap'); wrap.innerHTML = '';
    for (let i = 0; i < n; i++) { const d = document.createElement('div'); d.className = 'card-num'; d.textContent = t; wrap.appendChild(d); }
    const opts = qs('#count-options'); opts.innerHTML = '';
    const answers = new Set([n]); while (answers.size < 4) { answers.add(Math.max(1, Math.min(10, n + (Math.floor(Math.random() * 5) - 2)))); }
    [...answers].sort(() => Math.random() - 0.5).forEach(num => {
        const b = document.createElement('button'); b.className = 'btn ghost'; b.textContent = num; b.setAttribute('aria-label', `${num}`);
        b.addEventListener('click', () => {
            if (num === n) { state.countScore++; updateScores(); speak('Yes!'); beep('#snd-correct'); newCount(); }
            else { speak('Not quite'); beep('#snd-wrong'); b.animate([{ transform: 'translateX(0px)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0px)' }], { duration: 180 }); }
        });
        opts.appendChild(b);
    });
    save();
}
qs('#count-new').addEventListener('click', newCount);
function updateScores() { qs('#color-score').textContent = state.colorScore; qs('#count-score').textContent = state.countScore; }

// --- STICKERS ---
const stickerList = '⭐ 💫 🌈 🦄 🐼 🐶 🐱 🐵 🐸 🐯 🐰 🐻 🐥 🐳 🦖 🚗 ✈️ 🚀 🏀 ⚽ 🎈 🍕 🍦 🍰 🎵'.split(' ');
const ST = qs('#stickers'); const STAGE = qs('#stage');
function renderStickers() { ST.innerHTML = ''; stickerList.forEach(s => { const b = document.createElement('button'); b.className = 'sticker'; b.textContent = s; b.addEventListener('click', () => addSticker(s, 40 + Math.random() * 260, 40 + Math.random() * 220)); ST.appendChild(b); }); }
function addSticker(char, x, y) {
    const d = document.createElement('div'); d.className = 'placed'; d.textContent = char; d.style.left = x + 'px'; d.style.top = y + 'px'; d.style.fontSize = (36 + Math.random() * 36) + 'px';
    let dragging = false, off = [0, 0];
    d.addEventListener('pointerdown', e => { dragging = true; off = [e.offsetX, e.offsetY]; d.setPointerCapture(e.pointerId); });
    d.addEventListener('pointermove', e => { if (!dragging) return; const r = STAGE.getBoundingClientRect(); const nx = e.clientX - r.left - off[0]; const ny = e.clientY - r.top - off[1]; d.style.left = Math.max(0, Math.min(r.width - 24, nx)) + 'px'; d.style.top = Math.max(0, Math.min(r.height - 24, ny)) + 'px'; });
    d.addEventListener('pointerup', () => dragging = false);
    STAGE.appendChild(d);
}
qs('#stickers-clear').addEventListener('click', () => STAGE.innerHTML = '');

// --- BOOT ---
(function boot() {
    updateScores();
    newColorRound();
    newCount();
    renderStickers();
    openPanel(null);
})();
