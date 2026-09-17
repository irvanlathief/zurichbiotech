# Standing Post Rule

Generative rule that decides each day's post from the brand system and its own
history. Replaces the fixed calendar as the primary source.

**The brand world is the Magnific board, read live every run.** The RULES text
node is the image brief and the VIBE panel is the reference set. Both outrank
this file wherever they disagree, and this file holds no copy of them: it says
how to rotate through them, when to stop, and where the result goes. See
`RUNBOOK.md` section 1 for the node ids and how to read them.

`WRITING_RULES.md` outranks this file for caption text.

**The `zb-guardrail` v7 skill is retired as the visual system**, superseded by
the board on 17 Sep 2026 after two frames were rejected on sight. Its cameras,
looks, scene types, canon siblings and palette no longer apply. The only parts
still binding are compliance rather than style, and are listed in `RUNBOOK.md`
section 1: no generated product, no administration, no claims.

---

## 1. Cadence

**Post every day.** Seven days a week, feed and Threads both.

This deliberately overrides `WRITING_RULES.md` section 8 step 1 (Mon/Tue/Thu/Fri/Sat
with Wed/Sun quiet). Irvan's call, made 15 Sep 2026. Consequence to remember:
`calendar_fallback.csv` contains no Wednesday or Sunday rows, so those two days
are always generative with no fallback available. If generation fails on a Wed or
Sun, log the blocker and skip. Do not post a Monday row on a Wednesday.

---

## 2. Selection: deficit-driven, over the board's own registers

The brief assigns every reference a job. Those jobs are the registers, and they
are the only scene vocabulary. Read them off the RULES node each run rather than
trusting this table, which is a convenience copy and goes stale the moment Irvan
rewrites the brief.

| Register | What the brief asks it for | References |
|---|---|---|
| PURSUIT | immersive running: close pursuit, lateral movement, partial bodies, imperfect handheld framing | `@img1` `@img9` `@img14` |
| CONTACT | grappling and striking: compressed space, obscured faces, convincing technique, motion through shadow | `@img2` `@img3` `@img7` |
| ROOM | lived-in training environments and community, dignity preserved, hardship not romanticised | `@img6` `@img16` |
| LOAD | sculptural athletic form, graphic silhouettes, visible tension under load | `@img8` `@img17` |
| BREATH | the quieter moments: recovery, concentration, breath | `@img10` `@img15` |
| HANDS | frayed finger tape, worn hands | `@img5` |
| SKIN | beads of sweat, intimate skin texture | `@img12` |
| STONE | chalk against coarse stone | `@img13` |
| DUST | shoes displacing dirt and gravel | `@img18` |
| TERRAIN | the elemental register: open terrain, airborne dust, heavy skies, warm earth | `@img11` |
| CLOTH | cropped apparel, graphic restraint, monochrome contrast | `@img4` |

### Weighting

**The board weights itself.** A register's target share is the number of
references the brief gives it, over the total number of references on the VIBE
panel. Three references out of eighteen is a target of three in eighteen. Add a
reference to the board and that register gets heavier on the feed without anyone
editing this file, which is the whole point of the board being the authority.

Compute it at run time. Do not paste the resulting percentages back into this
file.

### Choosing

Read the trailing 40 rows of `ledger.csv`.

    deficit(r) = target_share(r) - observed_share(r, window)
    register   = argmax deficit(r) for r in REGISTERS if admissible(r, today)

Largest shortfall wins among registers that pass every hard rule in section 4.
Ties break toward whatever has gone longest unused.

A short window carries no information. Seed from the targets outright and let it
self-correct as the window fills. The 09-15 and 09-16 rows are in the retired v7
vocabulary and do not map onto a register: count them as window rows, but read no
register history out of them.

### What follows from the register

Cast, wardrobe, location, light and palette all come from the brief, read against
the register chosen. The brief is specific about all of them. Do not invent a
house style on top of it, and do not reintroduce v7's cameras or looks as a way
of filling a gap: if the brief is silent, the frame is simpler, not embellished.

Attach the register's own references on the generation call, per `RUNBOOK.md`
section 3.

