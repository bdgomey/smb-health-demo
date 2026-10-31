# SMB Financial Health (demo)

A phone-first financial health dashboard for a small-business owner. It shows, on one screen, the gap between the bank balance and the business's real health: profit versus cash, money already owed, marketing return, the true cost of each employee, and what one more hire would do.

**All figures are sample data for a fictional Texas home-services company.** Payroll tax rates are 2026 federal and Texas figures; the Texas franchise tax line is the 2026 report threshold ($2.65M). Targets are common rules of thumb, not advice.

## View it

Open `index.html` in a browser, or visit the GitHub Pages site for this repository.

## What's here

| File | What it is |
|------|------------|
| `index.html` | The whole dashboard: page, styles, sample data and calculations in one file |
| `d3.v7.9.0.min.js` | D3 7.9.0, used to draw the charts (ISC license, see `d3-LICENSE.txt`) |
| `.nojekyll` | Tells GitHub Pages to serve the files as they are |

No build step and no server code. Fonts load from Google Fonts; the page still works with system fonts if they don't load.

## Change the numbers

The sample data is the `DATA` object near the top of `index.html` (monthly P&L and cash items, two balance sheets, team roster, marketing channels, tax and cost assumptions, hire options). Every figure on the page is calculated from it in the browser; "How every number is worked out" at the bottom of the page lists each calculation.

Built by Binary Virtual Solutions.
