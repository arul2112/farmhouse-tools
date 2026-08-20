# Farmhouse Tools

Quick GST billing sheet for Murugan Farmhouse.

**Live:** https://arul2112.github.io/farmhouse-tools/

Two pages:

- `index.html` — the bill. Tap **+ Add item**, choose the item, tap the number.
  The row is added to a proper bill table: name, weight, nos, rate, amount,
  CGST 2.5%, SGST 2.5%, total. On a phone the table slides sideways. Only the
  grand total sits at the bottom right.
- `items.html` — the rates. The only place a rate can be changed; the bill uses
  whatever is saved here. **Standard rates** puts them all back.

| Item | Rate | Weight |
| --- | --- | --- |
| RFCL Urea (NFL) | ₹237 | 45 kg |
| IFFCO Urea | ₹258 | 45 kg |
| DAP | ₹1278 | 50 kg |
| Factamfas | ₹1906 | 50 kg |
| IFFCO Nano Urea | ₹205 | ½ litre |

- GST 5% (CGST 2.5% + SGST 2.5%) is added on the amount.
- Plain white sheet, ruled like the paper bill; **+ Add item** opens a popup
  for the item and the number. #007fff on the buttons;
  the only other colour is each item's own band on its row.
- Tap the **Nos** button on a row to change it, **✕** to remove the row.
- **Clear** and **Next bill →** sit at the top; Next counts the finished bill
  and starts an empty one.
- Printing is the browser's own Share ▸ Print — the page prints clean.

Items, rates and colours live at the top of `items.js`.
