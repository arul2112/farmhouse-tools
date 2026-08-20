// The rates page — one box per item, saved as it is typed.
const list = document.getElementById('rateList');
const saved = document.getElementById('saved');

PRODUCTS.forEach(p => {
  const li = document.createElement('li');
  li.style.background = p.tint;
  li.innerHTML = `
    <span class="rate-name">${p.name}<small>${p.unit} · standard ₹${p.rate}</small></span>
    <span class="rate-field"><i>₹</i>
      <input type="number" min="0" step="0.01" inputmode="decimal"
        value="${getRate(p.id)}" aria-label="Rate for ${p.name}">
    </span>`;
  const input = li.querySelector('input');
  input.addEventListener('input', () => {
    const value = Math.max(0, Number(input.value) || 0);
    setRate(p.id, value);
    saved.textContent = `Saved ${p.name} at ₹${value}`;
  });
  list.appendChild(li);
});

document.getElementById('reset').addEventListener('click', () => {
  clearRates();
  list.querySelectorAll('input').forEach((input, i) => {
    input.value = PRODUCTS[i].rate;
  });
  saved.textContent = 'Back to the standard rates';
});
