# Standing Post Rule

Generative rule that decides each day's post from the brand system and its own
history. Replaces the fixed calendar as the primary source. Companion to the
World System v7 skill (`zb-guardrail`) and `WRITING_RULES.md`, both of which
outrank this file wherever they disagree.

---

## 1. Cadence

**Post every day.** Seven days a week, feed and Threads both.

This deliberately overrides `WRITING_RULES.md` section 8 step 1 (Mon/Tue/Thu/Fri/Sat
with Wed/Sun quiet). Irvan's call, made 15 Sep 2026. Consequence to remember:
`calendar_fallback.csv` contains no Wednesday or Sunday rows, so those two days
are always generative with no fallback available. If generation fails on a Wed or
Sun, log the blocker and skip. Do not post a Monday row on a Wednesday.

---

## 2. Selection: deficit-driven

Read the trailing 40 rows of `ledger.csv`. For each dimension compute:

    deficit(v) = target_share(v) - observed_share(v, window)

Pick the value with the largest shortfall that passes every hard rule in section 4.
Ties break toward whatever has gone longest unused.

An empty or short window means no deficit information: fall back to the v7 targets
outright. The first weeks are seeded rather than measured, and self-correct once
the window fills.

### Resolution order

Scene first, camera second. Ten scene targets are finer-grained than three camera
targets, so scene drives the decision and camera follows from it.

**v7 still names the camera first in the written prompt. That is prompt order, not
decision order.** Do not confuse the two.

    scene  = argmax deficit(s) for s in SCENES if admissible(s, today)
    camera = CAMERA_OF[scene]
    look   = argmax deficit(l) for l in LOOKS_FOR[camera] if admissible(l)
    cast   = argmax deficit(c) for c in CAST if admissible(c)

Where two scenes tie, prefer the one whose camera is further behind target.

### Scene to camera

| Scene | Camera |
|---|---|
| PROOF, KITCHEN, PREP | Camera A |
| SWEAT, SMEAR, GYM, ROAD, HEIGHTENED | Camera B |
| CREW, OBJECT | either |
| SCREEN | Screen |

### Look by camera

- Camera A: AVAILABLE by default.
- Camera B: SILVER unless the 40% floor is already met, then FLAT GREY.
- GEL: Camera B only, requires a gap of ten posts.
- GOLD HOUR: on probation. Only where the warmth is plainly weather, not mood.
- SEAMLESS: OBJECT scenes only.

---

## 3. Targets (v7 section 14)

| Dimension | Target |
|---|---|
| Camera A | 55% |
| Camera B | 40% |
| Screen | 5% |
| SWEAT | 20% |
| PROOF | 15% |
| SMEAR | 15% |
| KITCHEN | 12% |
| PREP | 12% |
| GYM | 10% |
| ROAD | 8% |
| CREW | 4% |
| OBJECT | 2% |
| HEIGHTENED | 2% |
| SILVER | 40% floor |
| Product | 20% ceiling, aim ~6% |
| Women as subject | 25% floor |

Cast rotates across MILER, ROULEUR, FIGHTER, GRAPPLER, ENGINE, OPERATOR by deficit.

---

## 4. Hard rules the engine cannot talk itself past

1. No camera + scene + cast triple repeated within three days.
2. Product at most one post in five. Err low: the approved thirteen contain none.
3. GEL at most one in ten. 2.39:1 at most once a month. Hard counters, not vibes.
4. Women as subject at or above one in four, measured on the window, not on intent.
5. SILVER holds its 40% floor across the window.
6. Any `product = yes` day without a supplied SKU render generates the seamless
   plate, holds it unpublished, logs it blocked, and runs the day as engagement
   only. Never improvise a vial, a label, a cap or a barcode.

---

## 5. Seasonal atmosphere

Month in, mood out. Enters the **prompt** as light, weather and training density.
Never enters the **caption** as an event, a sponsor, or coverage.

| Month | Atmosphere |
|---|---|
| September | Late summer heat still in the training. Road season winding down, distant. |
| October | Autumn base. Wet roads, longer rides, mat volume climbing. |
| November | Darker mornings. Indoor fight and mat volume up. |
| December | Short days. Kitchen and prep density up. Year-end logs. |
| January | Cold base. Residency-city mood. Mat season deep. |
| February | Mid-winter grind. Indoor floors, tape still fresh. |
| March | Spring edge returning. Longer outdoor miles. |
| April | PLACEHOLDER - awaiting Irvan |
| May | PLACEHOLDER - awaiting Irvan |
| June | PLACEHOLDER - awaiting Irvan |
| July | PLACEHOLDER - awaiting Irvan |
| August | PLACEHOLDER - awaiting Irvan |

September to March are lifted verbatim from the calendar's own `seasonal_hook`
column and are already in voice. April to August are unwritten: Irvan is writing
them. **If a run lands in a placeholder month, use the nearest written month's
line and flag it in the ops log.** Do not invent one.

The model is northern (Zurich, European road and mat seasons) and is written from
Bali. That is correct and deliberate: the world is the training culture the brand
sells into, not where the desk is.

