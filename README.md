# 🍳 MealMitra — Your Everyday Meal Companion

> **"No more daily ‘Aaj kya banau?’ confusion. 👀"**

An intelligent, AI-powered smart meal planning and kitchen companion web application built with the **MERN** stack (MongoDB, Express, React, Node.js) and Tailwind CSS.

---

## ✨ Features

- 🍳 **Smart Meal Decision Wizard**: Filter by meal type, available prep & cook time, family servings, cuisine, and dietary preferences to instantly decide what to cook.
- 🥕 **Cook With What You Have (Pantry Matcher)**: Enter available ingredients in your fridge/kitchen and get strictly matching recipes with zero food waste.
- 📅 **7-Day AI Meal Planner**: Auto-generate personalized weekly meal schedules with 1-click slot swapping.
- 🇮🇳 **Full Bilingual Experience (English & हिंदी)**: Complete step-by-step recipe instructions and cooking steps available in both English and Hindi.
- ⏱️ **Interactive Cooking Mode**: Step-by-step cooking checklist with integrated timer (+5m, +10m) and progress tracking in English & Hindi.
- 🛡️ **Admin Control Center**: Dedicated admin portal to modify dish photos, update dish names, adjust cooking details, add new recipes, and manage the live dish catalog.
- 📊 **Anti-Repetition & Variety Analytics**: Automatic tracking of prepared meals to prevent cooking fatigue and maintain dietary rotation health.
- ❤️ **Favorites & Taste Profile**: Save favorite dishes and configure personalized household preferences (spice level, allergens, excluded ingredients).

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas URI)

---

### 1. Clone the Repository

```bash
git clone https://github.com/poonamm05/meal-mitra.git
cd meal-mitra
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory (or copy from `.env.example`):

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/mealmitra
JWT_SECRET=mealmitra_super_secret_jwt_key_2026
NODE_ENV=development

# Optional: For live conversational AI responses
GEMINI_API_KEY=
```

Start the backend server:

```bash
npm start
```
The backend API will run on `http://localhost:5000`.

---

### 3. Frontend Setup

In a new terminal window:

```bash
cd frontend
npm install
npm run dev
```

The frontend application will start on `http://localhost:5173`.

---

## 🔑 Demo & Admin Credentials

| Role / Persona | Email | Password |
|---|---|---|
| 🛡️ **Admin Portal** | `admin@mealmitra.com` | `Admin@1234` |
| 🧑 **Bachelor Persona** | `bachelor@mealmitra.com` | `password123` |
| 👨‍👩‍👧 **Family Persona** | `family@mealmitra.com` | `password123` |
| 💼 **Working Professional** | `workingpro@mealmitra.com` | `password123` |

*(You can also register a new custom account with personalized household settings or use 1-click Instant Demo login)*

---

## 🏗 Project Architecture

```
meal-mitra/
├── backend/
│   ├── src/
│   │   ├── config/             # MongoDB connection configuration
│   │   ├── controllers/        # Express request handlers (Auth, Recipes, Admin, Recommendations, etc.)
│   │   ├── middleware/         # JWT authentication & admin authorization
│   │   ├── models/             # Mongoose schemas (Recipe, User, MealPlan, MealHistory, AIConversation)
│   │   ├── routes/             # REST API routes
│   │   ├── seed/               # Curated Indian & Continental recipe catalog & initial seeders
│   │   ├── services/           # Smart recommendation engine & AI services
│   │   └── server.js           # Server entry point
│   ├── package.json
│   ├── .env.example
│   └── test_e2e.js             # Automated E2E test suite
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI components (Navbar, RecipeCard, CookingModeModal, etc.)
│   │   ├── context/            # Authentication & session context (AuthContext)
│   │   ├── pages/              # Views (Landing, Dashboard, WhatToCook, Admin, RecipeDetails, etc.)
│   │   ├── utils/              # Axios API client & bilingual Hindi dictionary (hindiRecipes.js)
│   │   ├── App.jsx             # React router configuration
│   │   └── main.jsx            # React root mount
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## 🔌 Core API Endpoints

| Method | Route | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Create a new user account with cooking preferences |
| `POST` | `/api/auth/login` | Public | Authenticate user and receive JWT token |
| `POST` | `/api/auth/demo-login` | Public | 1-Click login into pre-configured personas |
| `GET` | `/api/recipes` | Public | Fetch catalog with filters (cuisine, meal type, time) |
| `GET` | `/api/recipes/:id` | Public | Get single recipe details with nutrition & steps |
| `POST` | `/api/recommendations/smart-decide` | Private | Multi-factor heuristic AI meal recommendation |
| `POST` | `/api/recommendations/use-my-ingredients` | Private | Strict pantry matching (100% vs partial match) |
| `GET` | `/api/meal-plans/weekly` | Private | Retrieve active 7-day meal plan |
| `POST` | `/api/meal-plans/auto-generate` | Private | 1-Click AI 7-day meal plan generation |
| `GET` | `/api/meal-history` | Private | Meal history timeline & rotation variety score |
| `POST` | `/api/meal-history/log` | Private | Mark recipe as cooked today |
| `GET` | `/api/admin/recipes` | Admin | Full recipe list for admin dashboard |
| `POST` | `/api/admin/recipes` | Admin | Add new dish with photo, ingredients & instructions |
| `PUT` | `/api/admin/recipes/:id` | Admin | Edit recipe photo, instructions, details |
| `DELETE` | `/api/admin/recipes/:id` | Admin | Remove recipe from website |

---

## 🧪 Testing

Run the automated end-to-end integration test suite:

```bash
cd backend
node test_e2e.js
```

---

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Axios, React Router v6
- **Backend**: Node.js, Express.js, Mongoose, JWT, bcryptjs, CORS
- **Database**: MongoDB
- **Styling**: Modern warm amber/orange culinary aesthetic with glassmorphism & responsive cards

---

## 📄 License

This project is licensed under the MIT License.
