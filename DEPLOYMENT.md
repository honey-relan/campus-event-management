# Campus Event Management — Deployment & DevOps Guide
## Experiments 9 & 10: CI/CD Pipeline & Docker Containerization

---

## 1. Project Architecture Overview

```
                          ┌───────────────────────────┐
                          │   GitHub Repository       │
                          │   (honey-relan/           │
                          │   campus-event-management)│
                          └─────────────┬─────────────┘
                                        │ git push
                                        ▼
                          ┌───────────────────────────┐
                          │   GitHub Actions CI/CD    │
                          │   - Frontend Build Check  │
                          │   - Backend Syntax Check  │
                          │   - Docker Image Validation│
                          └──────┬─────────────┬──────┘
                                 │             │
                    Auto-Deploy  │             │ Auto-Deploy
                                 ▼             ▼
                ┌──────────────────┐         ┌───────────────────────┐
                │  Vercel Frontend │         │  Render Backend API   │
                │  (React + Vite)  │◄───────►│  (Node.js + Socket.IO) │
                └──────────────────┘  REST & └───────────┬───────────┘
                                     WebSockets          │
                                                         ▼
                                             ┌───────────────────────┐
                                             │  MongoDB Atlas Cloud  │
                                             │  (cluster0.cqsqmas)   │
                                             └───────────────────────┘
```

---

## 2. Experiment 9: CI/CD Deployment with GitHub Actions, Render & Vercel

### 2.1 GitHub Actions Workflow (`.github/workflows/ci.yml`)

The continuous integration pipeline runs automatically on every **push** or **pull request** to the `main` branch.

| Stage | Job Name | What It Tests |
| :--- | :--- | :--- |
| **1** | `frontend-build` | Sets up Node.js 20, installs dependencies via `npm ci`, and runs `npm run build` (Vite) to catch JSX, CSS, or import syntax errors before deployment. |
| **2** | `backend-check` | Sets up Node.js 20, runs `npm ci` in `backend/`, and verifies syntax integrity using `node --check server.js`. |
| **3** | `docker-build-check` | Sets up Docker Buildx and tests building both the frontend and backend Docker containers to prevent broken container builds. |

---

### 2.2 Production Hosting Configuration

#### Backend on Render (Web Service)
- **Active Backend URL:** `https://campus-event-management-yq89.onrender.com`
- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Configuration File:** `render.yaml` (Infrastructure-as-Code blueprint)
- **Environment Variables on Render:**
  ```env
  PORT=5000
  MONGO_URI=mongodb+srv://<username>:<password>@cluster0.cqsqmas.mongodb.net/campus_events?retryWrites=true&w=majority
  JWT_SECRET=your_production_jwt_secret
  CLIENT_URL=https://your-vercel-domain.vercel.app
  ```

#### Frontend on Vercel
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Framework Preset:** Vite
- **Configuration File:** `vercel.json` (Handles single-page application client-side rewrites so page reloads do not return 404 errors)
- **Environment Variables on Vercel:**
  ```env
  VITE_API_URL=https://campus-event-management-yq89.onrender.com/api
  VITE_SOCKET_URL=https://campus-event-management-yq89.onrender.com
  ```

---

### 2.3 Step-by-Step Vercel Deployment Instructions

1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **"Add New..."** -> **"Project"**.
3. Under *Import Git Repository*, select `honey-relan/campus-event-management`.
4. In the configuration settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `./` (leave default root)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Expand **Environment Variables** and add:
   - Name: `VITE_API_URL` | Value: `https://campus-event-management-yq89.onrender.com/api`
   - Name: `VITE_SOCKET_URL` | Value: `https://campus-event-management-yq89.onrender.com`
6. Click **Deploy**. Vercel will build the frontend and provide your live URL (e.g., `https://campus-event-management-honey.vercel.app`).
7. Update Render Environment Variables: Set `CLIENT_URL` in your Render service settings to your new Vercel URL to authorize CORS.

---

### 2.4 Verification & Live Testing Commands

1. **Verify Backend Health Endpoint:**
   ```bash
   curl -s https://campus-event-management-yq89.onrender.com/
   ```
   *Expected Response:*
   ```json
   {
     "message": "Secure Campus Event REST API is running",
     "websocket": "Socket.IO is enabled"
   }
   ```

2. **Verify Events REST API:**
   ```bash
   curl -s https://campus-event-management-yq89.onrender.com/api/events
   ```
   *Expected Response:* JSON array of campus events from MongoDB Atlas.

3. **Verify WebSocket Real-Time Handshake:**
   ```bash
   curl -i "https://campus-event-management-yq89.onrender.com/socket.io/?EIO=4&transport=polling"
   ```
   *Expected Response:* HTTP 200 OK with `sid` handshake and `upgrades: ["websocket"]`.

