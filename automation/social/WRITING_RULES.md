# Zurich Biotech content writing rules
Training culture writing context

Operational standing rule for agents and human writers drafting Instagram (and sibling) copy for Zurich Biotech. **This document governs text only: what we talk about and how we write.** The image brief on the Magnific board governs everything visual. Where this file still describes a frame, it is describing the world the words come from, not instructing the camera.

---

## 1. Purpose of this rule

Keep every caption, concept line, seasonal hook, and calendar note inside the training-culture frame. We document ordinary hard training. We do not sell peptides in the voice of ads, challenges, or wellness campaigns.

Use this file when:
- drafting or editing calendar rows
- writing captions from a concept or prompt seed
- deciding whether a seasonal real-world event can enter copy
- checking product presence against lifestyle-first rules

---

## 2. What the brand world talks about

### In (primary topics)
- Training labour: sessions, intervals, mat rounds, long wet rides, gym bays, recovery quiet
- Evidence without bragging: notebooks, logs, screens, whiteboards, scratched plans
- Places that hold hours: basement gyms, kitchens, stairwells, wet streets, temporary race floors
- Crew as proximity: shared thermos, low talk, van doors, between heats
- Prep and fuel as routine: bags, plates, lists, kettle steam
- Seasonal atmosphere as weather and calendar density (see section 6)
- Body marks of work: chalk, tape, smear, breath in cold air - never as transformation porn

### Out (do not write)
- Peptide ads, dosing, reconstitution, injection, stacks, cycles, "protocols" as sales
- Claims, results, before/after, guaranteed outcomes, medical advice
- Sponsor names, partner shoutouts, affiliate language
- New Year resolutions, Black Friday, wellness challenges, "30-day" anything
- Motivational slogans, hustle porn, "no excuses", guru tone
- Hashtag campaigns, emoji cheer, exclamation-driven hype
- Product names in captions (SKU lives in the CSV column only)
- Administration imagery or copy (how to take, when to take, needles as hero)

Training culture is the subject. Product, when present, is a quiet footnote in production - not the sentence the audience reads.

---

## 3. Voice (how we sound)

- Lowercase or sentence case. Prefer lowercase for feed captions.
- Short sentences. Fragments allowed when they feel like a log line.
- No emoji. No hashtags. No exclamation marks.
- No product names in caption text.
- No claims, results, or medical language.
- Concrete over abstract: floor, chalk, rain, kettle, notebook - not "mindset" or "journey".
- Distant warmth: respectful of the work, never cheerleading.
- Multilingual place names stay plain (zurich, albis, limmatquai) without tourism gloss.

Sound like someone who trained, wrote it down, and left. Not like a brand that needs a conversion.

---

## 4. Caption types with examples

Use exactly one type per post. Match type to scene when obvious (kitchen scenes lean kitchen; crew scenes lean crew).

### log
Session residue as record.
- tuesday volume in. legs heavy, sleep later.
- mat rounds counted. hands taped again.
- year-end log page. no summary speech.

### flat observation
A fact about the room, weather, or object. No moral.
- the floor stays wet longer in autumn.
- steam on the mirror means the room worked.
- mud on the cleat is just mud.

### place
Where the hours happened. City and facility as setting, not postcard.
- basement gym, zurich. same smell as always.
- wet climb off the albis. cars indifferent.
- temporary hyrox floor, tape still fresh.

### crew
People nearby without campaign energy.
- same thermos. few words.
- between rounds they sit close without talking much.
- van doors open, jackets in a heap.

### kitchen
Fuel as routine.
- rice, eggs, greens. no plating speech.
- cut lemon, kettle, quiet counter.
- evening plate after mat volume.

If a draft drifts into advice, hype, or product talk, rewrite into one of the five types above.

---

## 5. What we never say

