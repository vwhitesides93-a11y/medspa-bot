// Med-Spa Bot — API + static widget
import express from "express";
import cors from "cors";
import compression from "compression";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import stringSimilarity from "string-similarity";
import { OpenAI } from "openai";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use("/public", express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;
const BOOKING_URL =
  process.env.BOOKING_URL || "https://calendly.com/yourname/medspa-appointment";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

// ---- minimal knowledge base (edit for your spa) ----
const KB = [
  {
    q: "What services do you offer?",
    a: "We offer Botox, fillers, laser hair removal, facials, chemical peels, microneedling, and body contouring. For menu & pricing, ask for pricing or click Book Now."
  },
  {
    q: "How do I book an appointment?",
    a: `Tap Book Now or use this link: ${BOOKING_URL}`
  },
  {
    q: "What is your cancellation policy?",
    a: "24 hours notice required for cancellations or rescheduling. Late cancels/no-shows may be charged a fee."
  },
  {
    q: "Where are you located?",
    a: "123 Main St, Suite 200. Free parking available."
  },
  {
    q: "What are your hours?",
    a: "Mon–Fri 9am–6pm, Sat 10am–3pm, Sun closed."
  }
];

// ---- helpers ----
function detectBookingIntent(text = "") {
  const t = text.toLowerCase();
  return ["book", "schedule", "appointment", "consult", "reserve"].some(k =>
    t.includes(k)
  );
}

function matchFAQ(text = "") {
  const questions = KB.map(k => k.q);
  const { bestMatch } = stringSimilarity.findBestMatch(text, questions);
  const idx = bestMatch?.target ? questions.indexOf(bestMatch.target) : -1;
  return bestMatch?.rating >= 0.4 && idx >= 0 ? KB[idx].a : null;
}

const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

async function aiAnswer(userMessage, lead, kbAnswer) {
  if (!openai) return kbAnswer || null;
  const system = `You are a helpful, concise concierge for a medical spa. Avoid medical advice. If asked to book, direct to ${BOOKING_URL}.`;
  const kb = KB.map(k => `Q: ${k.q}\nA: ${k.a}`).join("\n\n");

  try {
    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 250,
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: `Knowledge Base:\n${kb}\n\nLead: ${JSON.stringify(
            lead || {}
          )}\n\nUser: ${userMessage}`
        }
      ]
    });
    return resp.choices?.[0]?.message?.content?.trim() || kbAnswer;
  } catch (e) {
    console.error("[AI] error:", e?.message || e);
    return kbAnswer;
  }
}

// ---- routes ----
app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.post("/api/chat", async (req, res) => {
  try {
    const { message, lead } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "message is required" });
    }

    // booking intent → send link
    if (detectBookingIntent(message)) {
      return res.json({
        reply: `I can help you book right now. Use this link to choose your service and time: ${BOOKING_URL}`,
        booking: { url: BOOKING_URL }
      });
    }

    // FAQ quick hit
    const kb = matchFAQ(message);

    // AI fallback/augmentation
    const reply = await aiAnswer(message, lead, kb);

    return res.json({
      reply:
        reply ||
        `I’ll confirm that with our front desk. In the meantime, you can book instantly here: ${BOOKING_URL}`
    });
  } catch (err) {
    console.error("[/api/chat] error", err);
    res.status(500).json({ error: "Server error" });
  }
});

// demo page
app.get("/", (_req, res) =>
  res.sendFile(path.join(__dirname, "public", "index.html"))
);

app.listen(PORT, () =>
  console.log(`✅ Med-Spa bot running on http://localhost:${PORT}`)
);