---

## 3. Experiment 10: DevOps & Docker Containerization

### 3.1 Docker Architecture

#### Multi-Stage Frontend Dockerfile (`Dockerfile`)
- **Stage 1 (Builder):** Uses `node:20-alpine` to install dependencies and execute `npm run build`. This generates the optimized static bundles (`dist/index.html`, JS, CSS).
- **Stage 2 (Production Web Server):** Uses `nginx:alpine` (~25MB image) to serve the static assets and handle routing via `nginx.conf` with gzip compression and caching headers.
- **Advantage:** No Node.js runtime or `node_modules` in the final frontend container, reducing image size by ~85% and eliminating attack surfaces.

#### Backend Dockerfile (`backend/Dockerfile`)
- Uses official `node:20-alpine` image.
- Runs `npm ci --omit=dev` to only install runtime production dependencies.
- Exposes port `5000` for REST API and Socket.IO engine.

---

### 3.2 Docker Compose Multi-Container Setup (`docker-compose.yml`)

The `docker-compose.yml` orchestrates both services on a unified isolated bridge network (`campus_network`):

```yaml
version: "3.8"
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: campus_event_backend
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
      - MONGO_URI=${MONGO_URI}
      - JWT_SECRET=${JWT_SECRET}
      - CLIENT_URL=${CLIENT_URL:-http://localhost:5173}
    env_file:
      - ./backend/.env
    networks:
      - campus_network

  frontend:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - VITE_API_URL=http://localhost:5000/api
        - VITE_SOCKET_URL=http://localhost:5000
    container_name: campus_event_frontend
    restart: unless-stopped
    ports:
      - "5173:80"
      - "80:80"
    depends_on:
      - backend
    networks:
      - campus_network

networks:
  campus_network:
    driver: bridge
```

---

### 3.3 Docker Commands Reference (For Practical Demo)

| Action | Command | Purpose |
| :--- | :--- | :--- |
| **Build images** | `docker compose build` | Builds both frontend (Nginx) and backend container images. |
| **Start containers** | `docker compose up -d` | Starts frontend & backend in background (detached mode). |
| **Check status** | `docker compose ps` | Displays running containers, ports, and health status. |
| **View logs** | `docker compose logs -f` | Streams real-time logs from both frontend and backend. |
| **Stop containers** | `docker compose down` | Safely stops and removes containers and internal networks. |
| **Rebuild & Run** | `docker compose up --build -d` | Rebuilds images if code changed and starts containers. |

---

### 3.4 How to Install Docker Desktop on Windows (If Needed)

