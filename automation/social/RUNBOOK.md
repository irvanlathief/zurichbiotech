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

**The Magnific board is the visual authority.** Not this repo, not the
`zb-guardrail` skill. Read it fresh every run: Irvan edits the board directly,
and whatever it says that morning is the brand world that morning.

Space `a2b2586b-6a14-432a-acfe-944fd0e02fee`, "Zurich Biotech".

- **RULES**, text node `311b2902-1100-4b50-98bc-f487dc8350ca`. The image brief.
  Read it with `spaces_get_nodes`; the brief is that node's `text` value.
  `spaces_state` truncates it at roughly 2,200 characters, so never read it from
  there and never work from a summary of it held in this repo.
- **VIBE**, panel node `e1beb876-dc97-42eb-bd2a-d5db7aa58374`. The reference
  photographs the brief addresses as `@img1` to `@img18`. `spaces_get_nodes` on
  the panel returns the panel only, not its contents: call `spaces_state` for
  page 1, take every node whose `groupId` is the panel id, and read each one's
  `creationIdentifier` out of `nodeData`. Never hardcode that list. It changes
  whenever he adds a reference, and the weighting in the rule is computed from
  it.

Then, from this repo:

- `automation/social/STANDING_POST_RULE.md`, cadence, rotation, gates, channels
- `automation/social/WRITING_RULES.md`, caption voice, authoritative for text
- `automation/social/ledger.csv` — trailing 40 rows

**`zb-guardrail` v7 is retired as the visual system**, superseded by the board on
17 Sep 2026. Take no camera, look, scene, palette or canon-sibling direction from
it. Three of its rules are compliance rather than style, are not covered anywhere
on the board, and still bind:

- Never generate the product, or any vial, label, cap or barcode.
- Never depict administration, injection, reconstitution or consumption.
- Never write a claim, a dosage, or a result.

---

## 2. Select

Run the deficit algorithm in the rule, section 2. Produces: register, cast,
format, the `@img` references to attach, caption type, product y/n.

---

## 3. Generate

Magnific, Zurich Biotech space. Model `recraft-v4-1`, tier `pro`, aspect 4:5,
**one image only** (175 credits).

Build the prompt out of the RULES node, not out of a recipe stored here. The
brief assigns each reference a register, and the rule, section 2, turns those
into the day's selection. Write the frame in the brief's own terms: film
character, light, palette, viewpoint, wardrobe, casting.

**Attach the VIBE photographs as `style` references on the generation call**, two
or three that carry the register chosen for the day. This is the step that
stopped the frames coming back sterile. A written description on its own leaves
the model to invent texture, and it invents badly. Do not attach references that
fight each other, a black-and-white frame and a warm colour frame in the same
call.

**Describe any detail the model has to draw, rather than naming it.** "Rows of
numbers" returns typeset. Handwriting has to be described as handwriting: uneven
baseline drifting off the ruled line, pressure varying so some words bite dark
and others skip, a struck-out line, a smudge, paper cockled where sweat landed.
The same goes for screens, worn labels and anything else made of small marks.

One image per day. It is cropped 4:5 for feed and 9:16 for story and reused on
the Page. No pair partner.

Never generate the product, a vial, a label, a cap or a barcode. Composite a
supplied render or leave product out.

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

**Instagram story**, same, with `media_type=STORIES`.

**Facebook Page**, mirror of the feed post. **The Page needs a Page access token,
not `$IG_ACCESS_TOKEN`.** Fetch it per run and never store it:

    GET  /v21.0/me/accounts                 -> find id 1076917362180709, take its access_token
    POST /v21.0/{PAGE_ID}/photos            url, caption, access_token=<page token>

Posting to `/{page-id}/photos` with the user token returns `(#200) The
permission(s) publish_actions are not available. It has been deprecated.` That
error names a permission that has not existed since 2018 and has nothing to do
with the real problem, which is simply the wrong token. It cost two runs on
16 and 17 Sep, both of which logged it as a grant Irvan needed to make. He does
not: the token already carries `pages_manage_posts` and `CREATE_CONTENT` on the
Page. Verified 17 Sep by uploading unpublished with a Page token and deleting it.

**Threads needs its own token and does not have one.** Do not attempt it, and do
not log it as a missing permission: that has been the wrong diagnosis twice.

- *Network, cleared 17 Sep.* `graph.threads.net` was denied by the environment
  network policy, proxy answering 403 to CONNECT. Irvan added the host and the
  container now reaches Meta directly.
- *Token, open.* `$IG_ACCESS_TOKEN` is a Facebook user token and
  `graph.threads.net` will not parse it at all: `Invalid OAuth access token,
  Cannot parse access token`, code 190. **This is not a scope problem and adding
  a scope to the Facebook token will not fix it.** Threads runs its own OAuth and
  issues its own token, bound to the Threads account.

What that needs, once, from Irvan:

1. Meta App Dashboard, Threads use case, with the publish permission added.
   The token already carries `threads_business_basic`, so some Threads use case
   exists on the app; check the dashboard for whether the publish scope is named
   `threads_content_publish` or `threads_business_content_publish`, since the
   business-login variant uses the second and the token's existing scope hints at
   it. Request the one the dashboard actually offers.
2. Authorize at `threads.net/oauth/authorize`, scope `threads_basic` plus the
   publish scope, and exchange the code at `graph.threads.net/oauth/access_token`.
3. Exchange the short-lived token for the 60 day one,
   `graph.threads.net/access_token?grant_type=th_exchange_token`, and store it in
   the environment as `THREADS_ACCESS_TOKEN`. It expires: refresh inside 60 days
   or the channel silently dies again.

Publishing then mirrors Instagram, on the Threads host and the Threads token:

    POST /v1.0/me/threads          media_type, text, image_url
    POST /v1.0/me/threads_publish  creation_id

Until `THREADS_ACCESS_TOKEN` exists, log Threads as awaiting its own token.
Re-check with `/me/permissions` and `$HTTPS_PROXY/__agentproxy/status` rather
than assuming. Note that `developers.facebook.com` is itself blocked by the
egress policy, so the Meta docs cannot be read from inside a run.

Publish feed first. If it fails, stop and log; do not post the downstream channels
against a feed post that does not exist.

---

## 8. Engagement

Hashtag search is unavailable: the app holds no Instagram Public Content Access,
and App Review for it was declined on 16 Sep 2026. Do not attempt discovery, and
do not draft comments against accounts you cannot see.

Reply to any new comments on our own posts, in voice, using the same five caption
types. This is permitted by `instagram_manage_comments` and is the strongest
ranking signal available to us.

Never comment on another account's media. No API exists for it, and browser
automation against a real brand account risks the account.

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

Follow the rule, section 10. Log the blocker and skip, any day of the week.
`calendar_fallback.csv` is suspended: its rows are v7 and would publish the
system the board replaced.

Never improvise an off-brand post to avoid an empty day.

Report blockers in the Notion line. Do not message Irvan directly.
