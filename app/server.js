// server.js — Med-Spa AI Support Bot API + Widget
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import stringSimilarity from 'string-similarity';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use('/public', express.static(path.join(__dirname, 'public')));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const BOOKING_URL = process.env.BOOKING_URL || 'https://www.vagaro.com/';
const PORT = process.env.PORT || 3000;

console.log('[BOOT] Med-Spa bot start');
console.log('[BOOT] PORT=%s', PORT);
console.log('[BOOT] BOOKING_URL set? %s', !!BOOKING_URL);
console.log('[BOOT] OpenAI enabled? %s', !!OPENAI_API_KEY);

// Minimal knowledge base
const KNOWLEDGE = [
  { q: 'What services do you offer?', a: 'We offer Botox, fillers, laser hair removal, facials, peels, microneedling, body contouring. Type "pricing" or click Book Now.' },
  { q: 'How do I book an appointment?', a: `Use Book Now or this link: ${BOOKING_URL}` },
  { q: 'Cancellation policy', a: '24 hours notice required. Late cancels/no-shows may incur a fee.' },
  { q: 'Where are you located?', a: '123 Main St, Suite 200. Free parking available.' },
  { q: 'What are your hours?', a: 'Mon–Fri 9–6, Sat 10–3, Sun closed.' }
];

function detectBookingIntent(t='') {
  t = t.toLowerCase();
  return ['book','schedule','appointment','consult','reserve'].some(k=>t.includes(k));
}
function matchFAQ(text='') {
  const qs = KNOWLEDGE.map(k=>k.q);
  const { bestMatch } = stringSimilarity.findBestMatch(text, qs);
  const idx = bestMatch?.target ? qs.indexOf(bestMatch.target) : -1;
  return bestMatch?.rating >= 0.4 && idx >= 0 ? KNOWLEDGE[idx].a : null;
}

const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;
async function aiAnswer(user, lead, kbAnswer) {
  if (!openai) return kbAnswer || null;
  const system = `You are a concise concierge for a medical spa. Avoid medical advice. If asked to book, send the user to ${BOOKING_URL}.`;
  const kb = KNOWLEDGE.map(k=>`Q: ${k.q}\nA: ${k.a}`).join('\n\n');
  try {
    const resp = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: `KB:\n${kb}\n\nUser: ${user}` }
      ],
      temperature: 0.3,
      max_tokens: 250
    });
    return resp.choices?.[0]?.message?.content?.trim() || kbAnswer;
  } catch (e) {
    console.error('[AI] error:', e?.message || e);
    return kbAnswer;
  }
}

function redactLead(lead={}) {
  const mask = s => (s ? s[0] + '***' + (s.includes('@') ? '@' + s.split('@')[1] : '') : '');
  return { name: lead.name||'', email: mask(lead.email||''), phone: (lead.phone||'').replace(/(\d{3})\d+(\d{2})/,'$1****$2') };
}

app.post('/api/chat', async (req, res) => {
  try {
    const { message, lead } = req.body || {};
    console.log('[CHAT] msg="%s" lead=%j', message, redactLead(lead));
    if (!message || typeof message !== 'string') return res.status(400).json({ error: 'message is required' });

    if (detectBookingIntent(message)) {
      return res.json({
        reply: `I can help you book right now. Use this link: ${BOOKING_URL}`,
        booking: { url: BOOKING_URL }
      });
    }

    const kb = matchFAQ(message);
    const reply = await aiAnswer(message, lead, kb);
    return res.json({ reply: reply || `You can book instantly here: ${BOOKING_URL}` });
  } catch (e) {
    console.error('[CHAT] error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`Med-Spa bot running on http://localhost:${PORT}`));