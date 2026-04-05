require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const { generateAll, loadTodayBriefing } = require('./generate');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }));
app.use(express.json());

// GET /api/briefing/today — serve cached briefing instantly
app.get('/api/briefing/today', (req, res) => {
  const briefing = loadTodayBriefing();
  if (!briefing) {
    return res.status(404).json({ error: 'No briefing generated yet today' });
  }
  res.json(briefing);
});

// POST /api/generate — manual regenerate trigger (waits for completion)
app.post('/api/generate', async (req, res) => {
  try {
    const briefing = await generateAll();
    console.log('[server] Manual regeneration complete');
    res.json(briefing);
  } catch (err) {
    console.error('[server] Manual regeneration failed:', err.message);
    res.status(500).json({ error: 'Generation failed' });
  }
});

// GET /api/complaints/:vendor — serve static complaint research
app.get('/api/complaints/:vendor', (req, res) => {
  const vendor = req.params.vendor.toLowerCase();
  const allowed = ['rubrik', 'veeam', 'cohesity'];
  if (!allowed.includes(vendor)) return res.status(404).json({ error: 'Unknown vendor' });
  const file = require('path').join(__dirname, 'complaints', `${vendor}.json`);
  if (!require('fs').existsSync(file)) return res.status(404).json({ error: 'Not found' });
  res.json(JSON.parse(require('fs').readFileSync(file, 'utf8')));
});

// GET /api/status — check if generation is in progress (simple poll endpoint)
app.get('/api/status', (req, res) => {
  const briefing = loadTodayBriefing();
  res.json({ hasToday: !!briefing, generated_at: briefing?.generated_at ?? null });
});

// Cron: run at 6 AM ET daily (10:00 UTC)
cron.schedule('0 10 * * *', async () => {
  console.log('[cron] 6 AM ET — starting daily briefing generation');
  try {
    await generateAll();
  } catch (err) {
    console.error('[cron] Generation failed:', err.message);
  }
});

app.listen(PORT, () => {
  console.log(`[server] Intelligence Hub backend running on http://localhost:${PORT}`);
  console.log('[server] Cron scheduled: 6:00 AM ET daily');
});
