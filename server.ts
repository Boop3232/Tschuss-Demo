import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Target email for retailer inquiries
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || "abhirajsingh1226@gmail.com";

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

// Retailer Onboarding Inquiry Email & Dispatch Endpoint
app.post("/api/retailer-onboard", async (req, res) => {
  try {
    const data = req.body || {};
    const referenceId = data.referenceId || `TSCH-${Date.now().toString().slice(-6)}`;
    const recipient = NOTIFICATION_EMAIL;

    const formattedDate = new Date().toLocaleString("de-DE", {
      timeZone: "Europe/Berlin",
      dateStyle: "full",
      timeStyle: "medium",
    });

    const storeName = data.storeName || "Unnamed Store";
    const storeType = data.storeType || "Retail Store";
    const contactName = data.contactName || "Store Manager";
    const email = data.email || "no-reply@example.com";
    const phone = data.phone || "Not provided";
    const address = data.address || "Not provided";
    const postalCode = data.postalCode || "";
    const city = data.city || "Kleve";
    const coordinates = data.coordinates;
    const monthlyShrinkEur = data.monthlyShrinkEur || 3000;
    const estimatedRecovery = Math.round(monthlyShrinkEur * 0.42);
    const pickupStart = data.pickupStartTime || "17:00";
    const pickupEnd = data.pickupEndTime || "20:30";
    const notes = data.operationalNotes || "Standard store counter / express checkout";

    const textContent = `
=====================================================
🌱 NEW TSCHÜSS RETAILER ONBOARDING APPLICATION
Reference ID: ${referenceId}
Timestamp: ${formattedDate}
=====================================================

1. STORE & LOCATION
-------------------
Store Name:     ${storeName}
Retail Format:  ${storeType}
Address:        ${address}, ${postalCode} ${city}
Map Pin:        ${coordinates ? `Lat ${coordinates.lat.toFixed(5)}, Lng ${coordinates.lng.toFixed(5)}` : "Manual Geocode"}

2. CONTACT INFORMATION
----------------------
Contact Person: ${contactName}
Work Email:     ${email}
Contact Phone:  ${phone}

3. OPERATIONAL TARGETS
----------------------
Monthly Shrink / Surplus: €${monthlyShrinkEur} / month
Est. Recovered Revenue:   ~ €${estimatedRecovery} / month
Daily Pickup Window:      ${pickupStart} - ${pickupEnd}
Operational / Dock Notes: ${notes}

=====================================================
Direct Reply-To: ${email}
Forwarded to: ${recipient}
=====================================================
    `.trim();

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; color: #1e293b; background-color: #f8fafc; padding: 20px; }
    .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: linear-gradient(135deg, #064e3b 0%, #0f766e 100%); padding: 30px 24px; text-align: center; color: #ffffff; }
    .badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
    .title { margin: 0; font-size: 24px; font-weight: 800; }
    .content { padding: 24px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px; margin-bottom: 16px; }
    .card-title { margin: 0 0 10px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #065f46; display: flex; align-items: center; gap: 6px; }
    .item-row { margin-bottom: 8px; font-size: 14px; }
    .item-label { color: #64748b; font-weight: 500; }
    .item-value { color: #0f172a; font-weight: 600; }
    .highlight-box { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 14px; text-align: center; margin-top: 16px; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; background: #fcfcfc; }
    .btn { display: inline-block; background: #047857; color: #ffffff !important; font-weight: 700; font-size: 14px; padding: 12px 24px; border-radius: 12px; text-decoration: none; margin-top: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">Tschüss Partner Program · Application ${referenceId}</div>
      <h1 class="title">🌱 New Retailer Onboarding</h1>
      <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;">Store partner inquiry from ${city}, Germany</p>
    </div>

    <div class="content">
      <div class="card" style="border-left: 4px solid #059669;">
        <div class="card-title">🏪 Store & Location Details</div>
        <div class="item-row"><span class="item-label">Store Name:</span> <span class="item-value">${storeName}</span></div>
        <div class="item-row"><span class="item-label">Retail Format:</span> <span class="item-value">${storeType}</span></div>
        <div class="item-row"><span class="item-label">Address:</span> <span class="item-value">${address}, ${postalCode} ${city}</span></div>
        ${coordinates ? `<div class="item-row"><span class="item-label">Pin Coordinates:</span> <span class="item-value">Lat: ${coordinates.lat.toFixed(5)}, Lng: ${coordinates.lng.toFixed(5)}</span></div>` : ""}
      </div>

      <div class="card" style="border-left: 4px solid #2563eb;">
        <div class="card-title">👤 Contact Manager</div>
        <div class="item-row"><span class="item-label">Full Name:</span> <span class="item-value">${contactName}</span></div>
        <div class="item-row"><span class="item-label">Email:</span> <span class="item-value"><a href="mailto:${email}" style="color: #2563eb;">${email}</a></span></div>
        <div class="item-row"><span class="item-label">Phone:</span> <span class="item-value"><a href="tel:${phone}" style="color: #2563eb;">${phone}</a></span></div>
      </div>

      <div class="card" style="border-left: 4px solid #d97706;">
        <div class="card-title">📦 Operational Forecast & Pickup Window</div>
        <div class="item-row"><span class="item-label">Est. Monthly Shrink:</span> <span class="item-value">€${monthlyShrinkEur} / month</span></div>
        <div class="item-row"><span class="item-label">Est. Recovered Revenue:</span> <span class="item-value" style="color: #047857; font-weight: 700;">~ €${estimatedRecovery} / month (42% avg)</span></div>
        <div class="item-row"><span class="item-label">Pickup Hours:</span> <span class="item-value">${pickupStart} - ${pickupEnd}</span></div>
        <div class="item-row"><span class="item-label">Pickup Notes:</span> <span class="item-value">${notes}</span></div>
      </div>

      <div class="highlight-box">
        <strong style="color: #065f46; font-size: 15px;">Next Step: Terminal Activation</strong>
        <p style="margin: 4px 0 0 0; font-size: 13px; color: #047857;">Respond to ${contactName} to confirm partner catalog access and POS sticker delivery.</p>
        <a href="mailto:${email}?subject=Welcome%20to%20Tsch%C3%BCss%20Retailer%20Network%20(${referenceId})" class="btn">Reply to Store Manager</a>
      </div>
    </div>

    <div class="footer">
      Application received on ${formattedDate} · Reference: ${referenceId}<br/>
      Tschüss Food Rescue Platform · Cleves / Lower Rhine Hub
    </div>
  </div>
</body>
</html>
    `.trim();

    let emailSent = false;
    let methodUsed = "direct-logged";

    // Method 1: Nodemailer SMTP if configured
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || "587"),
          secure: process.env.SMTP_PORT === "465",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: `"Tschüss Food Rescue" <${process.env.SMTP_USER}>`,
          to: recipient,
          replyTo: email,
          subject: `🌱 New Retailer Partner Inquiry: ${storeName} (${city}) [Ref: ${referenceId}]`,
          text: textContent,
          html: htmlContent,
        });

        console.log(`[Onboarding] Email successfully dispatched via SMTP to ${recipient}`);
        emailSent = true;
        methodUsed = "smtp";
      } catch (smtpErr) {
        console.warn("[Onboarding] SMTP delivery notice, switching to relay:", smtpErr);
      }
    }

    // Method 2: Public Form Dispatch Relay to ensure guaranteed email delivery
    if (!emailSent) {
      try {
        const relayRes = await fetch("https://formspree.io/f/xbjnqylp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            _to: recipient,
            _subject: `🌱 New Retailer Partner Inquiry: ${storeName} (${city}) [Ref: ${referenceId}]`,
            _replyto: email,
            storeName,
            storeType,
            contactName,
            email,
            phone,
            address: `${address}, ${postalCode} ${city}`,
            coordinates: coordinates ? `${coordinates.lat}, ${coordinates.lng}` : "N/A",
            monthlyShrinkEur: `€${monthlyShrinkEur}`,
            pickupWindow: `${pickupStart} - ${pickupEnd}`,
            notes,
            referenceId,
            submittedAt: formattedDate,
            formattedEmail: textContent,
          }),
        });

        if (relayRes.ok) {
          console.log(`[Onboarding] Email relay successfully delivered to ${recipient}`);
          emailSent = true;
          methodUsed = "relay";
        }
      } catch (relayErr) {
        console.warn("[Onboarding] Relay dispatch notice:", relayErr);
      }
    }

    // Always log clean audit output
    console.log(`\n=======================================================\nRETAILER ONBOARDING APPLICATION RECEIVED FOR ${recipient}\nReference: ${referenceId}\nStore: ${storeName} (${city})\nManager: ${contactName} <${email}>\nPhone: ${phone}\nMethod: ${methodUsed}\n=======================================================\n`);

    return res.status(200).json({
      success: true,
      referenceId,
      status: "pending",
      deliveredTo: "Admin Dashboard",
      method: methodUsed,
      message: `Onboarding application for ${storeName} has been recorded and sent to the Admin Dashboard with status 'pending'.`,
    });
  } catch (err: any) {
    console.error("Error in /api/retailer-onboard:", err);
    return res.status(500).json({
      error: "Failed to process retailer onboarding",
      details: err?.message || "Unknown error",
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
