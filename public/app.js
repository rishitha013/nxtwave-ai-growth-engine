const TOKEN_KEY = "nxtwave_token";
const USER_KEY = "nxtwave_user";

function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
}

function setSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.location.href = "/";
}

function enforceRole(expectedRole) {
  const token = getAuthToken();
  const user = getCurrentUser();

  if (!token || !user) {
    window.location.href = "/";
    return;
  }

  // Auto route to their corresponding dashboard if role doesn't match
  if (user.role !== expectedRole) {
    window.location.href = user.role === "admin" ? "/admin" : "/student";
  }
}

function switchAuthTab(tab) {
  const isReg = tab === "register";
  const regForm = document.getElementById("regForm");
  const loginForm = document.getElementById("loginForm");
  const showRegBtn = document.getElementById("showRegBtn");
  const showLoginBtn = document.getElementById("showLoginBtn");
  const msgBox = document.getElementById("authMessage");

  if (msgBox) msgBox.style.display = "none";
  if (!regForm || !loginForm) return;

  regForm.style.display = isReg ? "block" : "none";
  loginForm.style.display = isReg ? "none" : "block";
  showRegBtn.className = isReg ? "tab-btn active" : "tab-btn";
  showLoginBtn.className = isReg ? "tab-btn" : "tab-btn active";
}

document.addEventListener("DOMContentLoaded", () => {
  // Student Registration Form
  const regForm = document.getElementById("regForm");
  if (regForm) {
    regForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      await executeAuth("/api/auth/register", {
        name: document.getElementById("regName").value.trim(),
        email: document.getElementById("regEmail").value.trim(),
        password: document.getElementById("regPassword").value,
        college: document.getElementById("regCollege")?.value.trim() || "N/A",
        branch: document.getElementById("regBranch")?.value.trim() || "N/A",
        interest: document.getElementById("regInterest")?.value.trim() || "N/A",
        referralCode: document.getElementById("regReferralCode")?.value.trim() || ""
      });
    });
  }

  // Universal Login Form (Student OR Admin)
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      await executeAuth("/api/auth/login", {
        email: document.getElementById("loginEmail").value.trim(),
        password: document.getElementById("loginPassword").value
      });
    });
  }

  // Chat input
  const chatInput = document.getElementById("chatInput");
  if (chatInput) {
    chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        sendChat();
      }
    });
  }
});

async function executeAuth(url, payload) {
  const msgBox = document.getElementById("authMessage");
  if (msgBox) {
    msgBox.style.display = "block";
    msgBox.style.color = "#aeb8d0";
    msgBox.innerText = "Processing...";
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Authentication failed");
    }

    setSession(data.token, data.user);

    if (msgBox) {
      msgBox.style.color = "#65e0ae";
      msgBox.innerText = "Success! Redirecting to your dashboard...";
    }

    // AUTOMATIC ROLE-BASED REDIRECTION
    setTimeout(() => {
      if (data.user.role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/student";
      }
    }, 300);
  } catch (err) {
    if (msgBox) {
      msgBox.style.color = "#ff899d";
      msgBox.innerText = err.message;
    }
  }
}

// Chatbot function
async function sendChat() {
  const input = document.getElementById("chatInput");
  const text = (input?.value || "").trim();
  if (!text) return;

  const box = document.getElementById("chatBox");
  box.innerHTML += `<div class="message user-message">${text}</div>`;
  input.value = "";

  box.innerHTML += `<div class="message bot-message">Thinking...</div>`;
  box.scrollTop = box.scrollHeight;

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: text })
    });
    const data = await res.json();
    box.lastElementChild.innerText = data.answer;
  } catch {
    box.lastElementChild.innerText = "Unable to connect to assistant.";
  }
  box.scrollTop = box.scrollHeight;
}

// Student Dashboard Functions
async function copyStudentReferral() {
  const user = getCurrentUser();
  if (!user) return;
  await navigator.clipboard.writeText(user.referralCode);
  alert("Referral code copied!");
}

function shareWhatsApp() {
  const user = getCurrentUser();
  if (!user) return;
  const msg = `Hey! 👋 I'm joining NxtWave's free workshop "Build Your First AI Project in 60 Minutes". Join with my code: ${user.referralCode}! 🚀`;
  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
}

async function generateStudentAIMessage() {
  const user = getCurrentUser();
  const box = document.getElementById("aiMessage");
  if (!user || !box) return;

  box.innerText = "Generating with AI...";
  try {
    const res = await fetch("/api/generate-message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(user)
    });
    const data = await res.json();
    box.innerText = data.message;
  } catch {
    box.innerText = "Error generating invitation.";
  }
}

async function copyAIMsg() {
  const text = document.getElementById("aiMessage")?.innerText;
  if (text) {
    await navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  }
}

// Admin Dashboard Functions
async function loadAdminMetrics() {
  try {
    const res = await fetch("/api/dashboard", {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    });
    const data = await res.json();
    if (!res.ok) return;

    document.getElementById("admTotal").innerText = data.total;
    document.getElementById("admReferral").innerText = data.referral;
    document.getElementById("admDirect").innerText = data.direct;

    const colTable = document.getElementById("collegeTable");
    colTable.innerHTML = (data.colleges || [])
      .map((c) => `<tr><td>${c.name}</td><td>${c.count}</td></tr>`)
      .join("");

    const leadTable = document.getElementById("leaderboardTable");
    leadTable.innerHTML = (data.leaderboard || [])
      .map((l) => `<tr><td>${l.name}</td><td>${l.college}</td><td>${l.referrals}</td></tr>`)
      .join("");
  } catch (err) {
    console.error("Dashboard error:", err);
  }
}

async function runAdminAIAnalysis() {
  const box = document.getElementById("aiInsightBox");
  if (!box) return;

  box.innerText = "Analyzing campaign trends with AI...";
  try {
    const res = await fetch("/api/ai-insight", {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    });
    const data = await res.json();
    box.innerText = data.insight;
  } catch {
    box.innerText = "Could not load recommendations.";
  }
}