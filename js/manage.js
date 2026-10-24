// Manage Menu page: mock CRUD over the shared MenuStore (see main.js).

let items = MenuStore.load();

const $ = id => document.getElementById(id);
const form = $('item-form');
const fields = {
  id: $('item-id'), name: $('item-name'), category: $('item-category'), price: $('item-price'),
  description: $('item-desc'), spice: $('item-spice'), available: $('item-available'),
  veg: $('item-veg'), vegan: $('item-vegan'), gf: $('item-gf')
};
const toast = $('toast');
const tbody = $('table-body');

const catOptions = Object.keys(CATEGORIES).map(c => `<option>${c}</option>`).join('');
fields.category.innerHTML = catOptions;
$('table-category').insertAdjacentHTML('beforeend', catOptions);
fields.spice.innerHTML = SPICE.map((s, i) => `<option value="${i}">${s}</option>`).join('');

function say(msg, isError = false) {
  toast.textContent = msg;
  toast.classList.toggle('error', isError);
}

// READ: render the table with search + category filter
function renderTable() {
  const q = $('table-search').value.trim().toLowerCase();
  const cat = $('table-category').value;
  const editingId = Number(fields.id.value);
  const shown = items.filter(it =>
    (!cat || it.category === cat) &&
    (!q || (it.name + ' ' + it.description).toLowerCase().includes(q))
  );
  $('table-count').textContent = `Showing ${shown.length} of ${items.length} dishes`;
  tbody.innerHTML = shown.length ? shown.map(it => `
    <tr class="${it.id === editingId ? 'editing' : ''}">
      <td><b>${esc(it.name)}</b><div class="tags" style="margin-top:4px">${dietTags(it)}</div></td>
      <td>${esc(it.category)}</td>
      <td class="num">${money(it.price)}</td>
      <td><span class="status-dot ${it.available ? '' : 'off'}"></span>${it.available ? 'Available' : 'Sold out'}</td>
      <td class="num"><div class="row-actions">
        <button class="btn btn-ghost btn-sm" type="button" data-edit="${it.id}" aria-label="Edit ${esc(it.name)}">Edit</button>
        <button class="btn btn-danger btn-sm" type="button" data-delete="${it.id}" aria-label="Delete ${esc(it.name)}">Delete</button>
      </div></td>
    </tr>`).join('')
    : '<tr><td colspan="5" class="muted" style="text-align:center;padding:28px">No dishes match.</td></tr>';
}

function resetForm() {
  form.reset();
  fields.id.value = '';
  $('form-title').textContent = 'Add a dish';
  $('submit-btn').textContent = 'Add dish';
  $('cancel-btn').hidden = true;
  renderTable();
}

function readForm() {
  const name = fields.name.value.trim();
  const price = Number(fields.price.value);
  if (!name) return { error: 'Please enter a dish name.', field: fields.name };
  if (!fields.price.value || !(price >= 0.5 && price <= 500)) return { error: 'Price must be between $0.50 and $500.', field: fields.price };
  const dupe = items.find(it => it.name.toLowerCase() === name.toLowerCase() && it.id !== Number(fields.id.value));
  if (dupe) return { error: `"${name}" is already on the menu.`, field: fields.name };
  return {
    data: {
      name, price: Math.round(price * 100) / 100,
      category: fields.category.value,
      description: fields.description.value.trim(),
      spice: Number(fields.spice.value),
      available: fields.available.value === 'true',
      // vegan implies vegetarian
      veg: fields.veg.checked || fields.vegan.checked,
      vegan: fields.vegan.checked,
      gf: fields.gf.checked
    }
  };
}

// CREATE + UPDATE
form.addEventListener('submit', e => {
  e.preventDefault();
  const { data, error, field } = readForm();
  if (error) { say(error, true); field.focus(); return; }
  const editingId = Number(fields.id.value);
  if (editingId) {
    const idx = items.findIndex(it => it.id === editingId);
    items[idx] = { ...items[idx], ...data };
    say(`Updated "${data.name}".`);
  } else {
    const id = items.reduce((max, it) => Math.max(max, it.id), 0) + 1;
    items.push({ id, orders: 0, ...data });
    say(`Added "${data.name}" to ${data.category}.`);
  }
  MenuStore.save(items);
  resetForm();
});

$('cancel-btn').addEventListener('click', () => { resetForm(); say('Edit cancelled.'); });

// Row actions: start an edit (UPDATE) or DELETE
tbody.addEventListener('click', e => {
  const editId = Number(e.target.dataset.edit);
  const deleteId = Number(e.target.dataset.delete);
  if (editId) {
    const it = items.find(x => x.id === editId);
    fields.id.value = it.id;
    fields.name.value = it.name;
    fields.category.value = it.category;
    fields.price.value = it.price;
    fields.description.value = it.description;
    fields.spice.value = it.spice;
    fields.available.value = String(it.available);
    fields.veg.checked = it.veg;
    fields.vegan.checked = it.vegan;
    fields.gf.checked = it.gf;
    $('form-title').textContent = `Edit ${it.name}`;
    $('submit-btn').textContent = 'Save changes';
    $('cancel-btn').hidden = false;
    say('');
    renderTable();
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    fields.name.focus({ preventScroll: true });
  } else if (deleteId) {
    const it = items.find(x => x.id === deleteId);
    if (!confirm(`Delete "${it.name}" from the menu?`)) return;
    items = items.filter(x => x.id !== deleteId);
    MenuStore.save(items);
    if (Number(fields.id.value) === deleteId) resetForm(); else renderTable();
    say(`Deleted "${it.name}".`);
  }
});

$('table-search').addEventListener('input', renderTable);
$('table-category').addEventListener('change', renderTable);
$('reset-btn').addEventListener('click', () => {
  if (!confirm('Replace all changes with the original sample menu?')) return;
  items = MenuStore.reset();
  resetForm();
  say('Menu reset to the sample data.');
});

renderTable();
