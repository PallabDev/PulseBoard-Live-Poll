# PulseBoard

A modern poll website where users can create polls to get useful insights, perfect for all businesses. PulseBoard is a full-stack live polling platform for creating polls, sharing public join links, collecting anonymous or authenticated feedback, and reviewing real-time analytics.

**Live Project:** [https://pulseboard.pallabdev.in/](https://pulseboard.pallabdev.in/)

**Demo Video:** [Watch Demo](https://res.cloudinary.com/dfwgiivke/video/upload/v1778765846/Pulseboard-Export_so0dqk.mp4)

---

## Features

- **Robust Authentication:** Secure email/password authentication with protected dashboard routes.
- **Advanced Poll Builder:** Create polls with rich text descriptions, multiple questions, 2-4 single-choice options per question, and mandatory/optional settings.
- **Flexible Voting:** Supports both anonymous and authenticated response modes.
- **Public Sharing:** Generate public join links with expiry-aware voting capabilities.
- **Real-Time Updates:** Live vote casting and analytics updates powered by Socket.io.
- **Comprehensive Analytics:** Creator-only analytics dashboard and participant summary pages to track engagement.
- **Result Publishing:** Publish results after a poll has ended, allowing public result viewing on the same join link.
- **Security & Reliability:** Features sanitized rich text storage/output, API rate limiting, Helmet headers, env-based CORS, hashed refresh/reset/verification tokens, and atomic option vote increments.

## Tech Stack

**Backend:**
Express, Node.js, MongoDB, Socket.io, Zod, TypeScript

**Frontend:**
React, Axios, Vite, Shadcn UI, Tailwind CSS

## Project Structure

```text
backend/   Express, MongoDB/Mongoose, Socket.io, auth, poll APIs
frontend/  React, Vite, Tailwind, dashboard, builder, public poll, analytics
```

## How to Setup Locally

Follow these guided steps to get PulseBoard running on your local machine.

### Step 1: Clone the Repository
First, you need to download the source code. Open your terminal and run:
```bash
git clone <repository-url>
```

### Step 2: Set up the Backend
The backend powers the API, database connection, and real-time sockets.

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```
2. **Install dependencies:** This will download all the required Node.js packages.
   ```bash
   npm i
   ```
3. **Start the Database:** PulseBoard uses MongoDB. We have provided a Docker configuration to make this easy. This command will pull and start a MongoDB container in the background.
   ```bash
   docker compose up -d
   ```
4. **Run the Server:** Start the development server. It will automatically reload if you make code changes.
   ```bash
   npm run dev
   ```

*Note: If you are preparing for a production environment, you should instead build and start the server using `npm run build` followed by `npm run start`.*

### Step 3: Set up the Frontend
The frontend contains the React application that users interact with. Open a **new, separate terminal window** to keep your backend running.

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```
2. **Install dependencies:** Download all required React packages.
   ```bash
   npm i
   ```
3. **Start the Frontend App:** Launch the Vite development server. It will typically open your app on `http://localhost:5173`.
   ```bash
   npm run dev
   ```

*Note: For production, create an optimized build using `npm run build` and test it locally using `npm run preview`.*
