// Analytics page: KPIs + four Chart.js charts. Menu charts read the live MenuStore.

const menu = MenuStore.load();
const sales = it => it.price * it.orders;
const usd = n => '$' + Math.round(n).toLocaleString('en-US');

// KPIs
const available = menu.filter(it => it.available);
const best = [...menu].sort((a, b) => b.orders - a.orders)[0];
document.getElementById('kpi-items').textContent = `${available.length} / ${menu.length}`;
document.getElementById('kpi-avg').textContent = menu.length ? money(menu.reduce((s, it) => s + it.price, 0) / menu.length) : '-';
document.getElementById('kpi-revenue').textContent = usd(menu.reduce((s, it) => s + sales(it), 0));
document.getElementById('kpi-top').textContent = best ? best.name : '-';

Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
Chart.defaults.color = '#6e5f53';
Chart.defaults.borderColor = '#eadfd2';
Chart.defaults.maintainAspectRatio = false;

// 1. Monthly revenue (static sample data)
new Chart(document.getElementById('chart-revenue'), {
  type: 'line',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    datasets: [
      { label: 'Dine-in', data: [48200, 46900, 53400, 55100, 57800, 54200, 51600, 52900, 56300], borderColor: '#b4441b', backgroundColor: 'rgba(180,68,27,.12)', fill: true, tension: .35 },
      { label: 'Takeout', data: [21400, 22800, 23100, 24900, 26400, 28800, 30100, 29400, 31200], borderColor: '#e9a83b', backgroundColor: 'rgba(233,168,59,.12)', fill: true, tension: .35 }
    ]
  },
  options: {
    interaction: { mode: 'index', intersect: false },
    scales: { y: { ticks: { callback: v => '$' + v / 1000 + 'k' } } },
    plugins: { tooltip: { callbacks: { label: c => `${c.dataset.label}: ${usd(c.raw)}` } } }
  }
});

// 2. Sales by category (live menu)
const cats = Object.keys(CATEGORIES);
new Chart(document.getElementById('chart-category'), {
  type: 'doughnut',
  data: {
    labels: cats,
    datasets: [{ data: cats.map(c => menu.filter(it => it.category === c).reduce((s, it) => s + sales(it), 0)), backgroundColor: cats.map(c => CATEGORIES[c]), borderColor: '#fff', borderWidth: 2 }]
  },
  options: {
    cutout: '58%',
    plugins: {
      legend: { position: 'right' },
      tooltip: { callbacks: { label: c => `${c.label}: ${usd(c.raw)}` } }
    }
  }
});

// 3. Top 8 dishes by portions sold (live menu)
const topDishes = [...menu].sort((a, b) => b.orders - a.orders).slice(0, 8);
new Chart(document.getElementById('chart-top'), {
  type: 'bar',
  data: {
    // long names wrap onto two lines so the axis doesn't clip them
    labels: topDishes.map(it => {
      const name = it.name.replace('Hyderabadi ', '');
      const cut = name.lastIndexOf(' ', 14);
      return name.length > 14 && cut > 0 ? [name.slice(0, cut), name.slice(cut + 1)] : name;
    }),
    datasets: [{ label: 'Portions', data: topDishes.map(it => it.orders), backgroundColor: topDishes.map(it => CATEGORIES[it.category] || '#b4441b'), borderRadius: 6 }]
  },
  options: { indexAxis: 'y', plugins: { legend: { display: false } }, scales: { y: { grid: { display: false } } } }
});

// 4. Average covers by weekday (static sample data)
new Chart(document.getElementById('chart-days'), {
  type: 'bar',
  data: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      { label: 'Lunch', data: [0, 38, 41, 44, 52, 71, 78], backgroundColor: '#e9a83b', borderRadius: 6 },
      { label: 'Dinner', data: [0, 64, 69, 81, 118, 132, 96], backgroundColor: '#b4441b', borderRadius: 6 }
    ]
  },
  options: { scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true } } }
});