---

## 3. Targets

Register targets are computed from the board, per section 2. Nothing else is
computed, and these four floors and ceilings are the only fixed numbers left:

| Dimension | Target |
|---|---|
| Women as subject | 25% floor |
| Product | 20% ceiling, aim ~6% |
| TERRAIN | 10% ceiling: the brief says use it selectively |
| CLOTH | 10% ceiling: the brief says selective experimentation only |

The brief also asks for two alternations, which are rotation rules rather than
shares, and are enforced in section 4: kinetic against still, and grainy
black-and-white against subdued warm colour.

---

## 4. Hard rules the engine cannot talk itself past

1. No register repeated within three days, and no register plus cast pairing
   repeated within three days.
2. Alternate kinetic frames with still, spacious ones. Alternate grainy
   black-and-white with subdued warm colour. Never three of either in a row.
   Both alternations are the brief's, not preferences.
3. TERRAIN and CLOTH at most one in ten each. Hard counters, not vibes.
4. Women as subject at or above one in four, measured on the window, not on
   intent.
5. **Every object in frame belongs to the same sport as the subject, not merely
   to sport in general.** Chalk beside a gi fails: chalk is lifting, gymnastics
   and climbing, a gi is mat work. Added 17 Sep 2026 after a frame paired the two
   and nobody caught it before it published.
6. Objects were dropped where they fell, never arranged. A styled layout on a
   clean surface fails even when every object individually belongs. The brief
   says observed rather than artificially distressed, and means it in both
   directions.
7. Product at most one post in five. Err low.
8. Any `product = yes` day without a supplied SKU render holds the frame
   unpublished, logs it blocked, and runs the day as engagement only. Never
   improvise a vial, a label, a cap or a barcode.
9. Never reproduce a logo, slogan, watermark or brand identity read off a
   reference photograph. Footwear unbranded, one matched identical pair, and any
   paired object stated identical or the model will treat left and right as
   unrelated.

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
frame cannot be published to feed at any permission level. 9:16 belongs to
stories. Crop, never stretch.

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
| Images | 1. The same frame as the feed post. |
| Ratio | 4:5, same asset as the feed post. |
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

## 7b. Generation model

**Recraft V4.1, pro tier. 175 credits per image.** Approved 16 Sep 2026 on sample
frames, replacing Seedream 5 Pro.

**One image per day.** The feed frame is the only generation. It is cropped to 4:5
for feed, 9:16 for story, and reused as-is on Threads and the Page. There is no
pair partner and no Threads carousel: that trade was made deliberately to hold
generation at one a day, and it gives up the swipe-interaction signal on Threads.

Budget: 175/day nominal, around 350/day once regeneration on a failed gate is
counted. Against a 20,000 monthly allowance that leaves real headroom for a bad run.
Do not switch model to save credits without saying so.

Models considered and rejected: GPT 2 and GPT 2.5 (325 credits, no 4:5 ratio, and
specialised for non-photorealistic design work). Luma Uni-1.1 (350, would consume
the monthly allowance alone). Seedream 5 Pro (100, produced the rejected first frame).

---

## 8. Audit gate

Run before anything publishes. Any failure regenerates the offending part.
Nothing publishes on a failed gate, and nothing publishes with an apology attached.

- [ ] Caption lowercase, one of the five types, no emoji, no hashtags, no exclamation, no question to the audience
- [ ] No product name, no claim, no dosage, no administration language in public text
- [ ] No seasonal sales framing. Season reads as weather, light or density only
- [ ] Nobody looks at the camera. No staged aggression, no heroic pose, no exaggerated suffering, no transformation framing
- [ ] Footwear unbranded, one matched identical pair. Every paired object specified identical
- [ ] No logo, slogan or watermark carried over from a reference photograph
- [ ] The frame names its register, and the references attached to the call carry that register
- [ ] Film character present: organic grain, gentle highlight bloom, slightly imperfect exposure. No glossy HDR, no uniform filter, no grunge overlay
- [ ] Palette inside charcoal, washed black, chalk white, concrete grey, warm skin, dusty earth, tobacco brown. Rust, faded turquoise, muted olive or deep sky blue only where the setting motivates it
- [ ] Shot from inside the action, not from spectator distance
- [ ] Anatomy accurate, grips plausible, athletic mechanics credible
- [ ] Every detail made of small marks was described rather than named. Handwriting reads as a hand, not as type
- [ ] No em dash, in brand copy and in the agent's own writing
- [ ] Aspect ratio legal for its destination

