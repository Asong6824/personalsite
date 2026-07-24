# Market study definitions

Each `*.study.json` file pins one fixed-period market study. Definitions are
versioned and reference immutable CSV objects by SHA-256. Only definitions with
`"status": "published"` are materialized into the website.

CSV columns:

```text
date,open,high,low,close,adjusted_close,volume
```

Dates must be ascending and within the declared study period. Prices must be
positive and satisfy OHLC bounds. `adjusted_close` and `volume` are optional.

Use `npm run finance:build` to validate and materialize published studies. See
`docs/data-system.md` for the publishing workflow and TOS layout.
