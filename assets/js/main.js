
(() => {
  const STORAGE_KEY = 'hkid.v1';
  const store = {
    _read() {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
      catch { return {}; }
    },
    _write(v) { localStorage.setItem(STORAGE_KEY, JSON.stringify(v)); },
    get(path, dflt) {
      const data = this._read();
      return path.split('.').reduce((a, k) => (a && a[k] !== undefined) ? a[k] : undefined, data) ?? dflt;
    },
    set(path, value) {
      const data = this._read();
      const keys = path.split('.'); let cur = data;
      keys.slice(0, -1).forEach(k => cur = (cur[k] = cur[k] || {}));
      cur[keys[keys.length-1]] = value;
      this._write(data);
    }
  };
  window.HStore = store;

  // Kid-friendly jokes (no aliens)
  const jokes = [
    "Why did the banana go to the doctor? It wasn’t peeling well!",
    "What do you call cheese that isn’t yours? Nacho cheese!",
    "Why did the cookie go to the doctor? Because it felt crummy!",
    "Why did the teddy bear say no to dessert? Because it was stuffed!",
    "What do you call a dog magician? A labra-cadabra-dor!",
    "Why did the student eat his homework? Because the teacher said it was a piece of cake!",
    "Why did the math book look sad? It had too many problems!",
    "What do you call a sleeping bull? A bulldozer!",
    "Why do seagulls fly over the sea? Because if they flew over the bay, they’d be bagels!",
    "What kind of key opens a banana? A mon-key!"
  ];

  function pickJoke() {
    const i = Math.floor(Math.random() * jokes.length);
    return jokes[i];
  }

  function showJoke() {
    const box = document.getElementById('jokeBox');
    if (!box) return;
    box.textContent = pickJoke();
  }
  window.addEventListener('DOMContentLoaded', () => {
    showJoke();
    const btn = document.getElementById('newJokeBtn');
    btn && btn.addEventListener('click', showJoke);

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
