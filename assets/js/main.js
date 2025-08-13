(() => {
    // ---------- tiny key/value store ----------
    const STORAGE_KEY = 'hkid.v1';
    const store = {
        _read() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; } },
        _write(v) { localStorage.setItem(STORAGE_KEY, JSON.stringify(v)); },
        get(path, dflt) {
            const data = this._read();
            return path.split('.').reduce((a, k) => (a && a[k] !== undefined) ? a[k] : undefined, data) ?? dflt;
        },
        set(path, value) {
            const data = this._read();
            const keys = path.split('.'); let cur = data;
            keys.slice(0, -1).forEach(k => cur = (cur[k] = cur[k] || {}));
            cur[keys[keys.length - 1]] = value;
            this._write(data);
        }
    };
    window.HStore = store;

    // ---------- Jokes: kid-safe via JokeAPI + offline fallback ----------
    // NOTE: don't set &type=...; we handle both single and twopart responses.
    const JOKE_URL =
        'https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,religious,political,racist,sexist,explicit&safe-mode';

    const FALLBACK = [
        "Why did the banana go to the doctor? It wasn’t peeling well!",
        "What do you call cheese that isn’t yours? Nacho cheese!",
        "Why did the cookie go to the doctor? Because it felt crummy!",
        "Why did the teddy bear say no to dessert? Because it was stuffed!",
        "What do you call a dog magician? A labra-cadabra-dor!",
        "Why did the student eat his homework? The teacher said it was a piece of cake!",
        "Why did the math book look sad? It had too many problems!",
        "What do you call a sleeping bull? A bulldozer!",
        "Why do seagulls fly over the sea? If they flew over the bay, they’d be bagels!",
        "What kind of key opens a banana? A mon-key!"
    ];

    const jokeBox = document.getElementById('jokeBox');
    const newJokeBtn = document.getElementById('newJokeBtn');

    function showJoke(text) {
        if (jokeBox) jokeBox.textContent = text;
        store.set('lastJoke', text);
    }
    const pick = arr => arr[Math.floor(Math.random() * arr.length)];

    async function loadJoke() {
        // 5s timeout guard — never hang the UI
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 5000);

        try {
            const res = await fetch(JOKE_URL, { cache: 'no-store', signal: ctrl.signal });
            clearTimeout(timer);
            const j = await res.json();

            if (j?.type === 'single' && j.joke) return showJoke(j.joke.trim());
            if (j?.type === 'twopart' && j.setup && j.delivery)
                return showJoke(`${j.setup.trim()} — ${j.delivery.trim()}`);

            // Unexpected shape -> fallback
            showJoke(pick(FALLBACK));
        } catch {
            clearTimeout(timer);
            showJoke(pick(FALLBACK)); // offline / blocked / timeout
        }
    }

    // ---------- boot ----------
    window.addEventListener('DOMContentLoaded', () => {
        // Fast render from cache, then refresh from API
        const cached = store.get('lastJoke');
        if (cached) showJoke(cached);
        loadJoke();
        newJokeBtn && newJokeBtn.addEventListener('click', loadJoke);

        // Render badges on home
        const list = document.getElementById('badgeList');
        if (list) {
            const badges = HStore.get('badges', []);
            list.innerHTML = '';
            badges.forEach(b => {
                const li = document.createElement('li');
                li.textContent = b;
                list.appendChild(li);
            });
        }
    });
})();
