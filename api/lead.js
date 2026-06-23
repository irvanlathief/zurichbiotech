// Vercel Node serverless function: /api/lead
// Receives a Recovery Intelligence assessment result, emails the lead a
// personalized breakdown via Resend, and notifies the team. Optionally adds
// the contact to a Resend Audience.
//
// Env (Vercel project settings):
//   RESEND_API_KEY        - "re_..." key (required)
//   RESEND_FROM_EMAIL     - e.g. "Zurich Biotech <hello@zurichbiotech.com>"
//   RESEND_REPLY_TO       - default info@zurichbiotech.com
//   LEAD_NOTIFY_EMAIL     - inbox for internal lead alerts (default info@zurichbiotech.com)
//   RESEND_AUDIENCE_ID    - if set, adds the contact to this Audience

const SITE = "https://zurichbiotech.com";
const WA = "61408703955";
const STARTER_PDF = "/resources/01-Peptide-Researchers-Starter-Guide.pdf";

const COMPOUND_PRICES = {
  "GHK-CU": 1800000, "Semax": 1000000, "BPC157 + TB500": 1900000,
  "MOTS-C": 2000000, "Retatrutide": 3800000, "CJC1295 / Ipamorelin": 1500000,
};
const PROTOCOLS = {
  strength: { title: "Lift Heavier", duration: "12-16 weeks", stack: [["GHK-CU", "50mg"], ["BPC157 + TB500", "5mg + 5mg"], ["CJC1295 / Ipamorelin", "10mg Blend"]] },
  energy: { title: "Wake Up Sharp", duration: "12-16 weeks", stack: [["Semax", "5mg"], ["MOTS-C", "10mg"], ["GHK-CU", "50mg"]] },
  recovery: { title: "Recover Faster", duration: "12 weeks", stack: [["BPC157 + TB500", "5mg + 5mg"], ["GHK-CU", "50mg"]] },
  metabolic: { title: "Look Better", duration: "12-16 weeks", stack: [["Retatrutide", "10mg"], ["MOTS-C", "10mg"], ["GHK-CU", "50mg"]] },
};
const TRACKS = {
  sleep: { name: "Sleep & Stress Recovery", color: "#1158d8", protocolKey: "energy",
    articles: [{ name: "Semax research overview", href: "/resources/semax-research-overview/" }, { name: "Lyophilized peptide storage", href: "/resources/lyophilized-peptide-storage/" }] },
  tissue: { name: "Training & Tissue Recovery", color: "#138f2d", protocolKey: "recovery",
    articles: [{ name: "BPC-157 research overview", href: "/resources/bpc-157-research-overview/" }, { name: "BPC-157 vs TB-500 for recovery", href: "/resources/bpc-157-vs-tb-500-recovery/" }] },
  hormonal: { name: "Energy & Hormonal Optimization", color: "#e5bd00", protocolKey: "strength",
    articles: [{ name: "CJC-1295 / Ipamorelin overview", href: "/resources/cjc1295-ipamorelin-research-overview/" }, { name: "CJC-1295 with vs without DAC", href: "/resources/cjc-1295-with-vs-without-dac/" }] },
  metabolic: { name: "Metabolic Optimization", color: "#ff4a12", protocolKey: "metabolic",
    articles: [{ name: "Retatrutide research overview", href: "/resources/retatrutide-research-overview/" }, { name: "Retatrutide vs tirzepatide", href: "/resources/retatrutide-vs-tirzepatide/" }] },
  systemic: { name: "Systemic Recovery", color: "#7a7f88", protocolKey: "recovery",
    articles: [{ name: "Common peptide research mistakes", href: "/resources/common-peptide-research-mistakes/" }, { name: "MOTS-c research overview", href: "/resources/mots-c-research-overview/" }] },
  foundations: { name: "Recovery Foundations", color: "#138f2d", protocolKey: null,
    articles: [{ name: "Common peptide research mistakes", href: "/resources/common-peptide-research-mistakes/" }, { name: "Peptide reconstitution guide", href: "/resources/peptide-reconstitution-bac-water-guide/" }] },
};

function formatIDR(n) { return "Rp" + Number(n).toLocaleString("en-US").replace(/,/g, "."); }
function protocolPrice(p) { return p.stack.reduce((t, [n]) => t + (COMPOUND_PRICES[n] || 0), 0); }
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function firstName(n) { return (n || "").trim().split(/\s+/)[0] || "there"; }

