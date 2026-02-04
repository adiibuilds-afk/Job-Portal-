# 🚀 Engineering Job Portal

A premium, AI-powered job portal specifically designed for engineering and tech roles. Built with a modern full-stack architecture using Next.js 15, Node.js, MongoDB, and LLM-based automation.

![Project Preview](https://your-preview-image-url.com) *(Optional)*

---

## ✨ Key Features

### 🔍 Advanced Job Discovery
- **Engineering-Specific Filters**: Filter by graduating Batch (2024, 2025...), Job Type (Internship, Full-time), and Role Type (SDE, QA, DevOps...).
- **Smart Search**: High-performance search optimized for tech roles and company names.
- **AI-Powered Tagging**: Job descriptions are automatically parsed by AI (Groq/LLama 3) to extract tech stack, seniority, and metadata.

### 📊 Insights & Analytics
- **Job Market Dashboard**: Real-time visualization of job trends, trending skills, and top hiring companies.
- **Save & Recommend**: Logged-in users can save jobs. The system uses AI to recommend similar roles based on your interests.

### 🛡️ Admin & Community
- **Discussion Forum**: Community-driven Q&A for interview experiences, salary discussions, and company reviews.
- **Admin Panel**: Dedicated dashboard for managing job listings, verifying reports, and monitoring site metrics.
- **Spam Protection**: Users can report suspicious or expired listings for admin review.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + Framer Motion (Premium Dark Theme)
- **Icons**: Lucide React
- **State Management**: React Hooks + LocalStorage (for saved jobs)

### Backend
- **Runtime**: Node.js + Express
- **Database**: MongoDB (Mongoose)
- **Automation**: LLM Integration (Groq SDK) for NLP parsing
- **Bot**: Telegram Bot for automated job scraping/posting alerts

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Groq API Key (for job parsing)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/Job-Portal-.git

# Setup Backend
cd backend
npm install
# Create .env (see .env.example)
npm run dev

# Setup Frontend
cd ../frontend
npm install
# Create .env.local
npm run dev
```

---

## 📂 Project Structure
```text
├── backend/          # Express API, MongoDB Models, AI Services, Bot
├── frontend/         # Next.js 15 App, Components, Services
└── .gitignore        # Root-level ignore for safe git management
```

---

## 🤝 Contribution
Contributions are welcome! Pull requests are the best way to propose changes.

---

## 📜 License
MIT License - Feel free to use this for your own projects!
