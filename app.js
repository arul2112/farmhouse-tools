// Rate list — same standard rates as the sheet.
const PRODUCTS = [
  { id: 'dap',  name: 'DAP',       rate: 1278, max: 20 },
  { id: 'iffco', name: 'IFFCO',    rate: 258,  max: 16 },
  { id: 'nano', name: 'Nano Urea', rate: 205,  max: 16 }
];

const DEFAULT_MAX = 16;   // 0 .. max clickable, per product
const GST = 0.025;    // CGST and SGST, 2.5% each

const money = n => '₹' + n.toLocaleString('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const round2 = n => Math.round(n * 100) / 100;

const table = document.getElementById('bill');
const tfoot = table.tFoot;
const counts = {};
const rates = {};

// edited rates are remembered, so Refresh / Next never resets them
const rateKey = id => `mf.rate.${id}`;

PRODUCTS.forEach(p => {
  counts[p.id] = 0;
  const saved = Number(localStorage.getItem(rateKey(p.id)));
  rates[p.id] = saved > 0 ? saved : p.rate;
  table.insertBefore(buildRow(p), tfoot);
});

function buildRow(p) {
  const body = document.createElement('tbody');
  body.dataset.id = p.id;

  const row = document.createElement('tr');
  row.className = 'figures';

  // left-hand number selector, on the same line as the figures
  const selCell = document.createElement('td');
  selCell.className = 'selector';
  const chips = document.createElement('div');
  chips.className = 'chips';
  chips.setAttribute('role', 'group');
  chips.setAttribute('aria-label', `Number of ${p.name} bags`);

  const max = p.max || DEFAULT_MAX;
  for (let n = 0; n <= max; n++) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip' + (n === 0 ? ' zero' : '');
    chip.textContent = n;
    chip.dataset.n = n;
    chip.setAttribute('aria-pressed', n === 0 ? 'true' : 'false');
    chip.addEventListener('click', () => select_(p.id, n));
    chips.appendChild(chip);
  }
  selCell.appendChild(chips);

  const parser = document.createElement('table');
  parser.innerHTML = `<tr>
    <td class="l item" data-label="Item">${p.name}</td>
    <td class="r rate-cell" data-label="Rate">
      <span class="rupee">₹</span><input type="number" class="rate-input" data-cell="rate"
        min="0" step="0.01" value="${rates[p.id]}" aria-label="Rate for ${p.name}">
    </td>
    <td class="c nos-cell" data-label="Nos"><span class="nos-value" data-cell="nos">0</span></td>
    <td class="r" data-label="Amount" data-cell="amount">₹0.00</td>
    <td class="r" data-label="CGST 2.5%" data-cell="cgst">₹0.00</td>
    <td class="r" data-label="SGST 2.5%" data-cell="sgst">₹0.00</td>
    <td class="r row-total" data-label="Total" data-cell="total">₹0.00</td></tr>`;

  row.appendChild(selCell);
  row.append(...parser.rows[0].cells);
  body.appendChild(row);

  // mobile picker — same choices as the chips, shown instead of them on small screens
  const select = document.createElement('select');
  select.className = 'nos-select';
  select.setAttribute('aria-label', `Number of ${p.name} bags`);
  for (let n = 0; n <= max; n++) {
    const opt = document.createElement('option');
    opt.value = n;
    opt.textContent = n;
    select.appendChild(opt);
  }
  select.addEventListener('change', () => select_(p.id, Number(select.value)));
  row.querySelector('.nos-cell').appendChild(select);

  const rateInput = row.querySelector('.rate-input');
  rateInput.addEventListener('input', () => {
    const value = Math.max(0, Number(rateInput.value) || 0);
    rates[p.id] = value;
    localStorage.setItem(rateKey(p.id), value);
    render();
  });

  return body;
}

function select_(id, n) {
  counts[id] = n;
  render();
}

function render() {
  let gAmount = 0, gCgst = 0, gSgst = 0, gTotal = 0;

  PRODUCTS.forEach(p => {
    const n = counts[p.id];
    const amount = round2(rates[p.id] * n);
    const cgst = round2(amount * GST);
    const sgst = round2(amount * GST);
    const total = round2(amount + cgst + sgst);

    gAmount += amount;
    gCgst += cgst;
    gSgst += sgst;
    gTotal += total;

    const body = document.querySelector(`tbody[data-id="${p.id}"]`);
    body.querySelector('[data-cell="nos"]').textContent = n;
    body.querySelector('[data-cell="amount"]').textContent = money(amount);
    body.querySelector('[data-cell="cgst"]').textContent = money(cgst);
    body.querySelector('[data-cell="sgst"]').textContent = money(sgst);
    body.querySelector('[data-cell="total"]').textContent = money(total);

    body.querySelector('.nos-select').value = n;
    body.querySelectorAll('.chip').forEach(chip => {
      chip.setAttribute('aria-pressed', Number(chip.dataset.n) === n ? 'true' : 'false');
    });
  });

  document.getElementById('gAmount').textContent = money(round2(gAmount));
  document.getElementById('gCgst').textContent = money(round2(gCgst));
  document.getElementById('gSgst').textContent = money(round2(gSgst));
  document.getElementById('gTotal').textContent = money(round2(gTotal));
}

document.getElementById('reset').addEventListener('click', () => {
  PRODUCTS.forEach(p => (counts[p.id] = 0));
  render();
});

// "Next" count — survives the reload via localStorage
const NEXT_KEY = 'mf.nextCount';
const counters = document.getElementById('counters');

const readCount = () => Number(localStorage.getItem(NEXT_KEY)) || 0;
const showCounts = () => { counters.textContent = `Next: ${readCount()}`; };

document.getElementById('refresh').addEventListener('click', () => window.location.reload());

// "Next" finishes the current bill: counts it, then reloads a fresh one
document.getElementById('next').addEventListener('click', () => {
  localStorage.setItem(NEXT_KEY, readCount() + 1);
  window.location.reload();
});

counters.addEventListener('dblclick', () => {
  localStorage.setItem(NEXT_KEY, 0);
  showCounts();
});

showCounts();

document.getElementById('print').addEventListener('click', () => window.print());

render();
