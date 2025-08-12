
(() => {
  const THEMES = {
    dogman: ["DOGMAN","BOOK","POLICE","PAW","BARK","FRIEND","KIND","READ"],
    sonic: ["SONIC","TAILS","RINGS","RUN","SPEED","BLUE","MOVE","JUMP"],
    minecraft: ["MINECRAFT","STEVE","ALEX","BLOCK","PICKAXE","BUILD","WOOD","SHEEP"],
    cooking: ["COOK","MIX","BAKE","STIR","SUGAR","FLOUR","PAN","CAKE"],
    drawing: ["DRAW","PENCIL","SKETCH","LINE","COLOR","ART","PAPER","SHAPE"]
  };

  const DIRS = [
    [0,1],[1,0],[0,-1],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]
  ];

  const gridEl = document.getElementById('wsGrid');
  const listEl = document.getElementById('wordList');
  const progEl = document.getElementById('wsProgress');
  const themeSel = document.getElementById('themeSelect');
  const sizeSel = document.getElementById('sizeSelect');
  const newBtn = document.getElementById('newWS');

  let grid = [];
  let words = [];
  let found = new Set();
  let size = 12;
  let selecting = {start:null, end:null};

  function randLetter(){ return String.fromCharCode(65 + Math.floor(Math.random()*26)); }

  function makeEmpty(n){
    return Array.from({length:n}, () => Array.from({length:n}, () => ''));
  }

  function inBounds(r,c){ return r>=0 && c>=0 && r<size && c<size; }

  function tryPlace(word){
    const attempts = 200;
    for (let t=0;t<attempts;t++){
      const dir = DIRS[Math.floor(Math.random()*DIRS.length)];
      const r0 = Math.floor(Math.random()*size);
      const c0 = Math.floor(Math.random()*size);
      let r=r0, c=c0, ok=true;
      for (let i=0;i<word.length;i++){
        if (!inBounds(r,c)) { ok=false; break; }
        const ch = grid[r][c];
        if (ch!=='' && ch!==word[i]) { ok=false; break; }
        r += dir[0]; c += dir[1];
      }
      if (!ok) continue;
      // place
      r=r0; c=c0;
      for (let i=0;i<word.length;i++){
        grid[r][c] = word[i];
        r += dir[0]; c += dir[1];
      }
      return true;
    }
    return false;
  }

  function fillRandom(){
    for (let r=0;r<size;r++) for (let c=0;c<size;c++){
      if (grid[r][c]==='') grid[r][c] = randLetter();
    }
  }

  function render(){
    gridEl.style.gridTemplateColumns = `repeat(${size}, 28px)`;
    gridEl.innerHTML='';
    for (let r=0;r<size;r++){
      for (let c=0;c<size;c++){
        const d = document.createElement('div');
        d.className = 'ws-cell';
        d.dataset.r = r; d.dataset.c = c;
        d.textContent = grid[r][c];
        gridEl.appendChild(d);
      }
    }
    listEl.innerHTML = '';
    words.forEach(w => {
      const li = document.createElement('li');
      li.textContent = w;
      li.id = `w-${w}`;
      listEl.appendChild(li);
    });
    updateProgress();
  }

  function updateProgress(){
    progEl.textContent = `${found.size} of ${words.length} found`;
    if (found.size === words.length){
      // award badge
      const badgeName = `Word Search: ${themeSel.value}`;
      const badges = HStore.get('badges', []);
      if (!badges.includes(badgeName)){
        badges.push(badgeName);
        HStore.set('badges', badges);
      }
    }
  }

  function newPuzzle(){
    size = parseInt(sizeSel.value,10);
    grid = makeEmpty(size);
    words = THEMES[themeSel.value].slice(0); // copy
    found = new Set();
    words.sort((a,b)=>b.length-a.length);
    words.forEach(w => tryPlace(w));
    fillRandom();
    render();
  }

  function cellAt(el){
    if (!el || !el.classList.contains('ws-cell')) return null;
    return { r: parseInt(el.dataset.r), c: parseInt(el.dataset.c) };
  }

  function lineCells(a,b){
    const dr = Math.sign(b.r - a.r);
    const dc = Math.sign(b.c - a.c);
    if (dr===0 && dc===0) return [a];
    const cells=[{...a}];
    let r=a.r, c=a.c;
    while (r!==b.r || c!==b.c){
      r+=dr; c+=dc;
      cells.push({r,c});
      if (!inBounds(r,c)) return [];
    }
    return cells;
  }

  function textFromCells(cells){
    return cells.map(p => grid[p.r][p.c]).join('');
  }

  // Selection interactions (click start + click end)
  gridEl.addEventListener('click', (e) => {
    const pos = cellAt(e.target);
    if (!pos) return;
    if (!selecting.start){
      selecting.start = pos;
      highlight([pos], false);
    } else {
      selecting.end = pos;
      const cells = lineCells(selecting.start, selecting.end);
      clearSel();
      if (!cells.length) { selecting={start:null,end:null}; return; }
      const text = textFromCells(cells);
      const rev = text.split('').reverse().join('');
      let hit = null;
      for (const w of words){
        if (text===w || rev===w){ hit = w; break; }
      }
      if (hit){
        markFound(cells, hit);
      }
      selecting = {start:null, end:null};
    }
  });

  function highlight(cells, add=true){
    // optional visual while selecting (kept simple for clicks only)
    if (!add) clearSel();
    for (const p of cells){
      const idx = p.r*size + p.c;
      gridEl.children[idx].classList.add('sel');
    }
  }
  function clearSel(){
    Array.from(gridEl.children).forEach(ch => ch.classList.remove('sel'));
  }
  function markFound(cells, word){
    cells.forEach(p => {
      const idx = p.r*size + p.c;
      gridEl.children[idx].classList.add('found');
    });
    found.add(word);
    const li = document.getElementById(`w-${word}`);
    if (li) li.classList.add('found');
    updateProgress();
    // persist progress
    const save = HStore.get('ws', {});
    save[themeSel.value] = Array.from(found);
    HStore.set('ws', save);
  }

  // Restore progress if any
  function restore(){
    const save = HStore.get('ws', {});
    const got = save[themeSel.value];
    if (!got) return;
    got.forEach(w => found.add(w));
    // We don't know the original positions to recolor, so we just mark the list items
    // (clearest for a 6yo). New sessions recolor on new solves.
    got.forEach(w => {
      const li = document.getElementById(`w-${w}`);
      li && li.classList.add('found');
    });
    updateProgress();
  }

  newBtn.addEventListener('click', () => { newPuzzle(); });
  themeSel.addEventListener('change', () => { newPuzzle(); });
  sizeSel.addEventListener('change', () => { newPuzzle(); });

  window.addEventListener('DOMContentLoaded', () => { newPuzzle(); setTimeout(restore, 20); });
})();