// Per-track recovery trajectory (mirrors the on-site chart). Rendered as a
// bulletproof table-based bar chart so it never depends on a remote image.
const CHART = {
  sleep: { label: "Sleep quality index", values: [52, 58, 66, 74, 80, 84] },
  tissue: { label: "Tissue recovery index", values: [48, 55, 64, 74, 82, 88] },
  hormonal: { label: "Daytime energy index", values: [50, 55, 62, 71, 78, 82] },
  metabolic: { label: "Metabolic health index", values: [47, 52, 60, 69, 77, 82] },
  systemic: { label: "Recovery capacity index", values: [45, 51, 60, 70, 78, 83] },
  foundations: { label: "Recovery capacity index", values: [55, 62, 70, 78, 84, 88] },
};
const WEEK_LABELS = ["Now", "W2", "W4", "W8", "W12", "W16"];
function barChart(trackKey, color) {
  const c = CHART[trackKey] || CHART.systemic;
  const rows = c.values.map((v, i) => `<tr>
        <td style="font-family:ui-monospace,monospace;font-size:11px;color:#888;padding:3px 8px 3px 0;white-space:nowrap">${WEEK_LABELS[i]}</td>
        <td style="padding:3px 0" width="100%">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#eeeeee" style="background:#eeeeee;table-layout:fixed;width:100%"><tr>
            <td bgcolor="${color}" width="${v}%" height="14" style="background:${color};width:${v}%;height:14px;font-size:0;line-height:0">&nbsp;</td>
            <td width="${100 - v}%" style="width:${100 - v}%;font-size:0;line-height:0">&nbsp;</td>
          </tr></table>
        </td>
      </tr>`).join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:10px 0 4px">
        <tr><td colspan="2" style="font-family:ui-monospace,monospace;font-size:11px;letter-spacing:.06em;color:#5d5d5d;padding-bottom:8px">${c.label.toUpperCase()}</td></tr>
        ${rows}
      </table>`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "method_not_allowed" }); }

  const body = req.body || {};
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const phoneDigits = phone.replace(/\D/g, "");
  const consent = body.consent === true;
  const result = body.result && typeof body.result === "object" ? body.result : {};
  const trackKey = typeof result.trackKey === "string" ? result.trackKey : "";
  const tier = typeof result.tier === "string" ? result.tier : "";
  const tierLabel = (typeof result.tierLabel === "string" ? result.tierLabel : tier).slice(0, 40);
  const scoreNum = Number(result.score);
  const maxNum = Number(result.max) || 15;
  const profile = (typeof result.profile === "string" ? result.profile : "").slice(0, 600);
  const priorities = Array.isArray(result.priorities) ? result.priorities.slice(0, 5).map((p) => String(p).slice(0, 160)) : [];

  if (!name || name.length > 120) return res.status(400).json({ error: "invalid_name" });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) return res.status(400).json({ error: "invalid_email" });
  if (phoneDigits.length < 8 || phoneDigits.length > 15) return res.status(400).json({ error: "invalid_phone" });
  if (!consent) return res.status(400).json({ error: "consent_required" });
  if (!TRACKS[trackKey]) return res.status(400).json({ error: "unknown_track" });

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "Zurich Biotech <hello@zurichbiotech.com>";
  const replyTo = process.env.RESEND_REPLY_TO || "info@zurichbiotech.com";
  if (!apiKey) return res.status(500).json({ error: "not_configured" });

  const track = TRACKS[trackKey];
  // Protocol shows on every result; client sends the resolved key (Foundations
  // derives one from the goal). Fall back defensively.
  const protocol = PROTOCOLS[result.protocolKey] || PROTOCOLS[track.protocolKey] || PROTOCOLS.recovery;
  const ctx = { name, email, phone, trackKey, track, tier, tierLabel, score: scoreNum, max: maxNum, profile, priorities, protocol };

  let resp;
  try {
    resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        from, to: [email], reply_to: replyTo,
        subject: `Your recovery result: ${track.name} (${tierLabel} tier)`,
        html: renderHtml(ctx), text: renderText(ctx),
        tags: [{ name: "source", value: "recovery-quiz" }, { name: "track", value: trackKey }],
      }),
    });
  } catch (err) {
    return res.status(502).json({ error: "send_failed", detail: String((err && err.message) || err) });
  }
  if (!resp.ok) { const detail = await resp.text().catch(() => ""); return res.status(502).json({ error: "send_failed", status: resp.status, detail }); }

  // internal team notification
  const notifyTo = process.env.LEAD_NOTIFY_EMAIL || "info@zurichbiotech.com";
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        from, to: [notifyTo], reply_to: email,
        subject: `New lead: ${name} - ${track.name} (${tierLabel})`,
        text: [
          "New Recovery Intelligence lead from zurichbiotech.com", "",
          `Name:    ${name}`, `Email:   ${email}`, `Phone:   ${phone}`, `Chat:    https://wa.me/${phoneDigits}`,
          `Score:   ${scoreNum} / ${maxNum} (${tierLabel} tier)`, `Limiter: ${track.name}`,
          protocol ? `Protocol shown: ${protocol.title}` : "Protocol shown: none (lifestyle tier)", "",
          "Reply to this email to reach the lead, or tap the Chat link to WhatsApp them.",
        ].join("\n"),
        tags: [{ name: "type", value: "lead-notification" }],
      }),
    });
  } catch (_) {}

  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (audienceId) {
    const [fn, ...rest] = name.split(/\s+/);
    fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ email, first_name: fn, last_name: rest.join(" ") || undefined, unsubscribed: false }),
    }).catch(() => {});
  }

  return res.status(200).json({ ok: true });
}

