// Shared by the bill page and the rates page.
const PRODUCTS = [
  // tint — each item keeps its own colour band on the bill, like the sheet
  { id: 'rfcl',  name: 'RFCL Urea (NFL)',  unit: '45 kg',   rate: 237,  tint: '#f3f9f0' },
  { id: 'iffco', name: 'IFFCO Urea',       unit: '45 kg',   rate: 258,  tint: '#fdfbee' },
  { id: 'dap',   name: 'DAP',              unit: '50 kg',   rate: 1278, tint: '#f2f7fc' },
  { id: 'fact',  name: 'Factamfas',        unit: '50 kg',   rate: 1906, tint: '#fbf2f3' },
  { id: 'nano',  name: 'IFFCO Nano Urea',  unit: '½ litre', rate: 205,  tint: '#f6f3fb' }
];

const GST = 0.025;    // CGST and SGST, 2.5% each

const money = n => '₹' + n.toLocaleString('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const round2 = n => Math.round(n * 100) / 100;
const product = id => PRODUCTS.find(p => p.id === id);

// a rate changed on the rates page is remembered; otherwise the standard one
const rateKey = id => `mf.rate2.${id}`;

function getRate(id) {
  const saved = Number(localStorage.getItem(rateKey(id)));
  return saved > 0 ? saved : product(id).rate;
}

function setRate(id, value) {
  localStorage.setItem(rateKey(id), value);
}

function clearRates() {
  PRODUCTS.forEach(p => localStorage.removeItem(rateKey(p.id)));
}
