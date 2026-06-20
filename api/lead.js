// Vercel Node.js serverless function: /api/lead
// Receives the analysis-tool form submission, sends a personalized
// lead-magnet email via Resend, and (optionally) adds the contact to
// a Resend Audience for future broadcasts.
//
// Required env vars (set in Vercel project settings):
//   RESEND_API_KEY        - "re_..." key from resend.com/api-keys
//   RESEND_FROM_EMAIL     - e.g. "Zurich Biotech <hello@zurichbiotech.com>"
//                           (sender domain must be verified in Resend)
// Optional:
//   RESEND_REPLY_TO       - reply-to address (default: info@zurichbiotech.com)
//   RESEND_AUDIENCE_ID    - if set, adds the contact to this Resend Audience

const SITE = "https://zurichbiotech.com";
const WA = "61408703955";
const STARTER_PDF = "/resources/01-Peptide-Researchers-Starter-Guide.pdf";

const GOALS = {
  recovery: {
    label: "Recover faster",
    protocol: "Recover Faster",
    color: "#138f2d",
    focus: "recovery and soft-tissue repair",
    research: [
      { name: "BPC-157", href: "/resources/bpc-157-research-overview/" },
      { name: "TB-500 (Thymosin Beta-4)", href: "/resources/tb-500-thymosin-beta-4-research/" },
      { name: "GHK-Cu", href: "/resources/ghk-cu-research-overview/" },
    ],
  },
  strength: {
    label: "Build strength",
    protocol: "Lift Heavier",
    color: "#1158d8",
    focus: "strength and lean mass",
    research: [
      { name: "CJC-1295 / Ipamorelin", href: "/resources/cjc1295-ipamorelin-research-overview/" },
      { name: "GHK-Cu", href: "/resources/ghk-cu-research-overview/" },
      { name: "BPC-157", href: "/resources/bpc-157-research-overview/" },
    ],
  },
  energy: {
    label: "Sharper energy",
    protocol: "Wake Up Sharp",
    color: "#ffd21a",
    focus: "steadier focus and energy",
    research: [
      { name: "Semax", href: "/resources/semax-research-overview/" },
      { name: "MOTS-c", href: "/resources/mots-c-research-overview/" },
      { name: "GHK-Cu", href: "/resources/ghk-cu-research-overview/" },
    ],
  },
  metabolic: {
    label: "Body composition",
    protocol: "Look Better",
    color: "#ff4a12",
    focus: "body composition and metabolic health",
    research: [
      { name: "Retatrutide", href: "/resources/retatrutide-research-overview/" },
      { name: "MOTS-c", href: "/resources/mots-c-research-overview/" },
      { name: "GHK-Cu", href: "/resources/ghk-cu-research-overview/" },
    ],
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const body = req.body || {};
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const goal = typeof body.goal === "string" ? body.goal : "";
  const profile = typeof body.profile === "string" ? body.profile : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const phoneDigits = phone.replace(/\D/g, "");
  const consent = body.consent === true;

  if (!name || name.length > 120) return res.status(400).json({ error: "invalid_name" });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) return res.status(400).json({ error: "invalid_email" });
  if (phoneDigits.length < 8 || phoneDigits.length > 15) return res.status(400).json({ error: "invalid_phone" });
  if (!consent) return res.status(400).json({ error: "consent_required" });
  if (!GOALS[goal]) return res.status(400).json({ error: "unknown_goal" });

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "Zurich Biotech <hello@zurichbiotech.com>";
  const replyTo = process.env.RESEND_REPLY_TO || "info@zurichbiotech.com";
  if (!apiKey) return res.status(500).json({ error: "not_configured" });

  const g = GOALS[goal];
  const subject = `Your peptide research starter: ${g.label}`;
  const html = renderHtml({ name, goal: g });
  const text = renderText({ name, goal: g });

  let resp;
  try {
    resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        from,
        to: [email],
        subject,
        html,
        text,
        reply_to: replyTo,
        tags: [{ name: "source", value: "analysis" }, { name: "goal", value: goal }],
      }),
    });
  } catch (err) {
    return res.status(502).json({ error: "send_failed", detail: String(err && err.message || err) });
  }
  if (!resp.ok) {
    const detail = await resp.text().catch(() => "");
    return res.status(502).json({ error: "send_failed", status: resp.status, detail });
  }

  // Internal notification so the team sees every lead (same details as the
  // WhatsApp hand-off). Reply-to is the lead so you can answer them directly.
  // Set LEAD_NOTIFY_EMAIL to the inbox you actually monitor.
  const notifyTo = process.env.LEAD_NOTIFY_EMAIL || "info@zurichbiotech.com";
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        from,
        to: [notifyTo],
        reply_to: email,
        subject: `New lead: ${name} - ${g.label}`,
        text: [
          "New analysis lead from zurichbiotech.com",
          "",
          `Name:    ${name}`,
          `Email:   ${email}`,
          `Phone:   ${phone}`,
          `Chat:    https://wa.me/${phoneDigits}`,
          `Goal:    ${g.label}`,
          `Profile: ${profile || "-"}`,
          `Time:    ${new Date().toISOString()}`,
          "",
          "Reply to this email to reach the lead, or tap the Chat link to WhatsApp them.",
        ].join("\n"),
        tags: [{ name: "type", value: "lead-notification" }],
      }),
    });
  } catch (_) {}

  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (audienceId) {
    const [firstName, ...rest] = name.split(/\s+/);
    fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        email,
        first_name: firstName,
        last_name: rest.join(" ") || undefined,
        unsubscribed: false,
      }),
    }).catch(() => {});
  }

  return res.status(200).json({ ok: true });
}