---

## 8b. Plausibility gate

Added 16 Sep 2026 after the first generated frame passed the brand gate 9 of 9 and
was still rejected on sight: long fingers, a body positioned nonsensically in the
ring, and a black cap lying in the middle of a boxing ring.

The brand gate asks "is this on-world". It never asked "would this exist". Both
questions have to pass.

### Anatomy

- **Hands stay out of frame on tight crops.** SKIN and CONTACT frames are face,
  neck and shoulders. Do not write a hand, a finger or a wrapped fist into the
  frame to add interest. Hands are where the model fails most and the failure is
  unmissable. On 17 Sep a hand written in purely to hold a pen came back with
  fused fingers and an impossible grip.
- Where hands are the subject, which is the HANDS register and nowhere else, they
  are wrapped, taped, or holding a known object, never loose and open, and never
  in the far background.
- Feet, teeth and ears carry the same risk at distance. Crop them out or blur them.

### Objects must belong to the sport and the moment

Every dropped object passes two tests before it goes in the prompt:

1. Does this object belong to this sport at all?
2. Would it be lying in *this exact spot*, at *this exact moment* in the session?

A cap belongs in a gym bag, on a bench, on a hook. It does not lie in the middle of
a boxing ring between rounds. A towel over the ropes passes. A bidon on the canvas
does not. When in doubt, drop the object rather than place it. Three or four is
enough, and fewer objects means less for the model to invent.

### Spatial coherence

Name **one** spatial plane per frame. The rejected prompt said the room collapsed to
black two feet behind her *and* placed ropes, a ring apron and objects at depth
behind that. Those cannot both be true, and the model resolved it by inventing a
geometry that reads as wrong.

Pick: tight and black behind, or a legible room with depth. Never both.

### The reviewer's question

Before publishing, look at the frame and ask what a person who actually trains in
this sport would notice first. If the answer is anything other than the subject,
regenerate. A fighter does not see "high contrast black and white". They see a cap
on the canvas and stop believing the picture.

---

## 9. Ledger

Append one row per post to `ledger.csv`. The columns are unchanged so the file
stays readable end to end, but three of them carry new meaning from 17 Sep 2026:

    date, channel, scene, camera, submode, look, cast, format, sibling,
    caption_type, product, woman_subject, published, blocker

- `scene` carries the register: PURSUIT, CONTACT, ROOM, LOAD, BREATH, HANDS,
  SKIN, STONE, DUST, TERRAIN, CLOTH.
- `sibling` carries the `@img` references attached to the generation call.
- `camera`, `submode` and `look` are retired with v7 and stay empty. They are
  kept as columns only so the 09-15 and 09-16 rows still parse.

Rows before 17 Sep are in the old vocabulary. Count them for cadence, read no
register history out of them, per section 2.

Without this the rule drifts within a fortnight and the feed quietly becomes one
register on repeat. Eleven existing posts on the account are unlogged and are not
counted.

---

## 10. Fallback

If generation, research or the audit gate fails and cannot be recovered:

1. Log the blocker and skip the day, every day of the week.
2. Record the failure in the ops log and in the ledger `blocker` column.

**`calendar_fallback.csv` is suspended as of 17 Sep 2026.** Every row in it is
written in v7 vocabulary and carries a pre-built v7 `prompt_seed`: cameras,
looks, canon siblings, HDR signatures. Posting one now would publish exactly the
system the board replaced, which is worse than an empty day and is the one thing
the last line of this section has always forbidden. It needs rewriting against
the board before it can be used again, and that is Irvan's call, not the cron's.

Never improvise an off-brand post to avoid an empty day. An empty day costs
nothing. A wrong post costs the feed.