If Docker is not yet installed on your Windows machine:
1. **Download Docker Desktop for Windows:** [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
2. Run the installer `Docker Desktop Installer.exe`.
3. Ensure the option **"Use WSL 2 instead of Hyper-V"** is checked.
4. Restart your PC when prompted.
5. Open PowerShell and verify:
   ```powershell
   docker --version
   docker compose version
   ```
6. Navigate to your project folder and start the multi-container stack:
   ```powershell
   cd C:\Users\Admin\OneDrive\Desktop\campus_event_management
   docker compose up --build -d
   ```
7. Open `http://localhost:5173` in your browser. Both containers are now serving the app!

---

## 4. Environment Variables Reference

| Variable | Scope | Description | Default (Local) | Production Example |
| :--- | :--- | :--- | :--- | :--- |
| `PORT` | Backend | Port Express listens on | `5000` | `5000` |
| `MONGO_URI` | Backend | MongoDB Atlas Connection String | Atlas URI string | Cloud Atlas connection string |
| `JWT_SECRET` | Backend | Secret key for signing auth tokens | (in `.env`) | 256-bit secure secret key |
| `CLIENT_URL` | Backend | Allowed CORS origin for frontend | `http://localhost:5173` | `https://your-app.vercel.app` |
| `VITE_API_URL` | Frontend | Base URL for REST API requests | `http://localhost:5000/api` | `https://campus-event-management-yq89.onrender.com/api` |
| `VITE_SOCKET_URL` | Frontend | Socket.IO server connection endpoint | `http://localhost:5000` | `https://campus-event-management-yq89.onrender.com` |

---

## 5. College Practical Screenshot Checklist

Take these exact screenshots for your lab report file:

- [ ] **Screenshot 1: GitHub Actions CI/CD Pipeline**
  - Go to your GitHub repository -> **Actions** tab.
  - Take a screenshot of the green checkmark next to the latest workflow run showing `frontend-build`, `backend-check`, and `docker-build-check` all passing (`✔`).
- [ ] **Screenshot 2: Render Backend Web Service**
  - Render Dashboard -> `campus-event-management-backend` service.
  - Show status: **Live** with the active URL `https://campus-event-management-yq89.onrender.com` and log output: `MongoDB connected successfully`.
- [ ] **Screenshot 3: Vercel Frontend Deployment**
  - Vercel Dashboard -> Project Overview showing **Deployment Status: Ready**, production domain, and assigned environment variables.
- [ ] **Screenshot 4: Live Website with WebSocket "Live Sync"**
  - Browser window at `http://localhost:5173` (or Vercel URL) showing the homepage, event cards, stats, and the green `[ 🟢 Live Sync ]` badge.
- [ ] **Screenshot 5: Docker Configuration Files**
  - VS Code displaying `Dockerfile`, `backend/Dockerfile`, and `docker-compose.yml` side-by-side.
- [ ] **Screenshot 6: REST API & Socket Handshake in Terminal/Postman**
  - Terminal showing `curl https://campus-event-management-yq89.onrender.com/` and `curl https://campus-event-management-yq89.onrender.com/api/events`.

---

## 6. Viva Voce Questions & Answers (College Exam Ready)

### Q1: What is CI/CD and what problem does it solve in our project?
**Answer:** CI (Continuous Integration) automatically tests and builds our codebase whenever code is pushed to GitHub, ensuring that syntax errors or broken dependencies are caught immediately. CD (Continuous Deployment) automatically delivers tested code to cloud environments (Vercel and Render) without manual file transfers.

### Q2: What jobs are executed in our GitHub Actions workflow?
**Answer:** Our workflow (`.github/workflows/ci.yml`) executes three automated jobs:
1. `frontend-build`: Runs `npm ci` and `npm run build` to verify the Vite React bundle compiles without errors.
2. `backend-check`: Runs `npm ci` and `node --check server.js` to ensure the Express backend syntax is valid.
3. `docker-build-check`: Tests building both Docker images to verify container configurations.

### Q3: Why do we use a multi-stage Docker build for the frontend?
**Answer:**
1. **Size reduction:** The build stage uses Node.js (~300MB) to compile Vite assets. The final stage copies only the compiled static HTML/CSS/JS into an Alpine Nginx image (~25MB).
2. **Security:** The production image contains no build tools, npm package caches, or development utilities, significantly reducing vulnerabilities.

### Q4: Why do we run Nginx in the frontend container instead of `npm run dev`?
**Answer:** `npm run dev` is Vite's development development server intended for hot module replacement (HMR), not production traffic. Nginx is a production-grade, high-performance web server optimized to serve static assets with caching headers, gzip compression, and high concurrency.

### Q5: How does client-side routing (SPA) work without 404 errors in Nginx and Vercel?
**Answer:** In single-page React apps, routes like `/events` or `/dashboard` are handled in the browser by JavaScript.
- In Nginx: `try_files $uri $uri/ /index.html;` intercepts 404 requests and serves `index.html` so React can render the route.
- In Vercel: `vercel.json` rewrite rule `"source": "/(.*)", "destination": "/index.html"` performs the identical fallback.

### Q6: How do frontend and backend communicate inside Docker Compose?
**Answer:** Docker Compose creates an internal user-defined bridge network (`campus_network`). Containers can resolve each other using their service names (DNS), and external host ports (5173 for frontend and 5000 for backend) allow host browser access.

### Q7: How does CORS work when frontend is on Vercel and backend is on Render?
**Answer:** In `backend/server.js`, CORS is configured dynamically using `process.env.CLIENT_URL` along with localhost fallbacks. When Vercel sends pre-flight HTTP `OPTIONS` requests or REST calls, Express verifies the `Origin` header against the allowed list and sets `Access-Control-Allow-Origin`.

### Q8: How are secrets like `MONGO_URI` and `JWT_SECRET` kept secure in Git?
**Answer:** All sensitive variables are kept in `.env` files which are strictly excluded via `.gitignore`. In production, secrets are injected directly via Render Dashboard and GitHub Secrets environment settings, so no credentials ever appear in public Git commits.

### Q9: What happens if MongoDB Atlas connection is delayed when Render starts?
**Answer:** In `backend/server.js`, the HTTP and Socket.IO server starts listening immediately (`server.listen(PORT)`), while `mongoose.connect()` runs asynchronously. This guarantees that Render's health check passes immediately even if cloud database connection negotiation takes a few seconds.

### Q10: How do WebSockets function between Vercel and Render?
**Answer:** Socket.IO begins with an HTTP long-polling handshake and immediately upgrades to a full-duplex WebSocket connection. Render supports persistent WebSocket connections over standard HTTPS (WSS) on port 443, enabling instant real-time event updates and notifications without browser polling.
