// Shared by every page: menu data store, helpers, mobile nav, and the home page menu explorer.

const CATEGORIES = {
  Starters: '#e9a83b',
  Mains: '#b4441b',
  Biryani: '#7a4a2a',
  Breads: '#c99a5b',
  Desserts: '#c2577a',
  Drinks: '#3f7d4e'
};
const SPICE = ['Mild', 'Medium', 'Hot', 'Very hot'];

// Seed menu. `orders` = portions sold last month (sample data, feeds the analytics page).
const SEED_MENU = [
  { id: 1, name: 'Samosa Chaat', category: 'Starters', price: 9, spice: 1, veg: true, vegan: false, gf: false, available: true, orders: 412, description: 'Crushed potato samosa, chickpea curry, tamarind and mint chutneys, sev.' },
  { id: 2, name: 'Gobi Manchurian', category: 'Starters', price: 11, spice: 2, veg: true, vegan: true, gf: false, available: true, orders: 365, description: 'Crispy cauliflower tossed in a garlic, chili and soy glaze.' },
  { id: 3, name: 'Chicken 65', category: 'Starters', price: 13, spice: 3, veg: false, vegan: false, gf: true, available: true, orders: 498, description: 'Hyderabadi fried chicken with curry leaves and red chili.' },
  { id: 4, name: 'Paneer Tikka', category: 'Starters', price: 14, spice: 1, veg: true, vegan: false, gf: true, available: true, orders: 287, description: 'Tandoor charred cottage cheese, peppers, onion, yogurt marinade.' },
  { id: 5, name: 'Butter Chicken', category: 'Mains', price: 19, spice: 1, veg: false, vegan: false, gf: true, available: true, orders: 640, description: 'Smoked tandoori chicken in a silky tomato and butter sauce.' },
  { id: 6, name: 'Lamb Rogan Josh', category: 'Mains', price: 24, spice: 2, veg: false, vegan: false, gf: true, available: true, orders: 233, description: 'Slow braised lamb shoulder, Kashmiri chili, fennel, ginger.' },
  { id: 7, name: 'Chana Masala', category: 'Mains', price: 15, spice: 1, veg: true, vegan: true, gf: true, available: true, orders: 301, description: 'Chickpeas simmered with onion, tomato and toasted spices.' },
  { id: 8, name: 'Goan Fish Curry', category: 'Mains', price: 22, spice: 2, veg: false, vegan: false, gf: true, available: true, orders: 176, description: 'Gulf grouper in coconut, kokum and tamarind curry.' },
  { id: 9, name: 'Palak Paneer', category: 'Mains', price: 16, spice: 0, veg: true, vegan: false, gf: true, available: true, orders: 258, description: 'Spinach puree, cottage cheese, garlic tadka.' },
  { id: 10, name: 'Hyderabadi Chicken Dum Biryani', category: 'Biryani', price: 20, spice: 2, veg: false, vegan: false, gf: true, available: true, orders: 722, description: 'Basmati and marinated chicken sealed and slow cooked, with raita and salan.' },
  { id: 11, name: 'Goat Biryani', category: 'Biryani', price: 24, spice: 2, veg: false, vegan: false, gf: true, available: true, orders: 344, description: 'Bone-in goat, saffron, fried onion, mint.' },
  { id: 12, name: 'Vegetable Biryani', category: 'Biryani', price: 17, spice: 1, veg: true, vegan: true, gf: true, available: true, orders: 219, description: 'Seasonal vegetables, whole spices, rose water.' },
  { id: 13, name: 'Garlic Naan', category: 'Breads', price: 4, spice: 0, veg: true, vegan: false, gf: false, available: true, orders: 980, description: 'Tandoor baked, garlic butter, cilantro.' },
  { id: 14, name: 'Laccha Paratha', category: 'Breads', price: 5, spice: 0, veg: true, vegan: false, gf: false, available: true, orders: 310, description: 'Flaky layered whole wheat flatbread.' },
  { id: 15, name: 'Gulab Jamun', category: 'Desserts', price: 7, spice: 0, veg: true, vegan: false, gf: false, available: true, orders: 266, description: 'Warm milk dumplings in cardamom syrup.' },
  { id: 16, name: 'Mango Kulfi', category: 'Desserts', price: 8, spice: 0, veg: true, vegan: false, gf: true, available: false, orders: 142, description: 'Slow reduced milk ice cream with Alphonso mango. Seasonal.' },
  { id: 17, name: 'Mango Lassi', category: 'Drinks', price: 6, spice: 0, veg: true, vegan: false, gf: true, available: true, orders: 534, description: 'Yogurt, mango, a pinch of cardamom.' },
  { id: 18, name: 'Masala Chai', category: 'Drinks', price: 4, spice: 0, veg: true, vegan: false, gf: true, available: true, orders: 388, description: 'Assam tea brewed with ginger, cardamom and clove.' }
];

