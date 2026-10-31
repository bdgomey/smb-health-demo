# Owner's Ledger

A business health demo by Binary Virtual Solutions. The Overview starts with the owner's cash position and first action. Finance, Marketing, Team and Hiring provide the detail.

All figures describe a fictional Texas home-services company. SAMPLE stays visible throughout the app. There is no connected accounting data, account login or payment service.

## Preview

Open `index.html` in a browser. GitHub Pages serves the `gh-pages` branch at https://bdgomey.github.io/smb-health-demo/.

The static app has no build step. D3 is vendored locally. Google Fonts are optional; system fonts remain available.

## Checks

Use Node.js 24 or newer:

```powershell
npm ci
npm run check
```

Checks cover HTML validation, CSS syntax, sample reconciliation, financial edge cases, status contrast, tabs, keyboard navigation, Show controls and all 15 role/pay combinations. DOM tests simulate layout-dependent SVG text measurements. They do not establish mobile browser layout or device performance.

## Scope

Cash coverage requires dated receipts and payments. Hiring uses a contribution scenario before collection delays, with sample capacity, quotes and illustrative E-Z tax timing. Targets are sample policies. Confirm rates and assumptions before using real business data.

Sample data and calculation definitions are in `index.html`. D3's license is in `d3-LICENSE.txt`.
