# ZB-SMM Daily Runbook

Fires 23:04 UTC = 07:04 Asia/Makassar, every day, fresh session in the `zb-smm`
environment.

**This is an unattended automated run. Execute directly. Do NOT invoke the
prompt-perfector skill** — there is nobody present to confirm a rewritten prompt,
and the run would stall having posted nothing.

---

## 0. Guard

    TODAY=$(TZ=Asia/Makassar date +%F)
    WEEKDAY=$(TZ=Asia/Makassar date +%A)

**Never use a bare `date`.** Containers run UTC and this routine fires at 23:04 UTC,
which is already the next day in Makassar. A run that reads the system clock grabs
yesterday's context every single time.

Posting runs seven days a week. There are no quiet days.

Check `ledger.csv` for a row already matching `$TODAY`. If one exists and is marked
published, this is a duplicate fire: stop, log, do not post again.

---

## 1. Load

- `automation/social/STANDING_POST_RULE.md` — the selection engine
- `automation/social/WRITING_RULES.md` — voice
- `automation/social/ledger.csv` — trailing 40 rows
- the `zb-guardrail` skill — World System v7, the thirteen canon frames
- `automation/social/calendar_fallback.csv` — only if the run fails later

---

## 2. Select

Run the deficit algorithm in the rule, section 2. Produces: scene, camera, submode,
look, cast, format, sibling canon handle, caption type, product y/n.

---

## 3. Generate

Magnific, Zurich Biotech space. Model `recraft-v4-1`, tier `pro`, aspect 4:5, **one image only** (175 credits). Build the prompt from the v7 section 18 recipe:

    [camera, sub-mode and format] + [house look] + [lens and depth behaviour]
    + [cast archetype and what they are doing] + [wardrobe brand reference]
    + [location] + [three or four dropped objects] + [what the light is doing]
    + [composition fault] + [negative constraints]

Close with: `no one looking at camera, no posing, no logos on footwear, no product,
documentary photograph not advertising`.

Camera A prompts must name HDR, distortion, over-sharpening and tilt or the frame
comes back looking like Camera B and is wrong.

One image per day. No pair partner, no Threads carousel: the single frame serves feed, story, Threads and Page.

Never generate a vial. Composite a supplied render or leave product out.

---

## 4. Convert

Meta requires: **JPEG only**, max 8MB, width <= 1440px, sRGB, public non-expiring URL.

    # feed: crop to 4:5 or 1:1. story: 9:16. Threads: one ratio per post.
    convert in.png -colorspace sRGB -resize 1440x\> -quality 88 out.jpg

Magnific CDN URLs are signed and expire, so they cannot be handed to Meta directly.

---

## 5. Host

Commit the JPEG to the `social-assets` branch and serve it from:

    https://raw.githubusercontent.com/irvanlathief/zurichbiotech/social-assets/<path>

No deploy wait, never touches production. Confirm the URL returns HTTP 200 with an
image content type **before** calling Meta — a 404 at container-creation time is the
most likely failure in this whole chain.

---

## 6. Audit

Run the gate in the rule, section 8. A failure regenerates the offending part.
Nothing publishes on a failed gate.

---

## 7. Publish

Account: `17841416575231592`. Page: `1076917362180709`. Token: `$IG_ACCESS_TOKEN`.
Never print, echo, log or commit the token value.

**Instagram feed**

    POST /v21.0/{IG_USER_ID}/media          image_url, caption
    POST /v21.0/{IG_USER_ID}/media_publish  creation_id

**Instagram story** — same, with `media_type=STORIES`.

**Threads** — the same single frame, 120-180 char conversion per rule section 7.

**Facebook Page** — mirror of the feed post.

Publish feed first. If it fails, stop and log; do not post the downstream channels
against a feed post that does not exist.

---

## 8. Engagement

Find 3-5 relevant posts via hashtag search. Training culture only: running, cycling,
boxing and BJJ, Hyrox, kitchen and prep. Skip anything spammy, controversial,
transformation-shaped, or selling.

Draft comments in voice. **Do not attempt to post them** — Meta exposes no endpoint
for commenting on third-party media. They go into the ops log for a human to paste.

Reply to any new comments on our own posts. This is permitted and is the strongest
Threads ranking signal.

---

## 9. Log

**Ledger.** Append the row to `ledger.csv`, commit, push.

**Notion.** One line into the day's journal page, found by Date property in the
Daily Journals database, under the `📓 The Day` heading, matching the existing format:

    - **07:12 — Zurich Biotech / IG:** feed posted, BETWEEN ROUNDS sibling,
      interval residue. story shared. threads carousel out. 4 comments drafted,
      pending paste. no blockers.

If the journal page for today does not exist yet, write to the most recent one and
note the date mismatch rather than losing the log.

---

## 10. On failure

Follow the rule, section 10. Mon/Tue/Thu/Fri/Sat fall back to the calendar row.
Wed/Sun have no row: log the blocker and skip.

Never improvise an off-brand post to avoid an empty day.

Report blockers in the Notion line. Do not message Irvan directly.
