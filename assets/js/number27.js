
(() => {
  const grid = document.getElementById('grid27');
  const timerEl = document.getElementById('timer27');
  const startBtn = document.getElementById('start27');

  let order = [];
  let next = 1;
  let running = false;
  let startTime = 0;
  let best = parseFloat(localStorage.getItem('hkid.v1.n27.best') || '0');

  function start(){
    order = shuffle([...Array(27)].map((_,i)=>i+1));
    grid.innerHTML='';
    order.forEach(n => {
      const b = document.createElement('button');
      b.className='ncell';
      b.textContent=String(n);
      b.dataset.n=String(n);
      grid.appendChild(b);
    });
    next = 1; running = true; startTime = performance.now();
    updateTimer();
  }

  function updateTimer(){
    if (!running) return;
    const t = (performance.now() - startTime)/1000;
    timerEl.textContent = `Time: ${t.toFixed(1)}s • Best: ${best || "—"}`;
    requestAnimationFrame(updateTimer);
  }

  function click(n, el){
    if (!running) return;
    if (n !== next) return;
    el.classList.add('done');
    next++;
    if (next === 28){
      running = false;
      const t = (performance.now() - startTime)/1000;
      if (!best || t < best){
        best = t;
        localStorage.setItem('hkid.v1.n27.best', String(best));
      }
      // award badge
      const badges = HStore.get('badges', []);
      if (!badges.includes('Number 27 Star')){
        badges.push('Number 27 Star'); HStore.set('badges', badges);
      }
      timerEl.textContent = `Time: ${t.toFixed(1)}s • Best: ${best.toFixed(1)}s`;
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
    const b = e.target.closest('.ncell'); if (!b) return;
    click(parseInt(b.dataset.n,10), b);
  });
  startBtn.addEventListener('click', start);
  window.addEventListener('DOMContentLoaded', () => { /* render empty grid */ });
})();
