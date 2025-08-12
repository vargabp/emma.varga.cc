
(() => {
  const form = document.getElementById('bookForm');
  const title = document.getElementById('bookTitle');
  const stars = document.getElementById('bookStars');
  const list = document.getElementById('bookList');

  function load(){
    const items = HStore.get('reading.items', []);
    render(items);
    // badges
    const count = items.length;
    const badges = HStore.get('badges', []);
    if (count >= 1 && !badges.includes('First Book')) badges.push('First Book');
    if (count >= 5 && !badges.includes('Reading Rocket')) badges.push('Reading Rocket');
    if (count >= 10 && !badges.includes('Book Hero')) badges.push('Book Hero');
    HStore.set('badges', badges);
  }

  function render(items){
    list.innerHTML='';
    items.forEach((it, idx) => {
      const li = document.createElement('li');
      li.className='book';
      li.innerHTML = `<span>${escapeHtml(it.title)} <span class="stars">{'★'.repeat(it.stars)}</span></span>
                      <button class="del" data-idx="${idx}">Delete</button>`;
      list.appendChild(li);
    });
  }

  function escapeHtml(s){
    return s.replace(/[&<>"']/g, m => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
    })[m]);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const items = HStore.get('reading.items', []);
    items.push({ title: title.value.trim(), stars: parseInt(stars.value,10) });
    HStore.set('reading.items', items);
    title.value='';
    load();
  });

  list.addEventListener('click', (e) => {
    const b = e.target.closest('.del'); if (!b) return;
    const idx = parseInt(b.dataset.idx,10);
    const items = HStore.get('reading.items', []);
    items.splice(idx,1);
    HStore.set('reading.items', items);
    load();
  });

  window.addEventListener('DOMContentLoaded', load);
})();
