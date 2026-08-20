// Rate list — the rate can be changed on the number screen and is remembered.
const PRODUCTS = [
  { id: 'rfcl',  name: 'RFCL Urea (NFL)',  unit: '45 kg',   rate: 237 },
  { id: 'iffco', name: 'IFFCO Urea',       unit: '45 kg',   rate: 258 },
  { id: 'dap',   name: 'DAP',              unit: '50 kg',   rate: 1298 },
  { id: 'fact',  name: 'Factamfas',        unit: '50 kg',   rate: 1906 },
  { id: 'nano',  name: 'IFFCO Nano Urea',  unit: '½ litre', rate: 205 }
];

const GST = 0.025;    // CGST and SGST, 2.5% each
const MAX_NOS = 20;   // 1 .. 20 on the number screen

const money = n => '₹' + n.toLocaleString('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const round2 = n => Math.round(n * 100) / 100;
const product = id => PRODUCTS.find(p => p.id === id);

const rateKey = id => `mf.rate2.${id}`;
const rates = {};
PRODUCTS.forEach(p => {
  const saved = Number(localStorage.getItem(rateKey(p.id)));
  rates[p.id] = saved > 0 ? saved : p.rate;
});

let lines = [];      // [{ id, nos }] — in the order she added them
let picking = null;  // product id while the number screen is open

const $ = id => document.getElementById(id);
const linesEl = $('lines'), emptyEl = $('empty');
const picker = $('picker'), itemsEl = $('items'), nosStep = $('nosStep');
const nosGrid = $('nosGrid'), rateInput = $('rateInput');
const pickerTitle = $('pickerTitle'), backBtn = $('back'), addBtn = $('add');

/* ---------- the two picker screens ---------- */

PRODUCTS.forEach(p => {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'item-btn';
  b.dataset.id = p.id;
  b.innerHTML = `<span class="item-name">${p.name}</span>
    <span class="item-meta"><span class="item-rate">₹${p.rate}</span> · ${p.unit}</span>`;
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
  nosStep.hidden = true;
  backBtn.hidden = true;
  itemsEl.querySelectorAll('.item-rate').forEach((el, i) => {
    el.textContent = '₹' + rates[PRODUCTS[i].id];
  });
}

function showNos(id) {
  picking = id;
  const p = product(id);
  pickerTitle.textContent = `${p.name} — how many?`;
  itemsEl.hidden = true;
  nosStep.hidden = false;
  backBtn.hidden = false;
  rateInput.value = rates[id];
  const current = lines.find(l => l.id === id);
  nosGrid.querySelectorAll('.nos-btn').forEach((b, i) => {
    b.setAttribute('aria-pressed', current && current.nos === i + 1 ? 'true' : 'false');
  });
}

rateInput.addEventListener('input', () => {
  if (!picking) return;
  const value = Math.max(0, Number(rateInput.value) || 0);
  rates[picking] = value;
  localStorage.setItem(rateKey(picking), value);
  render();
});

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
  let gAmount = 0, gCgst = 0, gSgst = 0, gTotal = 0;

  lines.forEach(line => {
    const p = product(line.id);
    const amount = round2(rates[line.id] * line.nos);
    const cgst = round2(amount * GST);
    const sgst = round2(amount * GST);
    const total = round2(amount + cgst + sgst);

    gAmount += amount; gCgst += cgst; gSgst += sgst; gTotal += total;

    const li = document.createElement('li');
    li.className = 'line';
    li.innerHTML = `
      <button type="button" class="line-main">
        <span class="top">
          <span class="name">${p.name} <small>${p.unit}</small></span>
          <span class="line-total">${money(total)}</span>
        </span>
        <span class="calc">${line.nos} × ${money(rates[line.id])}</span>
        <span class="figures">
          <span><i>Amount</i>${money(amount)}</span>
          <span><i>CGST 2.5%</i>${money(cgst)}</span>
          <span><i>SGST 2.5%</i>${money(sgst)}</span>
        </span>
      </button>
      <button type="button" class="x" aria-label="Remove ${p.name}">✕</button>`;
    li.querySelector('.line-main').addEventListener('click', () => {
      openPicker();
      showNos(line.id);
    });
    li.querySelector('.x').addEventListener('click', () => removeLine(line.id));
    linesEl.appendChild(li);
  });

  emptyEl.hidden = lines.length > 0;
  $('gAmount').textContent = money(round2(gAmount));
  $('gCgst').textContent = money(round2(gCgst));
  $('gSgst').textContent = money(round2(gSgst));
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
