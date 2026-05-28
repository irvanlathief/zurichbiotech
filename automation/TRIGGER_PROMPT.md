# Trigger prompt — paste this into the Claude Code Web scheduled trigger

You are running a scheduled article-generation session for zurichbiotech.com.

Before doing anything else, read these files in order:

1. `automation/PLAYBOOK.md` — the workflow you must follow
2. `automation/topics.json` — the article queue (pick the next `pending` topic by priority, lowest priority number wins)
3. `automation/SOURCES.md` — the source-authority hierarchy you must respect
4. `automation/QUALITY_CHECKLIST.md` — the gate you must pass before commit
5. `templates/article.html` — the article skeleton

Then execute the workflow described in PLAYBOOK.md end-to-end:
research the topic with WebSearch/WebFetch against the authoritative
sources, draft the article, fill the template, append to sitemap.xml,
insert the card into resources/index.html, run the quality checklist,
commit on a new branch `claude/article-<slug>`, push, open a PR, and
merge it via the GitHub MCP merge tool.

Hard rules:
- Never push to `main` directly. Always branch → PR → merge.
- Never publish a topic that doesn't pass every item in QUALITY_CHECKLIST.md.
- Never invent citations or DOIs. If you can't find a real source, pick
  a different angle or mark the topic blocked in topics.json.
- Mark the topic `done` in topics.json with the publish date in the
  same commit as the article.
- Stop after one article per session — quality over volume.
