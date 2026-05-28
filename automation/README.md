# Automation — daily article pipeline

A scheduled Claude Code Web session generates one research-backed,
SEO-tight article per run.

## Files in this directory

- **`TRIGGER_PROMPT.md`** — the prompt you paste into the scheduled
  trigger. Short. Tells the session to read everything else.
- **`PLAYBOOK.md`** — the workflow Claude follows end-to-end every
  run. The bulk of the IP. Edit this to change voice, structure,
  citation rules, internal-linking strategy, anything content-related.
- **`SOURCES.md`** — the source-authority hierarchy. Tier 1 is required,
  tier 4 is forbidden. Edit when you find new authoritative sources
  or want to ban a class of sites.
- **`QUALITY_CHECKLIST.md`** — the pre-commit gate. Every checkbox
  must pass before the article ships.
- **`topics.json`** — the article queue. ~25 topics seeded, ordered
  by priority (calculator companion → compound deep-dives → how-tos
  → comparisons → city pages). Refill when you run low.

## Setting up the scheduled trigger

1. Open Claude Code on the Web → your zurichbiotech.com session.
2. Settings → Triggers → New scheduled trigger.
3. Frequency: start daily. You can increase to twice-daily after
   the first 10 articles have shipped cleanly.
4. Branch: `main` (the session creates its own working branch
   each run).
5. Prompt: paste the entire contents of `TRIGGER_PROMPT.md`.
6. Save.

## What each run produces

A single PR merged into main containing:

- `resources/<slug>/index.html` — the article
- `sitemap.xml` — one new `<url>` block
- `resources/index.html` — one new article card
- `automation/topics.json` — topic marked `done` with publish date

Then Vercel auto-deploys and the article goes live in 1–2 minutes.

## When to refill `topics.json`

When fewer than 10 pending topics remain. Add new entries with the
same shape as the existing ones — at minimum `id`, `slug`, `title`,
`primary_keyword`, `secondary_keywords`, `category`, `priority`,
`intent`, `status: "pending"`.

Good topic sources:
- Google Search Console → Performance → Queries — anything where
  you're showing impressions but not clicks is a topic gap.
- Reddit r/Peptides, r/PeptideShop — what people actually ask.
- AnswerThePublic.com → "peptides" — question variants.
- Competitor blog audits (Peptide Sciences, Limitless Life, etc.)
  — what they cover and you don't.

## Tuning the voice or rules

All voice/style/rule changes go in `PLAYBOOK.md`. The next session
picks up the changes automatically.

Common tweaks you might want over time:
- Change word-count target (now 1200–2000).
- Add a banned phrase to the "AI tells" list.
- Require a new schema type.
- Change internal-link minimum count.
- Tighten or loosen the city-angle requirement.

## What this pipeline deliberately does NOT do

- Doesn't post to social media. Add separately if wanted.
- Doesn't generate images. The OG image is reused from `/assets/`.
  If you want per-article hero images, add an image-generation step
  to PLAYBOOK.md step 5.
- Doesn't email anyone on publish. Add a webhook step to step 13
  if you want Slack / email notifications.
- Doesn't fact-check across multiple AI passes. The single quality
  checklist is the gate. If output quality drifts, tighten the
  checklist — don't add more passes.