function firstName(n) {
  return (n || "").trim().split(/\s+/)[0] || "there";
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function waLink(goal) {
  const msg = `Hi Zurich Biotech, I just received my "${goal.label}" guide. I'd like to chat about the ${goal.protocol} protocol.`;
  return `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
}

function renderHtml({ name, goal }) {
  const research = goal.research
    .map((r) => `<li style="margin:6px 0"><a href="${SITE}${r.href}" style="color:#e10600;text-decoration:none">${escapeHtml(r.name)}</a> <span style="color:#5d5d5d">- research overview</span></li>`)
    .join("");
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(`Your starter: ${goal.label}`)}</title></head>
<body style="margin:0;padding:0;background:#fafafa;font-family:Helvetica,Arial,sans-serif;color:#090909;line-height:1.55">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border:1px solid #e7e7e7">
        <tr><td style="padding:32px 32px 0">
          <p style="margin:0;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#5d5d5d">Your research focus</p>
          <h1 style="margin:6px 0 0;font-size:28px;font-weight:400;color:#090909">${escapeHtml(goal.label)}<span style="color:#e10600">+</span></h1>
          <span style="display:inline-block;width:56px;height:3px;background:${goal.color};margin-top:14px"></span>
        </td></tr>
        <tr><td style="padding:24px 32px 0">
          <p style="margin:0 0 14px">Hi ${escapeHtml(firstName(name))},</p>
          <p style="margin:0">Here is your free starter, built around your goal of <strong>${escapeHtml(goal.label.toLowerCase())}</strong>. Three sections: what to do right now (no peptides required), what to research if you are curious, and the protocol we would point you to.</p>
        </td></tr>
        <tr><td style="padding:24px 32px 0">
          <h2 style="font-size:18px;font-weight:600;margin:8px 0 8px">1. Start here, no peptides required</h2>
          <p style="margin:0">The fundamentals move the needle more than any compound. Sleep, protein, training consistency, daylight. The full guide goes deeper into protocols, purity, handling, and how researchers approach this category.</p>
          <p style="margin:18px 0"><a href="${SITE}${STARTER_PDF}" style="display:inline-block;background:#090909;color:#fff;text-decoration:none;padding:14px 22px;font-size:13px;letter-spacing:.04em;text-transform:uppercase;font-weight:700">Download the starter guide PDF +</a></p>
        </td></tr>
        <tr><td style="padding:8px 32px 0">
          <h2 style="font-size:18px;font-weight:600;margin:16px 0 8px">2. If you want to explore peptides, here is what to research</h2>
          <p style="margin:0 0 8px">Start with the science. These are the compounds most relevant to ${escapeHtml(goal.focus)}, with research-use-only context.</p>
          <ul style="padding-left:20px;margin:8px 0">${research}</ul>
        </td></tr>
        <tr><td style="padding:8px 32px 0">
          <h2 style="font-size:18px;font-weight:600;margin:16px 0 8px">3. The matching protocol</h2>
          <p style="margin:0 0 14px">Based on your answers we would point you to the <strong>${escapeHtml(goal.protocol)}</strong> protocol. It uses the compounds above and the biomarker chart on the home page shows what the 16-week response looks like.</p>
          <p style="margin:0"><a href="${SITE}/#protocols" style="color:#e10600;text-decoration:underline">See the full protocol and biomarker chart &rarr;</a></p>
        </td></tr>
        <tr><td style="padding:32px">
          <a href="${waLink(goal)}" style="display:block;background:#090909;color:#fff;text-decoration:none;text-align:center;padding:18px;font-size:13px;letter-spacing:.04em;text-transform:uppercase;font-weight:700">Continue on WhatsApp +</a>
        </td></tr>
        <tr><td style="padding:0 32px 32px;color:#888;font-size:11px;line-height:1.6">
          <hr style="border:none;border-top:1px solid #e7e7e7;margin:0 0 16px"/>
          <p style="margin:0">Zurich Biotech supplies research-grade peptides for laboratory research only. Nothing in this email is medical advice; the compounds discussed are not for human consumption. See our <a href="${SITE}/terms.html" style="color:#5d5d5d">terms</a>. You are receiving this because you completed the research analysis on zurichbiotech.com.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function renderText({ name, goal }) {
  const research = goal.research.map((r) => `- ${r.name}: ${SITE}${r.href}`).join("\n");
  return [
    `Hi ${firstName(name)},`,
    "",
    `Here is your free starter for ${goal.label.toLowerCase()}.`,
    "",
    "1. START HERE, no peptides required",
    "The fundamentals move the needle more than any compound. Sleep, protein, training consistency, daylight.",
    `Download the starter guide PDF: ${SITE}${STARTER_PDF}`,
    "",
    "2. WHAT TO RESEARCH",
    `Compounds most relevant to ${goal.focus}:`,
    research,
    "",
    "3. THE MATCHING PROTOCOL",
    `We would point you to the ${goal.protocol} protocol. Full chart: ${SITE}/#protocols`,
    "",
    `Continue on WhatsApp: ${waLink(goal)}`,
    "",
    "--",
    "Zurich Biotech supplies research-grade peptides for laboratory research only. Nothing here is medical advice; compounds are not for human consumption.",
    `Terms: ${SITE}/terms.html`,
  ].join("\n");
}