function waUrl(ctx) {
  const lines = [
    "Hi Zurich Biotech, I just completed the Recovery Intelligence assessment.", "",
    `Score: ${ctx.score} / ${ctx.max} (${ctx.tierLabel} tier)`,
    `Primary limiter: ${ctx.track.name}`,
  ];
  if (ctx.protocol) lines.push(`I'd like to order the "${ctx.protocol.title}" research protocol (${ctx.protocol.stack.map(([n, d]) => `${n} ${d}`).join(", ")}).`);
  else lines.push("I'd like the lifestyle starter guide for the Foundations track.");
  return `https://wa.me/${WA}?text=${encodeURIComponent(lines.join("\n"))}`;
}

function renderHtml(ctx) {
  const { track, protocol } = ctx;
  const priorities = ctx.priorities.map((p) => `<li style="margin:6px 0">${escapeHtml(p)}</li>`).join("");
  const articles = track.articles.map((a) => `<li style="margin:6px 0"><a href="${SITE}${a.href}" style="color:#e10600;text-decoration:none">${escapeHtml(a.name)}</a></li>`).join("");

  const protocolSection = `<tr><td style="padding:8px 32px 0">
         <h2 style="font-size:18px;font-weight:600;margin:16px 0 8px">3. The protocol we'd point you to</h2>
         <p style="margin:0 0 10px">Matched to your primary limiter. Research-grade compounds, sold for laboratory research only and best explored with a qualified healthcare professional. Research protocols here typically run <strong>${escapeHtml(protocol.duration)}</strong>, the timeline the literature works on, not a promise of a personal result.</p>
         <p style="margin:0 0 6px;font-family:ui-monospace,monospace;font-size:15px"><strong>${escapeHtml(protocol.title)}</strong></p>
         <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:ui-monospace,monospace;font-size:14px;border-top:1px solid #e7e7e7;margin:0 0 10px">
           ${protocol.stack.map(([n, d]) => `<tr><td style="padding:8px 0;border-bottom:1px solid #e7e7e7"><span style="color:#e10600">+</span> ${escapeHtml(n)}</td><td align="right" style="padding:8px 0;border-bottom:1px solid #e7e7e7">${escapeHtml(d)}</td></tr>`).join("")}
         </table>
         <p style="margin:0;font-family:ui-monospace,monospace;font-size:15px"><strong>${formatIDR(protocolPrice(protocol))}</strong> / protocol</p>
         ${ctx.tier === "HIGH" ? `<p style="margin:10px 0 0;color:#5d5d5d;font-size:13px">At your tier, baseline bloodwork and a conversation with a qualified healthcare professional are worth doing before starting anything.</p>` : ""}
         ${ctx.tier === "FOUNDATIONS" ? `<p style="margin:10px 0 0;color:#5d5d5d;font-size:13px">Honest take: at your score the basics above will do more than any compound. This is here for when you've locked those in.</p>` : ""}
       </td></tr>`;

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(`Your recovery result: ${track.name}`)}</title></head>
<body style="margin:0;padding:0;background:#fafafa;font-family:Helvetica,Arial,sans-serif;color:#090909;line-height:1.55">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border:1px solid #e7e7e7">
        <tr><td style="padding:32px 32px 0">
          <p style="margin:0;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#5d5d5d">Your recovery result</p>
          <h1 style="margin:6px 0 0;font-size:26px;font-weight:400">${escapeHtml(track.name)}<span style="color:#e10600">+</span></h1>
          <span style="display:inline-block;width:56px;height:4px;background:${track.color};margin-top:14px"></span>
        </td></tr>
        <tr><td style="padding:16px 32px 0">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="padding-right:28px"><span style="font-size:40px;font-weight:400;color:${track.color}">${ctx.score}</span><span style="font-family:ui-monospace,monospace;color:#5d5d5d"> / ${ctx.max}</span><br><span style="font-family:ui-monospace,monospace;font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:#5d5d5d">Recovery score</span></td>
            <td style="padding-right:28px"><span style="font-family:ui-monospace,monospace;font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:#5d5d5d">Tier</span><br><strong>${escapeHtml(ctx.tierLabel)}</strong></td>
            <td><span style="font-family:ui-monospace,monospace;font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:#5d5d5d">Primary limiter</span><br><strong>${escapeHtml(track.name)}</strong></td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:20px 32px 0">
          <h2 style="font-size:18px;font-weight:600;margin:8px 0 6px">1. Your result</h2>
          <p style="margin:0 0 12px">${escapeHtml(ctx.profile || "Your responses have been mapped to your primary recovery limiter above.")}</p>
          ${barChart(ctx.trackKey, track.color)}
          <p style="margin:8px 0 0;font-family:ui-monospace,monospace;font-size:11px;color:#888">Illustrative research-protocol pattern. Not a prediction or guarantee; individual responses vary.</p>
        </td></tr>
        <tr><td style="padding:20px 32px 0">
          <h2 style="font-size:18px;font-weight:600;margin:8px 0 6px">2. Start with the basics, no peptides required</h2>
          <p style="margin:0 0 8px">Nothing beats 7-9 hours of quality sleep, solid nutrition, and consistent training. Peptides will not fix a shaky foundation, and you will see most of your change from the basics first. Your priorities:</p>
          <ul style="padding-left:20px;margin:8px 0">${priorities}</ul>
          <p style="margin:8px 0 0"><a href="${SITE}${STARTER_PDF}" style="display:inline-block;background:#090909;color:#fff;text-decoration:none;padding:14px 22px;font-size:13px;letter-spacing:.04em;text-transform:uppercase;font-weight:700">Download the starter guide PDF +</a></p>
        </td></tr>
        ${protocolSection}
        <tr><td style="padding:20px 32px 0">
          <h2 style="font-size:18px;font-weight:600;margin:16px 0 8px">4. Research further</h2>
          <p style="margin:0 0 8px">If you want the science, start here. Everything is for research use only.</p>
          <ul style="padding-left:20px;margin:8px 0">${articles}</ul>
        </td></tr>
        <tr><td style="padding:24px 32px 32px">
          <a href="${waUrl(ctx)}" style="display:block;background:#090909;color:#fff;text-decoration:none;text-align:center;padding:18px;font-size:13px;letter-spacing:.04em;text-transform:uppercase;font-weight:700">${protocol ? "Order on WhatsApp +" : "Get your starter guide on WhatsApp +"}</a>
        </td></tr>
        <tr><td style="padding:0 32px 32px;color:#888;font-size:11px;line-height:1.6">
          <hr style="border:none;border-top:1px solid #e7e7e7;margin:0 0 16px"/>
          <p style="margin:0">This assessment is educational and is not a medical diagnosis, treatment, or prescription. Zurich Biotech supplies research-grade materials for laboratory research only; nothing here is medical advice and the compounds discussed are not for human consumption. Consult a qualified healthcare professional before changing your health routine. Orders are subject to our <a href="${SITE}/terms.html" style="color:#5d5d5d">terms</a>. You are receiving this because you completed the assessment on zurichbiotech.com.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function renderText(ctx) {
  const { track, protocol } = ctx;
  const lines = [
    `Hi ${firstName(ctx.name)},`, "",
    `Your recovery result: ${track.name}`,
    `Score: ${ctx.score} / ${ctx.max} (${ctx.tierLabel} tier)`, "",
    "1. YOUR RESULT", ctx.profile || "Your responses map to the limiter above.", "",
    "2. START WITH THE BASICS (no peptides required)",
    "Nothing beats 7-9 hours of sleep, solid nutrition, and consistent training. Priorities:",
    ...ctx.priorities.map((p) => `- ${p}`),
    `Starter guide: ${SITE}${STARTER_PDF}`, "",
  ];
  lines.push("3. THE PROTOCOL WE'D POINT YOU TO (research use only; discuss with a professional)",
    `Research protocols here typically run ${protocol.duration} (a research timeline, not a personal-results promise).`,
    `${protocol.title} (${formatIDR(protocolPrice(protocol))} / protocol): ${protocol.stack.map(([n, d]) => `${n} ${d}`).join(", ")}`, "");
  lines.push("4. RESEARCH FURTHER", ...track.articles.map((a) => `- ${a.name}: ${SITE}${a.href}`), "",
    `Continue on WhatsApp: ${waUrl(ctx)}`, "", "--",
    "Educational only; not a medical diagnosis or treatment. Research-grade materials for laboratory research only; not for human consumption. Consult a qualified healthcare professional. Terms: " + SITE + "/terms.html");
  return lines.join("\n");
}
