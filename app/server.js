// app/server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files (like index.html, widget.js, etc)
app.use(express.static(path.join(__dirname, "../public")));

// API route (for your chat endpoint)
app.get("/api/chat", (req, res) => {
  res.json({ message: "Hello from MedSpa Bot backend!" });
});

// Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});