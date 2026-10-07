# 🚀 NxtWave AI Growth Engine

An AI-powered full-stack growth platform designed to help drive registrations for technical workshops through **student referrals, personalized engagement, automated communication, and campaign intelligence**.

The platform combines a student-facing growth hub with an administrator dashboard, enabling students to register, share personalized invitations, and track referrals while administrators monitor campaign performance and identify growth opportunities.

---

## 🌟 Key Features

### 🎓 1. Student Growth Hub

A dedicated student experience designed to simplify registration and encourage peer-to-peer growth.

* **Self-Service Registration**
  Students can register by providing their name, email, college, branch, and area of interest.

* **Unique Referral Codes**
  Each registered student receives a unique referral code such as `NW-ALEX421`.

* **One-Click WhatsApp Sharing**
  Students can instantly share personalized workshop invitations with their peers through WhatsApp.

* **AI-Personalized Invitations**
  Generates customized invitation messages based on the student's branch, interests, and referral information.

* **Workshop Notifications**
  Students can receive registration confirmations, reminders, and workshop-related updates through email.

---

### 📊 2. Admin Intelligence Portal

A centralized dashboard for monitoring and analyzing the workshop growth campaign.

* **Secure Admin Authentication**
  Role-based access control using JWT authentication and bcrypt password hashing.

* **Live Conversion Metrics**
  Tracks:

  * Total registrations
  * Direct registrations
  * Referral registrations
  * Referral conversion percentage
  * Progress toward the registration target

* **Campus Analytics**
  Displays registration distribution across participating colleges and campuses.

* **Referral Leaderboard**
  Identifies the most successful student ambassadors based on referral counts.

* **Channel Performance**
  Compares acquisition sources such as:

  * Student referrals
  * College communities
  * Email
  * Social media

* **AI Growth Analyst**
  Analyzes campaign performance and generates actionable growth experiments and recommendations for the next 48 hours.

---

### 🤖 3. Grounded AI Workshop Buddy

An integrated AI assistant that helps students understand the workshop before registering.

The assistant provides grounded information about:

* **Technical prerequisites**
* **Laptop and browser requirements**
* **GPU requirements**
* **Workshop curriculum**
* **Python and coding requirements**
* **Cloud development environments**
* **What students will build during the workshop**

The assistant uses a contextual knowledge base and fallback responses to avoid inventing unsupported workshop information.

---

### 📈 4. AI-Powered Growth Strategy

The platform is designed around a simple growth loop:

```text
Student Registration
        ↓
Unique Referral Code
        ↓
Personalized Invitation
        ↓
Peer Registration
        ↓
New Student Referral Code
        ↓
Continuous Growth Loop
```

This creates a **peer-to-peer referral engine** rather than relying only on traditional advertising.

---

## 🧠 How the AI Is Used

AI is integrated into multiple parts of the platform:

| AI Component              | Purpose                                |
| ------------------------- | -------------------------------------- |
| AI Invitation Generator   | Creates personalized referral messages |
| Workshop Buddy            | Answers student questions              |
| AI Growth Analyst         | Identifies campaign bottlenecks        |
| Growth Recommendations    | Suggests short-term experiments        |
| Grounded Knowledge Engine | Provides reliable workshop information |

The AI is used as a **decision-support and personalization layer**, while core registration and referral logic remains deterministic.

---

## 🛠️ Technology Stack

### Frontend

* HTML5
* CSS3
* JavaScript
* Responsive dashboard UI

### Backend

* Node.js
* Express.js

### Database

* MongoDB Atlas
* Mongoose ODM

### Authentication & Security

* JSON Web Tokens (JWT)
* bcrypt.js
* Role-Based Access Control (RBAC)

### AI

* Google GenAI SDK (`@google/genai`)
* Grounded fallback knowledge engine

### Communication

* Nodemailer
* SMTP-based email notifications

### Deployment

* Render
* GitHub CI/CD

---

## 📁 Project Structure

```text
nxtwave-ai-growth-engine/
│
├── public/
│   ├── index.html
│   │   └── Landing page, public AI assistant & login
│   │
│   ├── student.html
│   │   └── Student registration, referrals & engagement dashboard
│   │
│   ├── admin.html
│   │   └── Campaign intelligence & analytics dashboard
│   │
│   └── app.js
│       └── Client-side state, API communication & routing
│
├── server.js
│   └── Express server, API routes, authentication & database logic
│
├── package.json
│   └── Project dependencies and scripts
│
├── .env.example
│   └── Environment variable template
│
├── .gitignore
│   └── Files excluded from version control
│
└── README.md
    └── Project documentation
```

---

## 🔄 Platform Workflow

### Student Flow

```text
Landing Page
     ↓
Student Registration
     ↓
Referral Code Generated
     ↓
Student Dashboard
     ↓
AI Invitation Generated
     ↓
Share via WhatsApp
     ↓
Peers Register
     ↓
Referral Network Expands
```

### Admin Flow

```text
Admin Login
     ↓
Campaign Dashboard
     ↓
Registration Metrics
     ↓
College & Channel Analytics
     ↓
Referral Leaderboard
     ↓
AI Growth Analysis
     ↓
48-Hour Growth Experiments
```

---

## 🎯 Campaign Objective

The platform is designed around the following campaign objective:

> **Generate 500 registrations for the NxtWave "Build Your First AI Project in 60 Minutes" workshop within 7 days using a ₹2,000 simulated campaign budget.**

Rather than depending entirely on paid promotion, the solution focuses on **student-led referrals and personalized engagement**, allowing every registered student to become a potential acquisition channel.

---

## 💡 Key Differentiator

The project is more than a conventional workshop landing page.

It combines:

**Registration + Referral Marketing + AI Personalization + Email Engagement + Campaign Analytics + AI Recommendations**

into a single growth platform.

The main idea is to turn each registered student into a **student ambassador**, creating a scalable referral loop that can continuously bring in new registrations.

---

## 🔐 Environment Variables

Create a `.env` file using `.env.example` as a template.

Example:

```env
PORT=3000

MONGODB_URI=your_mongodb_connection_string

GOOGLE_API_KEY=your_google_genai_api_key

EMAIL_USER=your_email
EMAIL_PASS=your_email_app_password

JWT_SECRET=your_jwt_secret
```

> **Important:** Never commit `.env` or API keys to GitHub.

---

## ▶️ Running the Project Locally

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create:

```text
.env
```

and add the required MongoDB, AI, email, and authentication credentials.

### 3. Start the server

```bash
node server.js
```

### 4. Open the application

```text
http://localhost:3000
```

---


## 🚀 Future Enhancements

Potential improvements include:

* Automated campaign scheduling
* Email open and click tracking
* Real-time WebSocket analytics


---

## 🏆 Project Summary

**NxtWave AI Growth Engine** demonstrates how AI can be combined with full-stack development and growth strategies to solve a real-world student acquisition problem.

Instead of building only a registration page, the platform creates a complete **AI-assisted growth system** where students can register, refer peers, receive personalized communication, and contribute to a measurable referral network while administrators receive real-time campaign intelligence.

### Core Concept

> **Register → Personalize → Refer → Analyze → Optimize → Grow**
