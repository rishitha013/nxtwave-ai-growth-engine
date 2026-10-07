require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { GoogleGenAI } = require("@google/genai");

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "nxtwave_growth_engine_fallback_secret_key_2026";

// SINGLE ADMIN CREDENTIALS (Can be overridden in .env)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@nxtwave.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

// ===============================
// MIDDLEWARE & STATIC FILES
// ===============================
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ===============================
// USER SCHEMA
// ===============================
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    college: { type: String, default: "N/A" },
    branch: { type: String, default: "N/A" },
    interest: { type: String, default: "N/A" },
    referralCode: { type: String, unique: true, uppercase: true },
    referredBy: { type: String, default: "", uppercase: true },
    referralCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

// ===============================
// MONGODB CONNECTION & AUTO-CREATE ADMIN
// ===============================
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/nxtwave_growth")
  .then(async () => {
    console.log("MongoDB connected successfully");

    // Ensure the single master Admin exists
    const adminExists = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);
      await User.create({
        name: "Campaign Administrator",
        email: ADMIN_EMAIL.toLowerCase(),
        password: hashedPassword,
        role: "admin",
        referralCode: "NW-ADMIN",
        college: "NxtWave HQ",
        branch: "Operations",
        interest: "Growth & Analytics"
      });
      console.log(`[Admin Setup] Created single Admin account: ${ADMIN_EMAIL}`);
    } else {
      console.log(`[Admin Setup] Admin account active: ${ADMIN_EMAIL}`);
    }
  })
  .catch((error) => console.error("MongoDB connection warning:", error.message));

// ===============================
// AUTH MIDDLEWARE
// ===============================
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access denied. Token missing." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired session token." });
  }
}

function requireRole(requiredRole) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== requiredRole) {
      return res.status(403).json({ message: `Forbidden: Requires ${requiredRole} access.` });
    }
    next();
  };
}

// ===============================
// WORKSHOP GROUNDED DATA & AI
// ===============================
const WORKSHOP_KNOWLEDGE = `
You are the official NxtWave AI Workshop Buddy for the upcoming workshop:
Title: "Build Your First AI Project in 60 Minutes"
Target Audience: Engineering students (CSE, AI & ML, ECE, EEE, IT, etc.)
Organizer: NxtWave

FACTS ABOUT THE WORKSHOP:
1. PREREQUISITES:
   - Absolutely NO advanced Machine Learning or Deep Learning experience is required.
   - Basic familiarity with variables, loops, or simple Python logic is sufficient. Everything is guided step-by-step.
2. PROJECTS BUILT:
   - In 60 minutes, students build and deploy a working AI application (e.g., AI Document Assistant, Voice AI Agent, or Sentiment Classifier).
   - Code can be added directly to technical resumes and GitHub.
3. SETUP:
   - Any standard laptop with a modern web browser and active internet connection is enough. No GPUs or high-end machines are required.
4. REFERRALS:
   - Students get a unique referral code to share with peers. Referrals move students up the campus leaderboard.
5. FORMAT:
   - Exactly 60 minutes. Free live interactive session.
`;

let aiClient = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    console.log("Gemini API Client Initialized.");
  } catch (e) {
    console.error("Failed to init GoogleGenAI:", e.message);
  }
}

const CANDIDATE_MODELS = [
  "gemini-flash-latest",
  "gemini-3.5-flash-lite",
  "gemini-3.8-flash"
];

async function queryGemini(promptText, systemInstruction) {
  if (!aiClient) return null;
  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await aiClient.models.generateContent({
        model: model,
        contents: promptText,
        config: {
          systemInstruction: systemInstruction || WORKSHOP_KNOWLEDGE
        }
      });
      if (response && response.text) return response.text.trim();
    } catch (err) {
      if (err.status === 503) {
        await new Promise((r) => setTimeout(r, 600));
      }
    }
  }
  return null;
}

function getGroundedWorkshopAnswer(question) {
  const q = (question || "").toLowerCase();
  if (q.includes("prereq") || q.includes("pre-req") || q.includes("requirement") || q.includes("eligib") || q.includes("need to know")) {
    return "No advanced prerequisites needed! Basic familiarity with programming is helpful, but the session is designed for beginners. All you need is a laptop and internet connection.";
  }
  if (q.includes("laptop") || q.includes("system") || q.includes("gpu") || q.includes("hardware") || q.includes("install")) {
    return "Any standard laptop with a modern web browser (Chrome/Edge) is all you need. You do not need a GPU or special software.";
  }
  if (q.includes("project") || q.includes("build") || q.includes("make") || q.includes("topic")) {
    return "In 60 minutes, you will build and deploy a working AI application—such as an AI Document Assistant, Voice AI Agent, or Text Classifier for your resume!";
  }
  if (q.includes("python") || q.includes("code") || q.includes("language")) {
    return "We use simple Python with popular AI APIs. If you know basic variables and loops, you'll easily follow along step-by-step.";
  }
  if (q.includes("referral") || q.includes("code") || q.includes("friend") || q.includes("invite") || q.includes("leaderboard")) {
    return "When you register, you get a unique referral code. Share it with your classmates; every sign-up moves you up your campus leaderboard!";
  }
  return "The 'Build Your First AI Project in 60 Minutes' workshop is a hands-on session where you'll code and run a real AI application. Have your laptop ready!";
}