Never in captions, concepts meant for public, or on-image text:
- Product or SKU names (SEMAX+, MOTS-C+, BPC157+TB500, GHK-CU+, RETATRUTIDE+, CJC1295/IPAMORELIN+, or any peer)
- Dosing, administration, injection, reconstitution, "peptide", "research chemical" sales framing
- Results language: fat loss claims, recovery miracles, PR guarantees, "changed my life"
- Sponsor or event ownership names as promo
- Black Friday, Cyber Monday, New Year new you, resolution resets, wellness challenges
- Emoji, hashtags, ALL CAPS hype, exclamation
- Calls to shop, swipe up, link in bio as hard sell
- Posing instructions ("look at camera", "flex for the brand")

Internal CSV fields (`product_sku`, `notes`, `prompt_seed`) may name SKUs and production steps. Public caption text may not.

---

## 6. How seasonal / real-world events enter copy

Atmosphere only. Never as promo, never as hashtag event, never as "we're at X".

Allowed:
- Weather and light: late summer heat, wet autumn roads, dark november mornings, short december days, cold january starts, spring edge in early march
- Calendar density of training culture: Hyrox season depth, residency-city mood (Manchester, Amsterdam, Hong Kong, Osaka, Basel, Katowice, Vienna, Glasgow), IBJJF Europeans mood, UCI Road Worlds Montreal atmosphere, MTB marathon season ending
- Behaviour shifts: more indoor fight/mat volume, kitchen/prep density up, longer outdoor miles returning

Not allowed:
- Naming sponsors or presenting as official coverage
- Ticket CTAs, live coverage framing, "who are you picking"
- Turning Worlds / Hyrox / IBJJF into a sales calendar

`seasonal_hook` in the CSV is production mood for the creative team. It should not be pasted raw into the caption unless rewritten as atmosphere in voice (weather, light, training density).

---

## 7. Relationship to product (footnote)

- Product appears in at most about one in five posts; most months lean lower.
- When `product=yes`, the concept stays lifestyle-first. The photo is still training culture.
- A still life is the only time product is the subject, and it still shows no administration.
- Captions never name the product. SKU is a spreadsheet field for ops and compositing notes.
- Prefer peripheral presence (bag edge, counter corner, out of focus) over hero pack shots.
- The image brief promises observation rather than advertising; keep that promise in the caption.

Product supports the world. The world does not exist to announce product.

---

## 8. Commands / workflow when drafting calendar rows or captions

Posting runs seven days a week. The register, the frame and the references are
chosen by `STANDING_POST_RULE.md` section 2 against the image brief on the
Magnific board. **Nothing in this file selects or describes a frame.** When
writing the text for a row:

1. Read the register the rule selected, and the frame that was generated.
2. Choose `caption_type`, then write `caption` in voice (sections 3 and 4).
3. Fill `seasonal_hook` as atmosphere (section 6), never as a promo line.
4. Set `product` / `product_sku` only when the month budget allows.
5. Use `notes` for production only (composite vial after, story candidate).

When rewriting a caption only:
- Strip emoji, hashtags, exclamation, product names, claims.
- Force it into one caption type.
- Prefer concrete nouns from the frame that actually exists, not from the brief.

Keep women subjects at or above roughly one quarter of posts.

---

## 9. Checklist before publish

- [ ] Caption is lowercase/sentence case; no emoji, hashtags, or exclamation
- [ ] Caption type is one of: log / flat observation / place / crew / kitchen
- [ ] No product name, no claims, no administration language
- [ ] No sponsors, no New Year resolution / Black Friday / challenge framing
- [ ] Seasonal reference is atmosphere only (weather, light, training density)
- [ ] Image follows camera look rules; OBJECT alone may hero the vial
- [ ] If product=yes, lifestyle still reads first in both frame and caption
- [ ] Nobody looking at camera; no pose; no footwear logos; documentary not ad
- [ ] Consecutive-day variety held (camera / scene / cast not stuck on repeat)
- [ ] CSV fields (`product_sku`, `notes`, `prompt_seed`) are internal; caption is public-safe

If any box fails, revise before scheduling.
