# Traveloop 🌍

Traveloop is a personalized multi-city travel planning platform ("Voyage Intelligence") that helps users effortlessly curate, schedule, and share their itineraries. 

This repository contains the full-stack application, divided into a **React frontend** and a **Node.js/PostgreSQL backend**.

---

## 🏗 Project Architecture

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Zustand, React Hook Form, Lucide React
- **Backend:** Node.js, Express, TypeScript, Prisma ORM
- **Database:** PostgreSQL 15+

---

## 💻 Frontend Setup

A modern, responsive web application utilizing the "Voyage Intelligence" UI design system.

### Key Features
- **Interactive Dashboard:** Overview of upcoming trips, travel stats, and budget utilization.
- **Dynamic Itinerary Builder:** Multi-city trip planning with activities, scheduling, and cost estimation.
- **Smart Packing Checklist:** Responsive, categorized packing checklist with priority indicators.

### Installation & Running

1. **Navigate and install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api/v1
   ```

3. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Access the frontend at `http://localhost:5173`.

---

## ⚙️ Backend Setup

A robust REST API serving data securely to the platform.

### Prerequisites
- Node.js (v20+ recommended)
- PostgreSQL (v15+ recommended)

### Database Setup
Create a local database named `traveloop` in your PostgreSQL instance (default port 5432).

*Alternatively, use Docker to spin up a quick database:*
```bash
docker run --name traveloop-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=traveloop -p 5432:5432 -d postgres:15
```

### Installation & Running

1. **Navigate and install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file in the `backend` directory:
   ```env
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/traveloop
   JWT_SECRET=your-very-long-secret-key-here-32chars-minimum
   PORT=3000
   ```

3. **Initialize the Database:**
   ```bash
   # Create tables
   npx prisma migrate dev --name init

   # Seed default cities and activities
   npm run seed
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   The API will run at `http://localhost:3000`.

---

## 📡 Core API Endpoints

All endpoints are prefixed with `/api/v1/`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create account & return JWT |
| POST | `/auth/login` | Login & return JWT |
| GET | `/trips` | List user's trips |
| POST | `/trips` | Create a new trip |
| GET | `/trips/:id` | Get full trip details, stops, & budget |
| GET | `/trips/:id/stops` | List stops within a trip |
| POST | `/public/:token/copy`| Copy a public shared trip to your account |
| GET | `/cities` | Search supported cities |

---

## 🚀 Running the Full Stack

To run the application locally, you will need to start both servers simultaneously. Open two separate terminal windows:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```