function generateReferralCode(name) {
  const clean = (name || "STUDENT").replace(/[^a-zA-Z]/g, "").substring(0, 6).toUpperCase() || "NW";
  return `NW-${clean}${Math.floor(100 + Math.random() * 900)}`;
}

// ===============================
// PAGE ROUTES
// ===============================
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.get("/student", (req, res) => res.sendFile(path.join(__dirname, "public", "student.html")));
app.get("/admin", (req, res) => res.sendFile(path.join(__dirname, "public", "admin.html")));

// ===============================
// AUTH API
// ===============================

// 1. STUDENT REGISTRATION ONLY (Regular users cannot register as Admin)
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, college, branch, interest, referralCode } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Block registering with the dedicated admin email
    if (normalizedEmail === ADMIN_EMAIL.toLowerCase()) {
      return res.status(403).json({ message: "This email address is reserved. Please use Login." });
    }

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: "This email is already registered." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let referrer = null;
    if (referralCode && referralCode.trim()) {
      referrer = await User.findOne({ referralCode: referralCode.trim().toUpperCase() });
    }

    let assignedCode = generateReferralCode(name);
    while (await User.findOne({ referralCode: assignedCode })) {
      assignedCode = generateReferralCode(name);
    }

    // Role is strictly locked to student
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "student",
      college: college ? college.trim() : "N/A",
      branch: branch ? branch.trim() : "N/A",
      interest: interest ? interest.trim() : "N/A",
      referralCode: assignedCode,
      referredBy: referrer ? referrer.referralCode : "",
      referralCount: 0
    });

    if (referrer) {
      referrer.referralCount += 1;
      await referrer.save();
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        referralCode: user.referralCode,
        college: user.college,
        branch: user.branch,
        interest: user.interest
      }
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Registration error: " + err.message });
  }
});

// 2. UNIFIED LOGIN (Automatically routes to /admin or /student based on role)
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, // "admin" or "student"
        referralCode: user.referralCode,
        college: user.college,
        branch: user.branch,
        interest: user.interest
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login error: " + err.message });
  }
});

// ===============================
// CHAT API
// ===============================
app.post("/api/chat", async (req, res) => {
  const { question } = req.body;
  if (!question || !question.trim()) {
    return res.status(400).json({ message: "Question required." });
  }

  const aiAnswer = await queryGemini(
    `Student Question: "${question.trim()}". Answer accurately based on the workshop knowledge. Keep it concise, friendly, and under 60 words.`
  );

  res.json({ answer: aiAnswer || getGroundedWorkshopAnswer(question) });
});

// ===============================
// STUDENT ENDPOINTS
// ===============================
app.post("/api/generate-message", verifyToken, requireRole("student"), async (req, res) => {
  const { name, branch, interest, referralCode } = req.body;
  const prompt = `Write a short WhatsApp invite from an engineering student named ${name} (${branch}). Interest: ${interest}. Referral Code: ${referralCode}. Under 45 words. Excited tone.`;
  const aiText = await queryGemini(prompt, "You write viral workshop invitations for college WhatsApp groups.");
  const fallback = `Hey! 👋 I'm joining NxtWave's free workshop "Build Your First AI Project in 60 Minutes". Let's build together! Register using my code: ${referralCode || "NW-AI"} 🚀`;
  res.json({ message: aiText || fallback });
});

// ===============================
// ADMIN ENDPOINTS
// ===============================
app.get("/api/dashboard", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const total = await User.countDocuments({ role: "student" });
    const referral = await User.countDocuments({ role: "student", referredBy: { $ne: "" } });
    const direct = total - referral;

    const leaderboard = await User.find({ role: "student", referralCount: { $gt: 0 } })
      .sort({ referralCount: -1 })
      .limit(5)
      .select("name college referralCount");

    const collegeData = await User.aggregate([
      { $match: { role: "student" } },
      { $group: { _id: "$college", count: { $sum: 1 } } },
      { $sort: { count: -1 } },       {$limit: 5 }
    ]);

    res.json({
      total,
      referral,
      direct,
      target: 500,
      colleges: collegeData.map((c) => ({ name: c._id || "Other", count: c.count })),
      leaderboard: leaderboard.map((l) => ({ name: l.name, college: l.college, referrals: l.referralCount }))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/ai-insight", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const total = await User.countDocuments({ role: "student" });
    const referral = await User.countDocuments({ role: "student", referredBy: { $ne: "" } });

    const prompt = `Analyze campaign status: Total: ${total}, Referrals: ${referral}, Goal: 500. Provide 1 Key Insight, 2 Growth Actions, and 1 Referral Experiment.`;
    const aiText = await queryGemini(prompt, "You are a growth marketing analyst for engineering campuses.");

    const fallback = `📈 Growth Status: ${total}/500 registrations reached.
• ${total > 0 ? Math.round((referral / total) * 100) : 0}% of registrations are through referrals.
• Next Steps: Incentivize top 3 student ambassadors and share interactive demos in campus Discord/WhatsApp communities.`;

    res.json({ insight: aiText || fallback });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===============================
// START SERVER
// ===============================
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Single Admin Account Ready: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
});