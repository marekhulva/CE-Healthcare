require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');
const { PROMPT_THREATS, PROMPT_POLICY, PROMPT_COMPETITIVE } = require('./prompts');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function getTodayDateString() {
  return new Date().toISOString().split('T')[0];
}

function getCacheFilePath(date) {
  return path.join(__dirname, 'cache', `briefing-${date}.json`);
}

function extractJSON(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) return text.trim();
  return text.slice(start, end + 1);
}

function stripCitations(obj) {
  if (typeof obj === 'string') {
    return obj.replace(/<cite[^>]*>/g, '').replace(/<\/cite>/g, '').replace(/\s+/g, ' ').trim();
  }
  if (Array.isArray(obj)) return obj.map(stripCitations);
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, stripCitations(v)]));
  }
  return obj;
}

async function generateSection(sectionName, prompt) {
  console.log(`[generate] Starting section: ${sectionName}`);
  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 }],
      messages: [{ role: 'user', content: prompt }],
    });

    const textBlock = response.content.findLast(block => block.type === 'text');
    if (!textBlock) {
      console.error(`[generate] No text block in response for ${sectionName}`);
      return { items: [], error: true };
    }

    const cleaned = extractJSON(textBlock.text);

    try {
      const parsed = stripCitations(JSON.parse(cleaned));
      console.log(`[generate] Section ${sectionName} complete — ${parsed.items?.length ?? 0} items`);
      return parsed;
    } catch (parseErr) {
      console.error(`[generate] JSON parse failed for ${sectionName}:`, parseErr.message);
      console.error(`[generate] Raw response:`, textBlock.text.slice(0, 500));
      return { items: [], error: true };
    }
  } catch (err) {
    console.error(`[generate] API call failed for ${sectionName}:`, err.message);
    return { items: [], error: true };
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function buildPrompt(template) {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const yesterday = new Date(now - 86400000).toISOString().split('T')[0];
  return template
    .replace('{{TODAY}}', today)
    .replace('{{YESTERDAY}}', yesterday);
}

function generateMock() {
  console.log('[generate] DEV_MODE — returning mock data instantly');
  return {
    generated_at: new Date().toISOString(),
    sections: {
      threats: {
        items: [
          { title: 'Major healthcare network hit by ransomware, 6-day outage', summary: 'A US healthcare network suffered a ransomware attack that encrypted backup systems first, causing a 6-day outage affecting patient records. The organization paid $4.2M ransom after recovery systems were rendered unusable.', source_name: 'BleepingComputer', source_url: 'https://bleepingcomputer.com', date: new Date().toISOString().split('T')[0], severity: 'critical', featured: true },
          { title: 'NYC financial firm loses 18 months of data after backup corruption', summary: 'A mid-size broker-dealer discovered their backup chain had been silently corrupted for 18 months, only surfacing during a DR test. SEC notified under cyber disclosure rules.', source_name: 'Dark Reading', source_url: 'https://darkreading.com', date: new Date().toISOString().split('T')[0], severity: 'high', featured: true },
          { title: 'School district in Texas hit by ransomware, systems down 3 days', summary: 'A Texas school district had all systems encrypted over the weekend. IT staff are working to restore from backups but have not confirmed recovery timeline.', source_name: 'The Record', source_url: 'https://therecord.media', date: new Date().toISOString().split('T')[0], severity: 'high', featured: false },
        ]
      },
      policy: {
        items: [
          { title: 'CISA issues updated cyber resilience guidance for critical infrastructure', summary: 'CISA released updated guidance requiring critical infrastructure operators to conduct documented DR exercises twice annually. Non-compliance affects federal grant eligibility.', source_name: 'CISA', source_url: 'https://cisa.gov', date: new Date().toISOString().split('T')[0], severity: 'high', featured: true },
          { title: 'SEC clarifies backup failure qualifies as material cyber incident', summary: 'New SEC guidance explicitly states that backup failure resulting in data unavailability qualifies as a material cybersecurity incident requiring 8-K disclosure within 4 business days.', source_name: 'SEC.gov', source_url: 'https://sec.gov', date: new Date().toISOString().split('T')[0], severity: 'high', featured: true },
        ]
      },
      competitive: {
        items: [
          { competitor: 'Rubrik', event_type: 'outage', sentiment: 'negative', title: 'Rubrik cloud vault down 4 hours, recovery jobs blocked', summary: 'Rubrik cloud vault experienced a 4-hour outage. Customers reported inability to initiate recovery jobs or access the management console. No official root cause posted.', source_name: 'The Register', source_url: 'https://theregister.com', date: new Date().toISOString().split('T')[0], featured: true },
          { competitor: 'Veeam', event_type: 'pricing', sentiment: 'negative', title: 'Veeam announces 18% price increase effective June 1', summary: 'Veeam notified resellers of an 18% price increase on Universal Licensing effective June 1. Several large VAR partners quoted as actively evaluating alternatives.', source_name: 'CRN', source_url: 'https://crn.com', date: new Date().toISOString().split('T')[0], featured: true },
          { competitor: 'Cohesity', event_type: 'personnel', sentiment: 'negative', title: 'Cohesity federal VP departs — second senior exit in 60 days', summary: 'Cohesity VP of Federal Sales announced departure on LinkedIn. This follows the February exit of their Federal SE Director.', source_name: 'LinkedIn', source_url: 'https://linkedin.com', date: new Date().toISOString().split('T')[0], featured: false },
        ]
      },
      deal_ammo: { items: [] },
    }
  };
}

async function generateAll() {
  if (process.env.DEV_MODE === 'true') {
    const briefing = generateMock();
    const date = getTodayDateString();
    fs.writeFileSync(getCacheFilePath(date), JSON.stringify(briefing, null, 2));
    return briefing;
  }

  console.log('[generate] Starting full briefing generation...');
  const startTime = Date.now();

  // Sequential with delay between sections to stay under rate limits
  const threats = await generateSection('threats', buildPrompt(PROMPT_THREATS));
  console.log('[generate] Waiting 65s before next section...');
  await sleep(65000);

  const policy = await generateSection('policy', buildPrompt(PROMPT_POLICY));
  console.log('[generate] Waiting 65s before next section...');
  await sleep(65000);

  const competitive = await generateSection('competitive', buildPrompt(PROMPT_COMPETITIVE));

  const briefing = {
    generated_at: new Date().toISOString(),
    sections: {
      threats,
      policy,
      competitive,
      deal_ammo: { items: [] },
    },
  };

  const date = getTodayDateString();
  const cacheFile = getCacheFilePath(date);
  fs.writeFileSync(cacheFile, JSON.stringify(briefing, null, 2));

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`[generate] Briefing complete in ${elapsed}s — saved to ${cacheFile}`);

  return briefing;
}

function loadTodayBriefing() {
  const date = getTodayDateString();
  const cacheFile = getCacheFilePath(date);
  if (fs.existsSync(cacheFile)) {
    return JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
  }
  return null;
}

module.exports = { generateAll, loadTodayBriefing };
