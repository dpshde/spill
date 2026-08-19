# SEO watch

Shipped to production **2026-08-19** (`10ea68d`).
Live on `www.spill.cards`. This is a 90-day bet, not a content program.

## What shipped

Static HTML for queries people type (starters, icebreakers, questions):

- `/guides/`
- `/guides/christian-conversation-starters/`
- `/guides/small-group-questions/`
- `/guides/christian-dating-questions/`
- `/guides/youth-group-questions/`
- `/guides/family-faith-questions/`
- `/robots.txt` and `/sitemap.xml`

Card routes (`/c/:slug`) are still the app shell. Do not treat them as indexed content.

## How to judge it

Use Fathom site `NISIXSVQ` (spill.cards) and Search Console if available.
Vercel Web Analytics is not enabled on this project.

| Window     | Success                                                                                                        | Fail                                                                              |
| ---------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Days 1–14  | Guide URLs return 200 without `noindex`. Sitemap is fetchable. `site:spill.cards` starts showing guide titles. | A `/guides/` URL is down, `noindex`, or still missing from the sitemap.           |
| Weeks 3–8  | Recurring **impressions** on `/guides/*`, including at least one non-brand query cluster.                      | Indexed but zero impressions on those URLs by week 8.                             |
| Weeks 8–12 | Clicks to `/guides/*` **and** some of those visits draw a card (`/` or `/c/`).                                 | Clicks with no draws (page is a dead end), or still no non-brand search landings. |

Brand queries (`spill`, `spill.cards`, `spill cards`) do not count as traction.

**Kill date:** 2026-11-17. If there is still no non-brand Google landing on `/guides/`, stop the SEO bet.

## If it fails

Do **not** write more list pages.

| Failure mode            | Next move                                                                                             |
| ----------------------- | ----------------------------------------------------------------------------------------------------- |
| Not indexed             | Fix crawl. Next technical step is unique HTML for `/c/:slug`, not another guide.                      |
| Indexed, no impressions | Query bet was wrong. Use a real Search Console export before touching copy.                           |
| Impressions, no clicks  | Rewrite titles/descriptions only.                                                                     |
| Clicks, no draws        | Conversion: pack-preselected draw above the fold.                                                     |
| Kill date hit           | Leave the pages up. Put effort into shareable card pages and distribution, not more on-site articles. |

## Watcher

A Grok scheduled task checks daily: pages still 200, then Fathom (and GSC if reachable) for Google / `/guides/` landings.

- Stay silent if pages are up and nothing moved.
- Ping a human only on a down URL, clear non-brand traction, or the kill date.

Platform scheduled tasks expire after 7 days. Recreate the same daily watch until 2026-11-17. This file is the source of truth, not the task prompt.
