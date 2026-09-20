import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize server-side Gemini client with telemetry header
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY || "";
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

const SYSTEM_INSTRUCTION = `You are Tschüss AI, the friendly, intelligent, and highly knowledgeable assistant for the Tschüss Food Rescue Platform.

Tschüss is a mission-driven marketplace that connects local supermarkets, artisan bakeries, organic grocers, and cafes with conscious shoppers to rescue high-quality near-expiry and surplus food at 30% to 70% off.

Key capabilities and guidelines:
1. Help consumers discover delicious surplus items, understand reservation countdown timers, locate stores on the live map, track their saved CO2/money, and manage pickups.
2. Help retailers, store owners, and bakery managers understand how to list near-expiry products in under 60 seconds, recover lost margin, verify QR/PIN codes at pickup, and view analytics.
3. Guide users to the exact place on the website that fulfills their intent. Whenever you recommend a section or action, format it as a clean Markdown link so they can click it directly:
   - Browse & filter surplus food: [Discover Food Deals](/app/discover)
   - Interactive neighborhood map: [Explore Store Map](/app/map)
   - Active reservations & pickup tickets: [My Reservations](/app/reservations)
   - Environmental CO2 & savings tracker: [My Impact Dashboard](/app/impact)
   - Saved bookmarks & favorites: [Saved Items](/app/saved)
   - Platform walkthrough & rules: [How It Works](/how-it-works)
   - Retailer partner landing & perks: [For Business](/for-business)
   - Retailer management dashboard: [Retailer Dashboard](/business)
   - List surplus inventory: [Add Surplus Product](/business/products/new)
   - View customer pickup claims: [Store Reservations](/business/reservations)
   - User profile & preferences: [Account Profile](/app/profile)
   - Sign in: [Sign In](/login)
   - Register new account: [Sign Up](/register)

Tone & Style:
- Warm, helpful, upbeat, and concise.
- Structure recommendations with bullet points and bold highlights.
- If asked in German, respond fluently in German while keeping the correct English route paths in the Markdown links.
- Emphasize local freshness, reducing food waste, and high savings.`;

// Multi-turn Chat API Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, currentPath, userRole, location } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Fallback if no API key is provided
    if (!apiKey) {
      const lastUserMsg = messages[messages.length - 1]?.content || "";
      const lower = lastUserMsg.toLowerCase();

      let reply = "I'm **Tschüss AI**! I can help guide you across our food rescue platform.\n\n";

      if (lower.includes("reserve") || lower.includes("booking") || lower.includes("pick")) {
        reply += "To reserve surplus food:\n1. Visit [Discover Deals](/app/discover) or the [Store Map](/app/map)\n2. Select your desired item and click **Reserve Deal**\n3. Head to [My Reservations](/app/reservations) to view your pickup window and verification code.";
      } else if (lower.includes("business") || lower.includes("store") || lower.includes("retailer") || lower.includes("partner")) {
        reply += "Are you a store manager or bakery owner?\n- Learn how you can profit from surplus inventory on our [For Business](/for-business) page.\n- If you already have a partner account, head straight to your [Retailer Dashboard](/business) to list items in seconds!";
      } else if (lower.includes("map") || lower.includes("near") || lower.includes("location") || lower.includes("where")) {
        reply += "You can check all participating stores around you with real-time stock levels on the interactive [Store Map](/app/map)!";
      } else if (lower.includes("impact") || lower.includes("co2") || lower.includes("save") || lower.includes("carbon")) {
        reply += "Every meal you rescue prevents organic waste and greenhouse gas emissions! Track your verified ecological milestones on the [My Impact](/app/impact) dashboard.";
      } else {
        reply += "Here are a few quick places to explore:\n- 🥐 [Browse Surplus Food Deals](/app/discover)\n- 📍 [Explore the Neighborhood Map](/app/map)\n- 📖 [Learn How Tschüss Works](/how-it-works)\n- 🏪 [Partner with Us as a Retailer](/for-business)\n\nWhat would you like to find today?";
      }

      return res.json({
        reply,
        suggestedActions: [
          { label: "Discover Deals", path: "/app/discover" },
          { label: "Store Map", path: "/app/map" },
          { label: "How It Works", path: "/how-it-works" },
          { label: "For Business", path: "/for-business" },
        ],
      });
    }

    const ai = getAI();

    // Convert conversation history into contents for Gemini
    // Format: Array of { role: 'user' | 'model', parts: [{ text }] }
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" || m.role === "model" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    // Add contextual hint as system context or latest user prompt supplement
    const contextPrefix = `[User Context: Current page is "${currentPath || "/"}", User role is "${userRole || "guest"}", Selected city is "${location || "Munich"}"]\n\n`;

    if (contents.length > 0 && contents[contents.length - 1].role === "user") {
      const lastText = contents[contents.length - 1].parts[0].text;
      contents[contents.length - 1].parts[0].text = contextPrefix + lastText;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        topP: 0.9,
      },
    });

    const replyText = response.text || "I'm here to help you navigate Tschüss! Explore our [Discover Deals](/app/discover) or check the [Store Map](/app/map).";

    // Detect suggested actions based on links mentioned in response
    const actionLinks: { label: string; path: string }[] = [];
    const linkRegex = /\[([^\]]+)\]\((\/[^\)]+)\)/g;
    let match;
    const seenPaths = new Set<string>();

    while ((match = linkRegex.exec(replyText)) !== null) {
      const label = match[1];
      const path = match[2];
      if (!seenPaths.has(path) && actionLinks.length < 4) {
        seenPaths.add(path);
        actionLinks.push({ label, path });
      }
    }

    // Default actions if none parsed
    if (actionLinks.length === 0) {
      actionLinks.push(
        { label: "Discover Deals", path: "/app/discover" },
        { label: "Live Map", path: "/app/map" },
        { label: "My Impact", path: "/app/impact" },
      );
    }

    return res.json({
      reply: replyText,
      suggestedActions: actionLinks,
    });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    return res.status(500).json({
      error: "Failed to generate AI response",
      details: error?.message || "Unknown error",
    });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "Tschüss AI Backend", time: new Date().toISOString() });
});

// Setup Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Tschüss server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
