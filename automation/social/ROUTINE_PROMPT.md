# ZB-SMM Routine prompt

The prompt the daily Routine fires. Paste the block below into the Routine's
prompt field, or point the Routine at this file.

## Routine configuration

| Field | Value |
|---|---|
| Name | ZB-SMM daily post (07:04 WITA) |
| Schedule | `4 23 * * *` — **UTC**, which is 07:04 Asia/Makassar |
| Environment | `zb-smm` |
| Session | Fresh session per firing |
| Connectors | Magnific, Notion |
| Notifications | Push on, at least until it has run clean for a week |

The schedule is UTC and fires the day *before* in Makassar terms. That is correct
and deliberate. Do not "fix" it to `4 7 * * *`.

---

## Prompt

```
UNATTENDED AUTOMATED RUN — ZB-SMM daily post for @zurichbiotech.

Execute directly. Do NOT invoke the prompt-perfector skill: there is nobody
present to confirm a rewritten prompt and the run would stall having posted
nothing.

## Your instructions live in the repo

Read these from irvanlathief/zurichbiotech on main. They are the authoritative
spec and they outrank this prompt wherever they differ:

- automation/social/RUNBOOK.md            the daily steps, in order
- automation/social/STANDING_POST_RULE.md selection engine, hard rules, seasonal
                                          model, Threads module, both gates
- automation/social/WRITING_RULES.md      voice
- automation/social/ledger.csv            trailing state you read and append to
- automation/social/calendar_fallback.csv fallback only
- the zb-guardrail skill                  World System v7, the thirteen canon frames

Follow the runbook. Do not improvise around it.

## Worth repeating here

DATE. Use `TZ=Asia/Makassar date +%F`. Never a bare `date` — the container runs
UTC and this fires at 23:04 UTC, which is already the next day in Makassar. A run
that reads the system clock picks the wrong row every single time.

DUPLICATE GUARD. Check ledger.csv for today's date before doing anything. Known
weakness: a run can host assets and publish without writing its row, so also read
the Instagram account's media_count and content_publishing_limit. If a post
already went out today, stop and log it rather than double-posting.

MODEL. Recraft V4.1, tier pro, 4:5, ONE image, 175 credits.

BOTH GATES ARE BINDING. The brand gate (rule section 8) and the plausibility gate
(rule section 8b). The plausibility gate exists because a frame passed the brand
gate 9 of 9 and was still rejected on sight for long fingers, incoherent ring
geometry, and a cap lying on the canvas. Hands out of frame on tight crops. One
spatial plane. Every object must belong to the sport AND the moment. Two failures
and you stop, publish nothing, and log why. An off-brand post on a real brand
account is worse than no post.

PRODUCT IS FORCED OFF. No SKU renders exist. Never generate or composite a vial,
label, cap or barcode. If selection lands on OBJECT, take the next-highest-deficit
scene and note the substitution.

CHANNELS. Instagram feed, Instagram story, Facebook Page mirror. Do NOT attempt
Threads: the token lacks threads_content_publish. The module is written but not
provisioned. Note it and move on.

ENGAGEMENT. Reply to comments on our own posts only. No hashtag search, no
Public Content Access. Never comment on another account's media.

SECRETS. Never print, echo, log or commit $IG_ACCESS_TOKEN.

## If the publish is refused

Unattended publishing needs project permission rules at .claude/settings.json.
If the Graph API call is refused by the permission classifier, that is this
blocker. Do NOT create or modify permission settings yourself — an agent granting
itself permissions is precisely what that guard prevents. Log the blocker, write
the ledger row with published=n and the reason, and end cleanly.

## Log, every run

1. Append the row to automation/social/ledger.csv, commit and push to main.
2. One line into today's Notion daily journal (Daily Journals database, found by
   Date property) under the 📓 The Day heading, matching the existing entry
   format. Report what posted, what did not, and any blocker.

Do not message Irvan directly. The journal is the reporting surface.
```

---

## Before the first firing

1. `.claude/settings.json` must exist on `main` with permission rules for the
   Graph API calls. Without it the run stalls at publish. An agent cannot create
   this file for itself, by design.
2. Consider narrowing the Meta token first. It currently carries 34 scopes where
   5 are needed, including `ads_management` and `paid_marketing_messages`. The
   permission rule and the broad token compound each other.
3. The duplicate guard's secondary check is untested. A first firing that
   double-posts would be a poor way to discover it.
