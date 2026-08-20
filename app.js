// The bill page. Rates are fixed here — they live on items.html.
const MAX_NOS = 20;   // 1 .. 20 on the number screen

let lines = [];      // [{ id, nos }] — in the order she added them
let picking = null;  // product id while the number screen is open

const $ = id => document.getElementById(id);
const linesEl = $('lines'), emptyEl = $('empty');
const picker = $('picker'), itemsEl = $('items'), nosGrid = $('nosGrid');
const pickerTitle = $('pickerTitle'), backBtn = $('back'), addBtn = $('add');

/* ---------- the two picker screens ---------- */

PRODUCTS.forEach(p => {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'item-btn';
  b.innerHTML = `<span class="item-name">${p.name}</span>
    <span class="item-meta"><span class="item-rate"></span> · ${p.unit}</span>`;
  b.addEventListener('click', () => showNos(p.id));
  itemsEl.appendChild(b);
});

for (let n = 1; n <= MAX_NOS; n++) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'nos-btn';
  b.textContent = n;
  b.addEventListener('click', () => setLine(picking, n));
  nosGrid.appendChild(b);
}

function openPicker() {
  picker.hidden = false;
  addBtn.hidden = true;
  showItems();
}

function closePicker() {
  picker.hidden = true;
  addBtn.hidden = false;
  picking = null;
}

function showItems() {
  picking = null;
  pickerTitle.textContent = 'Choose the item';
  itemsEl.hidden = false;
  nosGrid.hidden = true;
  backBtn.hidden = true;
  itemsEl.querySelectorAll('.item-rate').forEach((el, i) => {
    el.textContent = '₹' + getRate(PRODUCTS[i].id);
  });
}

function showNos(id) {
  picking = id;
  pickerTitle.textContent = `${product(id).name} — how many?`;
  itemsEl.hidden = true;
  nosGrid.hidden = false;
  backBtn.hidden = false;
  const current = lines.find(l => l.id === id);
  nosGrid.querySelectorAll('.nos-btn').forEach((b, i) => {
    b.setAttribute('aria-pressed', current && current.nos === i + 1 ? 'true' : 'false');
  });
}

/* ---------- the bill ---------- */

function setLine(id, nos) {
  const line = lines.find(l => l.id === id);
  if (line) line.nos = nos;
  else lines.push({ id, nos });
  closePicker();
  render();
}

function removeLine(id) {
  lines = lines.filter(l => l.id !== id);
  render();
}

function render() {
  linesEl.textContent = '';
  let gTotal = 0;

  lines.forEach(line => {
    const p = product(line.id);
    const rate = getRate(line.id);
    const amount = round2(rate * line.nos);
    const cgst = round2(amount * GST);
    const sgst = round2(amount * GST);
    const total = round2(amount + cgst + sgst);

    gTotal += total;

    const tr = document.createElement('tr');
    tr.style.background = p.tint;
    tr.innerHTML = `
      <td class="l name">${p.name}</td>
      <td class="l unit">${p.unit}</td>
      <td class="c"><button type="button" class="nos">${line.nos}</button></td>
      <td class="r">${money(rate)}</td>
      <td class="r">${money(amount)}</td>
      <td class="r">${money(cgst)}</td>
      <td class="r">${money(sgst)}</td>
      <td class="r row-total">${money(total)}</td>
      <td class="cut"><button type="button" class="x" aria-label="Remove ${p.name}">✕</button></td>`;
    tr.querySelector('.nos').addEventListener('click', () => {
      openPicker();
      showNos(line.id);
    });
    tr.querySelector('.x').addEventListener('click', () => removeLine(line.id));
    linesEl.appendChild(tr);
  });

  emptyEl.hidden = lines.length > 0;
  $('gTotal').textContent = money(round2(gTotal));
}

/* ---------- buttons ---------- */

addBtn.addEventListener('click', openPicker);
$('close').addEventListener('click', closePicker);
backBtn.addEventListener('click', showItems);

$('clear').addEventListener('click', () => {
  lines = [];
  closePicker();
  render();
});

$('print').addEventListener('click', () => window.print());

// bill counter — survives a reload
const NEXT_KEY = 'mf.nextCount';
const counters = $('counters');
const readCount = () => Number(localStorage.getItem(NEXT_KEY)) || 0;
const showCounts = () => { counters.textContent = `Bills: ${readCount()}`; };

$('next').addEventListener('click', () => {
  localStorage.setItem(NEXT_KEY, readCount() + 1);
  lines = [];
  closePicker();
  showCounts();
  render();
});

counters.addEventListener('dblclick', () => {
  localStorage.setItem(NEXT_KEY, 0);
  showCounts();
});

showCounts();
render();