---

## 6. Channels

| Channel | Treatment |
|---|---|
| Instagram feed | Frame cropped 4:5 or 1:1. House caption, 30-50 chars. |
| Instagram story | Reshare of the feed post at 9:16. |
| Threads | Not a mirror. See section 7. |
| Facebook Page | Mirror of the feed post. Expect nothing; costs one call. |

**Aspect ratio is a hard gate.** Instagram feed accepts 4:5 to 1.91:1 only. A 9:16
frame cannot be published to feed at any permission level. 9:16 belongs to stories,
which is also what v7 says. Crop, never stretch.

---

## 7. Threads conversion

**Instagram gets the residue. Threads gets the evidence.**

The feed caption withholds: six words under a strong frame. The Threads post
supplies what was withheld, being the numbers, the failure, the specific object
the caption left out. Same voice, same five caption types, roughly three times
the length.

### Format

| Element | Rule |
|---|---|
| Length | 120-180 characters. Approved 15 Sep 2026. |
| Images | 2-3. Use the v7 `pair`: Camera A before or after, Camera B during. |
| Ratio | One ratio per post, 4:5 or 9:16. Mixed ratios render inconsistently. |
| First line | Carries the post. It is the feed preview. Lead with the most specific thing. |
| Hashtags | None. Brand forbids them and they count against the limit. |
| Replies | Always answer replies on our own posts. Strongest ranking signal, zero brand cost. |

### Copy module

    <role>
    You write for @zurichbiotech on Threads. You are not a brand account reaching
    for attention. You are someone who trained this morning, wrote it down, and
    posted the page. People follow you because you are evidently real, not because
    you asked them to.
    </role>

    <conversion_rule>
    Every Instagram post converts to exactly one Threads post.
    The frame is reused. The caption is NOT.
    Instagram withholds. Threads supplies what was withheld:
    the numbers, the failure, the object the caption left out.
    Same five caption types. Same lowercase. Three times the length.
    </conversion_rule>

    <what_earns_a_follow>
    Specificity that only a practitioner could supply.
    A real number. A session that went wrong, reported flatly.
    The unglamorous detail nobody stages.
    Recognition, never persuasion. Let the wrong reader scroll past.
    </what_earns_a_follow>

    <forbidden>
    Questions to the audience. "agree?" "who else". Open loops.
    Hooks that withhold to bait a click. Listicles. "most people don't".
    Emoji, hashtags, exclamation, all caps. Product names. Claims.
    Anything that reads as a brand trying to grow.
    </forbidden>

    <opinion_without_bait>
    A flat observation is already a position. State it, stop, do not invite a vote.
    "gold hour is the wrong light for this room" is brand-legal.
    "what do you think?" is not.
    </opinion_without_bait>

### Calibration sample

These four are the register. Write against them.

| Instagram | Threads |
|---|---|
| the floor stays wet longer than it should. | the floor stays wet longer than it should. nobody mops between rounds, you find the dry part and work there. third interval and the dry part is gone. |
| session logged. nothing else to say. | session logged. four by one k, two minutes off. the third went wrong and the fourth was fine, which is the usual order. wrote it down the same as always. |
| tape peel left on the bench. | tape peel left on the bench. curled grey, stuck to itself. you see it on the way out and leave it, because the next session adds to it anyway. |
| late summer road, still warm at dusk. | late summer road, still warm at dusk. gloves off after the climb and back on before the descent, which is the whole month in one move. |

---

## 8. Audit gate

Run before anything publishes. Any failure regenerates the offending part.
Nothing publishes on a failed gate, and nothing publishes with an apology attached.

- [ ] Caption lowercase, one of the five types, no emoji, no hashtags, no exclamation, no question to the audience
- [ ] No product name, no claim, no dosage, no administration language in public text
- [ ] No seasonal sales framing. Season reads as weather, light or density only
- [ ] Nobody looks at the camera. No posing, no flexing, no triumph, no performed defeat
- [ ] Footwear unbranded, one matched identical pair. Every paired object specified identical
- [ ] Camera A signature named in full: HDR, distortion, over-sharpening, tilt
- [ ] The frame has a named canon sibling among the thirteen
- [ ] No em dash, in brand copy and in the agent's own writing
- [ ] Aspect ratio legal for its destination

---

## 9. Ledger

Append one row per post to `ledger.csv`:

    date, channel, scene, camera, submode, look, cast, format, sibling,
    caption_type, product, woman_subject, published, blocker

Without this the rule drifts within a fortnight and the feed quietly becomes
all phone, all SILVER, all rouleur. Eleven existing posts on the account are
unlogged and are not counted.

---

## 10. Fallback

If generation, research or the audit gate fails and cannot be recovered:

1. Mon/Tue/Thu/Fri/Sat: post the matching date row from `calendar_fallback.csv`.
2. Wed/Sun: no row exists. Log the blocker and skip the day.
3. Either way, record the failure in the ops log and in the ledger `blocker` column.

Never improvise an off-brand post to avoid an empty day.
