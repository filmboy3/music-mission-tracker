# Music Mission Tracker

A fast, dependency-free public impact page for GitHub Pages.

## Update the page

All changing content lives in `data.json`:

- Add Spotify, Apple Music, YouTube, and playlist URLs under `links`.
- Update album artwork plus the Spotify and Apple Music destinations under `albums`.
- Update the five measurable outcome targets under `missionGoals`.
- Add environmental organizations to `partners`.
- Add each completed donation to `donations` using this shape:

```json
{
  "date": "September 12, 2026",
  "recipient": "Organization name",
  "period": "Q3 2026",
  "amount": 250,
  "proof": "https://example.org/receipt"
}
```

Use only `https://` links. The total, goal percentage, donation count, partner count,
album cards, ledger, and footer links update automatically.

The high-resolution album covers are stored locally in `assets/albums/`, so the
site does not depend on third-party image URLs at runtime.

## Audience data

`stats.json` contains the last verified public Spotify monthly-listener count.
The deployment refreshes that number from the public artist profile on every
publish and once daily. If Spotify is unavailable, the last verified value stays
in place. Monthly listeners are shown as audience context and never advance the
mission progress bars; only verified donations do.

## Publish with GitHub Pages

1. Create a public GitHub repository (suggested name: `music-mission-tracker`).
2. Push this folder to its `main` branch.
3. In **Settings → Pages**, set **Source** to **GitHub Actions**.
4. The included workflow deploys the site on every push to `main`.

The live address will normally be:
`https://YOUR-GITHUB-USERNAME.github.io/music-mission-tracker/`
