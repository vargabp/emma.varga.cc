
(() => {
  const EMOJI = ['🐶','📚','✏️','🎮','🍪','🎨','🧁','🐾','⭐','🧱','🍕','🧩'];
  const GRID = 6*4; // 24 cards -> 12 pairs

  const grid = document.getElementById('memoryGrid');
  const stats = document.getElementById('memoryStats');
  const resetBtn = document.getElementById('resetMemory');

  let deck = [];
  let open = [];
  let moves = 0;
  let best = parseInt(localStorage.getItem('hkid.v1.memory.best') || '0', 10);

  function newGame(){
    const pairs = EMOJI.slice(0, GRID/2);
    deck = shuffle([...pairs, ...pairs]).map((icon, idx) => ({
      id: idx, icon, open:false, matched:false
    }));
    grid.innerHTML='';
    deck.forEach(card => {
      const d = document.createElement('button');
      d.className='cardlet';
      d.setAttribute('aria-label','card');
      d.dataset.id = String(card.id);
      d.textContent='?';
      grid.appendChild(d);
    });
    open = []; moves = 0;
    render();
  }

  function render(){
    stats.textContent = `Moves: ${moves} • Best: ${best || "—"}`;
    Array.from(grid.children).forEach(btn => {
      const card = deck[parseInt(btn.dataset.id,10)];
      if (card.matched || card.open){ btn.classList.add(card.matched ? 'matched' : 'open'); btn.textContent = card.icon; }
      else { btn.classList.remove('matched','open'); btn.textContent='?'; }
    });
  }

  function clickCard(id){
    const card = deck[id];
    if (card.matched || card.open) return;
    card.open = true;
    open.push(card);
    if (open.length === 2){
      moves++;
      const [a,b] = open;
      if (a.icon === b.icon){
        a.matched = b.matched = true;
        open = [];
        checkWin();
      } else {
        setTimeout(() => {
          a.open = b.open = false;
          open = []; render();
        }, 600);
      }
    }
    render();
  }

  function checkWin(){
    if (deck.every(c => c.matched)){
      if (!best || moves < best){
        best = moves;
        localStorage.setItem('hkid.v1.memory.best', String(best));
      }
      // award badge
      const badges = HStore.get('badges', []);
      if (!badges.includes('Memory Master')){
        badges.push('Memory Master'); HStore.set('badges', badges);
      }
    }
  }

  function shuffle(a){
    for (let i=a.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [a[i],a[j]] = [a[j],a[i]];
    }
    return a;
  }

  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('.cardlet'); if (!btn) return;
    clickCard(parseInt(btn.dataset.id,10));
  });
  resetBtn.addEventListener('click', newGame);

  window.addEventListener('DOMContentLoaded', newGame);
})();
