# Pre-commit quality checklist

Work through this top to bottom before committing. **Every item must
pass.** If anything fails, fix it. If you can't fix it, the article
isn't ready — don't ship it.

## Content quality (the hard gate)

- [ ] Word count is between 800 and 2200. (Target 1200–2000 for evergreen.)
- [ ] Primary keyword appears in: title, H1, first paragraph (within
      first 100 words), meta description, slug, and at least one H2.
- [ ] At least 5 `<h2>` sections (excluding the FAQ H2).
- [ ] No paragraph is longer than 4 sentences.
- [ ] No bullet list has more than 7 items without an intro paragraph.
- [ ] No "AI tells" in the body: "delve into", "navigating the
      landscape", "in the realm of", "ever-evolving", "tapestry",
      "unleash", "embark on a journey", "let's explore", "in today's
      world", "in conclusion", "It's important to note that". Rewrite
      or delete.
- [ ] Specific numbers used at least 3 times (sample sizes, percentages,
      doses from literature, years, half-lives). Vague "many studies"
      / "research has shown" is replaced with cited specifics.
- [ ] Article has a genuine point of view or organizing insight.
      Random Wikipedia rehash is rejected.

## Citations (no fabrication)

- [ ] At least 3 inline citations linked to real URLs.
- [ ] At least 2 of those are tier-1 sources from SOURCES.md (PubMed,
      ClinicalTrials.gov, peer-reviewed journals).
- [ ] Every cited URL has been WebFetch-verified to load and contain
      the claimed finding. **No fabricated DOIs or hallucinated paper
      titles, ever.**
- [ ] Citations include enough metadata to be checkable (author or
      first-author surname, year or journal, sample size or trial
      phase where relevant).

## SEO & schema

- [ ] `<title>` is 50–60 characters and ends with " | Zurich Biotech".
- [ ] `<meta name="description">` is 150–160 characters.
- [ ] `<link rel="canonical">` points to the exact `/resources/<slug>/`
      URL with trailing slash.
- [ ] OG image URL resolves (file exists in `/assets/`).
- [ ] JSON-LD parses as valid JSON. (Mentally lint: balanced braces,
      escaped quotes inside strings, no trailing commas.)
- [ ] `FAQ_JSONLD` and `FAQ_HTML` contain the same Q&A set in the
      same order. If they diverge, Google flags it as deceptive.
- [ ] Article schema has correct `datePublished`, `dateModified`,
      `articleSection`, and `inLanguage: "en"`.
- [ ] Breadcrumb schema has 3 items: Home → Resources → article.

## Internal linking & navigation

- [ ] At least 3 internal links inside the article body.
- [ ] At least one link to `/dosing-calculator/` if dosing /
      reconstitution is mentioned anywhere.
- [ ] At least one link to a compound anchor on the homepage
      (`/#bpc157-tb500`, `/#ghk-cu`, etc.) when that compound is
      discussed.
- [ ] If another `/resources/<slug>/` article on a related topic
      exists, link to it from this one.
- [ ] Breadcrumb UI matches breadcrumb schema.

## Compliance / safety

- [ ] No human dosing instructions. Discussions of dosing are
      framed as "trial protocols used X mg/kg" or "research models
      typically used …".
- [ ] No medical claims for human conditions. "Studied for X in
      animal models" or "showed Y in Phase 2 trial" — not "treats X".
- [ ] Research-use disclaimer present (the template footer / end-CTA
      handles this).
- [ ] No competitor comparisons that disparage by name.

## File hygiene

- [ ] `resources/<slug>/index.html` exists.
- [ ] Every `{{PLACEHOLDER}}` in the template has been replaced.
      `grep '{{' resources/<slug>/index.html` returns nothing.
- [ ] `sitemap.xml` has been updated with the new URL.
- [ ] `resources/index.html` has a card linking to the new article
      (and the empty-state has been removed if this is the first
      article).
- [ ] `automation/topics.json` has been updated — topic marked
      `done`, `published` field added with today's date and URL.

## Final sanity read

- [ ] Read the article top to bottom one time. Cut anything that
      sounds like filler. If a section adds no information, delete it.
- [ ] If you'd be embarrassed to send this article to a senior
      research scientist as a sample of your work, fix it before
      shipping.