// ponytail: localStorage stands in for a database; swap for fetch() calls once a real API exists.
const STORE_KEY = 'tamarind-menu-v1';
const MenuStore = {
  load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY));
      if (Array.isArray(saved)) return saved;
    } catch (e) { /* storage blocked or corrupt: fall back to seed */ }
    return SEED_MENU.map(item => ({ ...item }));
  },
  save(items) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(items)); } catch (e) { /* in-memory only */ }
  },
  reset() {
    try { localStorage.removeItem(STORE_KEY); } catch (e) { /* nothing stored */ }
    return SEED_MENU.map(item => ({ ...item }));
  }
};

// Escape user-entered text before it goes into innerHTML.
function esc(str) {
  return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
const money = n => '$' + Number(n).toFixed(2).replace(/\.00$/, '');

function dietTags(item) {
  let html = '';
  if (item.vegan) html += '<span class="tag vegan">Vegan</span>';
  else if (item.veg) html += '<span class="tag veg">Vegetarian</span>';
  if (item.gf) html += '<span class="tag gf">Gluten-free</span>';
  if (item.spice > 0) html += `<span class="tag spice">${SPICE[item.spice]}</span>`;
  return html;
}

// Mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
if (navToggle) {
  navToggle.addEventListener('click', () => {
    const open = document.body.classList.toggle('nav-open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
}

// Highlight today's row in the hours table
const hoursRow = document.querySelector(`.hours tr[data-day="${new Date().getDay()}"]`);
if (hoursRow) hoursRow.classList.add('today');

// Home page: menu explorer (filter by category, diet, and search)
const grid = document.getElementById('menu-grid');
if (grid) {
  const menu = MenuStore.load().filter(item => item.available);
  const chipsEl = document.getElementById('category-chips');
  const searchEl = document.getElementById('menu-search');
  const dietEl = document.getElementById('diet-filter');
  const countEl = document.getElementById('menu-count');
  let activeCat = 'All';

  chipsEl.innerHTML = ['All', ...Object.keys(CATEGORIES)]
    .map(c => `<button type="button" class="chip" data-cat="${c}" aria-pressed="${c === 'All'}">${c}</button>`)
    .join('');

  function render() {
    const q = searchEl.value.trim().toLowerCase();
    const diet = dietEl.value;
    const shown = menu.filter(item =>
      (activeCat === 'All' || item.category === activeCat) &&
      (!diet || item[diet]) &&
      (!q || (item.name + ' ' + item.description).toLowerCase().includes(q))
    );
    countEl.textContent = `${shown.length} dish${shown.length === 1 ? '' : 'es'}`;
    grid.innerHTML = shown.length
      ? shown.map(item => `
        <article class="card dish" style="--cat:${CATEGORIES[item.category] || 'var(--accent)'}">
          <div class="dish-head"><h3>${esc(item.name)}</h3><span class="price">${money(item.price)}</span></div>
          <p>${esc(item.description)}</p>
          <div class="tags"><span class="tag">${esc(item.category)}</span>${dietTags(item)}</div>
        </article>`).join('')
      : '<p class="empty">No dishes match those filters. Try clearing the search.</p>';
  }

  chipsEl.addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    activeCat = chip.dataset.cat;
    chipsEl.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', String(c === chip)));
    render();
  });
  searchEl.addEventListener('input', render);
  dietEl.addEventListener('change', render);
  render();
}
