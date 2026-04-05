# CommVault Field Intelligence Hub — Build Plan
**Last Updated:** 2026-04-05  
**Target Users:** Sales Engineers (primary), Account Executives (secondary)

---

## What It Is

A daily briefing tool that aggregates real-time competitive intelligence, threat news, and regulatory updates — formatted for SE/AE use before calls, demos, and discovery sessions. Generated once per day at 6 AM, served to the whole team from a backend cache. Also sends an SMS digest to subscribed reps.

---

## Core Design Principles

1. **Facts first, suggestions second.** Sections 1–3 are pure news: what happened, source link, impact. The AI does not editorialize here. Section 4 (Deal Ammunition) is clearly labeled as AI-generated suggestions — a starting point, not a script.

2. **SEs know their deals better than any AI.** The talk tracks and deal ammo are conversation starters. The rep decides what's relevant based on their deal context, the prospect's pain, and the conversation they're actually in.

3. **Every item has a source link.** Real articles, not summaries of summaries. Reps can tap/click and read the actual source before a call.

4. **Generate once, serve to everyone.** Backend runs at 6 AM, stores result, all reps pull from cache. No redundant API calls, no waiting.

---

## Sections

### 1. Threat Landscape Pulse
- Search: ransomware events, cyberattacks, data breaches, security incidents — past 7 days
- Per item: what happened, who was affected, attack vector, estimated impact
- Severity badge: Critical / High / Medium / Low
- Source link(s) to real articles
- **No AI spin here — just the facts**

### 2. Policy & Regulatory Watch
- Search: US federal/state policies, executive orders, CISA directives, SEC cyber disclosure rules, NIS2, DR/BC/data protection regulatory guidance
- Per item: what changed, plain-english summary of what it means for buying urgency
- Source link to official or credible news source
- **No AI spin — just the facts**

### 3. Competitive Intelligence
- **Capped at 5 most relevant items per day** (AI filters, not us — see Relevance & Limits below)
- Covers both negative AND positive news — full picture of what competitors are doing
- **Primary:** Rubrik, Veeam, Cohesity/Veritas
- **Secondary:** Barracuda, SysCloud, Unitrends
- Per item: competitor tag, event type (outage / pricing / product / personnel / partnership / analyst / funding / etc.), date, source link, what happened
- Each item has a **Talk Track Idea** — visually separated, clearly labeled as a suggestion, one angle an SE *could* use. Rep decides if it's relevant.
- Event types to watch:
  - Outages / incidents
  - Price changes
  - Product launches / new features
  - Partnerships / integrations
  - Leadership changes (departures AND new hires)
  - Funding rounds / acquisitions
  - Analyst reports / awards / recognition
  - Customer wins / losses (if public)
  - Community sentiment (Reddit, G2, etc.)

### 4. Deal Ammunition
- **Clearly labeled: AI-generated suggestions — use as starting point**
- Disclaimer banner: "You know your deals better than any AI. Treat these as conversation starters."
- 3–5 talking points that connect today's news to a Commvault capability
- Each point references which section(s) it draws from
- Ties real events → Commvault strengths (cleanroom recovery, threat scan, auto-recovery, cloud-native, Metallic SaaS, etc.)

---

## Relevance & Item Limits

### How relevance is determined
The AI scores items through a Commvault SE lens before deciding what to include. The system prompt instructs it to prioritize:
1. **Buying triggers** — events that create urgency (breach, outage, compliance deadline, price hike)
2. **Competitor signal** — anything directly involving Rubrik, Veeam, Cohesity/Veritas, Barracuda, SysCloud, Unitrends
3. **Vertical fit** — healthcare, financial services, federal, enterprise (Commvault's primary markets)
4. **Domain relevance** — must be about data protection, backup, recovery, or cyber resilience specifically — not generic IT news

### Per-section caps (AI filters, not us)
The system prompt tells the AI: *"Return no more than N items. If you find more, keep only the most relevant by the criteria above and discard the rest."*

| Section | Cap |
|---|---|
| Threat Landscape | 5 items |
| Policy & Regulatory | 4 items |
| Competitive Intelligence | 5 items |
| Deal Ammunition | 3–5 talking points |

---

## SMS Digest

- Sent at 6:15 AM (after briefing is generated at 6 AM)
- **Fact-only** — no AI suggestions in SMS
- **iMessage-style** (longer is fine — reps have smartphones)

### SMS item format — two tiers per section:

**Tier 1 — Featured (top 2–3 per section):** 2–3 sentence summary the rep can actually read and absorb without clicking. Enough to walk into a call with it. Source link at the end.

**Tier 2 — Headlines (remaining items):** One line + source link only. Still there, just not expanded.

Example:
```
🔴 THREATS
• A major US healthcare network was hit by ransomware Thursday —
  backups were targeted first, causing a 6-day outage. The org paid
  $4.2M ransom after backup systems were rendered unusable. Attack
  vector: unpatched VMware ESXi. [Reuters]

• NYC broker-dealer loses 18 months of transaction data after silent
  backup corruption — only caught during a DR test. SEC notified. [Dark Reading]

── Also this week ──
• Ransomware group targets school district in TX [link]
• UK logistics firm, 3-day downtime, cause under investigation [link]

🎯 COMPETITIVE
• Rubrik's cloud vault went down for 4 hours Thursday — customers
  couldn't initiate recovery jobs or access the console. 9 complaints
  confirmed on r/sysadmin. No official root cause posted yet. [The Register]

• Veeam announced an 18% price increase effective June 1, with only
  30 days notice to partners. Several large VARs quoted in CRN as
  actively evaluating alternatives. [CRN]

── Also today ──
• Cohesity federal VP departs — second senior exit in 60 days [LinkedIn]

Full briefing + talk tracks → intel.commvault.com/today
```

### How featured vs. headline is determined
Same relevance scoring used for web briefing. The AI ranks items 1–N per section. Top 2–3 get the expanded treatment, rest are headlines. Reps can always open the full briefing for everything.

---

## Architecture

### Backend (Node.js — simple)
- **Cron job at 6:00 AM ET** — runs 4 API calls in parallel (one per section)
- Stores result in DB or flat JSON file with date key
- Sends SMS digest via Twilio at 6:15 AM
- Exposes single endpoint: `GET /api/briefing/today` → returns cached result (instant)

### Frontend (React)
- Pulls from `/api/briefing/today` on load — no generation on client
- Dark mode dashboard
- Each section collapsible/expandable
- Timestamp: "Generated Today, 6:02 AM ET"
- Regenerate button (admin only or rate-limited)
- Copy to Clipboard button per section
- Loading states
- Mobile-responsive

### API
- Anthropic API with `web_search_20250305` tool enabled
- Model: `claude-sonnet-4-20250514`
- Each section = its own independently defined system prompt (easy to tweak)
- API key lives on backend — never exposed to client

---

## UI Reference
- Mockup: `/home/marek/Intelligence Hub/mockup.html`
- Running at: http://localhost:9090/mockup.html

---

## Build Order
1. [ ] Finalize section prompts (system prompt per section as labeled constants)
2. [ ] Backend: Express server + cron + Anthropic API calls + JSON cache
3. [ ] Backend: `/api/briefing/today` endpoint
4. [ ] Frontend: React app shell, dark mode, layout
5. [ ] Frontend: Wire sections to API, loading states, collapsible
6. [ ] Frontend: Copy to clipboard per section
7. [ ] SMS: Twilio integration, digest formatter
8. [ ] Deploy

---

## Open Questions
- Who can hit Regenerate? All reps or admin only?
- Twilio sender number / verified list of recipients
- Hosting target (Vercel, Railway, VPS?)
