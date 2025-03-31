# Shortify – URL Shortening Service

Shortify is a simple and efficient URL-shortening web application. It allows users to shorten lengthy URLs, track clicks, set expiration dates, and optionally customize the short URL suffix. This repository contains the **frontend** (Next.js + Tailwind CSS) and **backend** (Node.js + Express) code, along with instructions for local setup, deployment, and usage.

> **Try it on AWS** at:  
> **[http://18.231.208.120/](http://18.231.208.120/)**
---

## Table of Contents
1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Architecture Overview](#architecture-overview)
4. [Requirements and Prerequisites](#requirements-and-prerequisites)
5. [Installation and Local Setup](#installation-and-local-setup)
6. [Environment Variables](#environment-variables)
7. [API Endpoints](#api-endpoints)
8. [Database Model](#database-model)
9. [Deployment Details](#deployment-details)
10. [GitHub Actions (CI/CD)](#github-actions-cicd)
11. [Contact / Questions](#contact--questions)

---

## 1. Features
- **Shorten URLs:**  
  Users can enter any lengthy URL and obtain a shorter version.
- **Expiration:**  
  Each shortened URL can expire after a user-defined number of days. Past the expiration date, the short link is invalid.
- **Custom Suffix (optional):**  
  Users can personalize their short URL suffix (e.g., `my-custom-link`) instead of a random string.
- **Click Tracking:**  
  Every time a short link is accessed, the system records a click. A separate statistics page displays total clicks.
- **Analytics:**  
  - Basic analytics: total clicks, creation date, expiration date.
  - (Optional) Additional data like user agent or IP address stored for extended click analysis.
- **Simple Frontend UI:**  
  A minimal Next.js + Tailwind interface with forms to create new short URLs and pages to view stats.

---

## 2. Tech Stack
- **Frontend:**  
  - [Next.js](https://nextjs.org/) (React-based framework)
  - [Tailwind CSS](https://tailwindcss.com/) for styling

- **Backend:**  
  - [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
  - [PostgreSQL](https://www.postgresql.org/) (hosted on AWS RDS)
  - [PM2](https://pm2.keymetrics.io/) for process management (production)

- **Cloud / Deployment:**  
  - [AWS EC2](https://aws.amazon.com/ec2/) instance hosting both backend and frontend
  - [Nginx](https://www.nginx.com/) as a reverse proxy
  - [GitHub Actions](https://github.com/features/actions) for CI/CD pipeline

---

## 3. Architecture Overview
```
┌─────────┐          ┌───────────────────────┐
│ Browser │──HTTP───>│ Nginx (Proxy to EC2)  │
└─────────┘          └───────────────────────┘
                          │             │
               /api/ ─────┼────────────┘
              / (REST)    │
                          ▼
            ┌────────────────────┐
            │   Express Backend  │  ← Node.js + PM2
            └────────────────────┘
                    │
                    ▼
             ┌─────────────┐
             │ PostgreSQL  │  ← AWS RDS
             └─────────────┘
                          
Frontend (Next.js) listens on 3000,
Backend (Express) on 3001,
Both behind Nginx on port 80/443
```

1. **User** visits the site → Nginx routes traffic:
   - `/api/` calls → to backend (Express on port 3001).
   - everything else → to Next.js (port 3000).
2. **Backend** uses PostgreSQL on AWS RDS to store short URLs, expiration, and click data.
3. **Frontend** calls REST endpoints to shorten URLs, retrieve stats, etc.

---

## 4. Requirements and Prerequisites
- **Node.js** (version 18.x or 20.x recommended)
- **npm** (comes with Node)
- **PostgreSQL** (locally or a remote instance)
- **Git** (for cloning this repository)
- **AWS Account** (if you plan to replicate the cloud setup)

---

## 5. Installation and Local Setup

To run locally, you can either use a local PostgreSQL or set up environment variables pointing to an external DB. Steps below assume local DB:

1. **Clone the Repository**  
   ```bash
   git clone https://github.com/<your-user>/shortify-app.git
   cd shortify-app
   ```

2. **Backend Setup**  
   ```bash
   cd backend
   npm install
   # Create a .env file (see "Environment Variables" section)
   npm run dev
   # This starts Express on http://localhost:3001 (configurable in .env)
   ```

3. **Frontend Setup**  
   ```bash
   cd ../frontend
   npm install
   npm run dev
   # Next.js will run on http://localhost:3000
   ```

4. **Access in your browser**  
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Example API call: [http://localhost:3001/api/shorten](http://localhost:3001/api/shorten) (if your backend port is 3001)

---

## 6. Environment Variables

Below are the **required** environment variables for the **backend** (`backend/.env`):

```ini
PORT=3001
DATABASE_URL=postgres://<user>:<password>@<host>:<port>/<db_name>
BASE_URL=http://<public-host-or-localhost>
```

| Variable        | Description                                                           |
|-----------------|-----------------------------------------------------------------------|
| `PORT`          | Port for Express (default 3001)                                       |
| `DATABASE_URL`  | Connection string to PostgreSQL database                              |
| `BASE_URL`      | Used to construct short URL. For production, your domain or IP (e.g. `http://18.x.x.x`) |

For the **frontend** (`frontend/.env.local` or `.env`):

```ini
NEXT_PUBLIC_BASE_URL=http://<public-host-orlocalhost>
```

| Variable               | Description                                                 |
|------------------------|-------------------------------------------------------------|
| `NEXT_PUBLIC_BASE_URL` | Where the client should point for constructing short links. |

---

## 7. API Endpoints

**Base Path:** `/api`

1. **POST** `/api/shorten`  
   - **Body**:
     ```json
     {
       "original_url": "https://www.example.com/some/long/path",
       "custom_short_id": "my-custom-link" (optional),
       "expires_in_days": 3
     }
     ```
   - **Response**:
     ```json
     {
       "short_id": "abc123",
       "short_url": "http://<BASE_URL>/api/abc123",
       "expires_at": "2025-04-03T..."
     }
     ```

2. **GET** `/api/:shortId`  
   - **Description**: Redirect to original URL if not expired, else show error 404.

3. **GET** `/api/stats/:shortId`  
   - **Description**: Returns analytics:
     ```json
     {
       "short_id": "abc123",
       "original_url": "https://www.example.com",
       "clicks": 10,
       "created_at": "...",
       "expires_at": "..."
     }
     ```

4. **GET** `/api/history`  
   - **Description**: Lists all existing short URLs with basic info. (Optional route)

5. **DELETE** `/api/delete/:shortId`  
   - **Description**: Removes the given short URL and associated click data.

---

## 8. Database Model

Using **PostgreSQL**:

1. **Table** `urls`
   | Column         | Type                           | Note                        |
   |----------------|--------------------------------|----------------------------|
   | `id`           | SERIAL PRIMARY KEY             | Internal ID                |
   | `short_id`     | VARCHAR(255) UNIQUE NOT NULL   | e.g., `abc123`, `my-custom`|
   | `original_url` | TEXT NOT NULL                  | The original long URL      |
   | `created_at`   | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | Creation date      |
   | `expires_at`   | TIMESTAMP                      | Expiration date            |
   | `custom`       | BOOLEAN DEFAULT FALSE          | Whether user customized it |

2. **Table** `clicks`
   | Column       | Type    | Note                                          |
   |--------------|---------|-----------------------------------------------|
   | `id`         | SERIAL PRIMARY KEY  | Internal ID                      |
   | `url_id`     | INTEGER REFERENCES urls(id) ON DELETE CASCADE | Link to `urls` table |
   | `clicked_at` | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | Timestamp of each click |

---

## 9. Deployment Details

We deployed on **AWS EC2** (Ubuntu), with the following steps:

1. **Create EC2 instance** and open ports 80, 443, 22.
2. **Install Node.js**, **Nginx**, **PM2**.
3. **Clone this repo** in `~/shortify-app`.
4. **Setup environment** (create `.env` for backend, `.env.local` for frontend).
5. **Build and run**:
   ```bash
   # Backend
   cd backend
   npm install
   pm2 start src/index.js --name shortify-backend

   # Frontend
   cd ../frontend
   npm install
   npm run build
   pm2 start npm --name shortify-frontend -- run start
   ```
6. **Nginx** routes:
   ```nginx
   server {
       listen 80;
       server_name _;

       location /api/ {
           proxy_pass http://127.0.0.1:3001/;
       }

       location / {
           proxy_pass http://127.0.0.1:3000/;
       }
   }
   ```

7. **Restart** Nginx:
   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
   ```

8. **(Optional)** Use [GitHub Actions](https://github.com/features/actions) for CI/CD: push to `main` triggers a deploy script that pulls code on EC2, runs `npm install`, rebuilds, etc.

---

## 10. GitHub Actions (CI/CD)

This project includes a sample workflow file in `.github/workflows/deploy.yml` that uses [appleboy/ssh-action](https://github.com/appleboy/ssh-action) to deploy changes automatically whenever you push to the `main` branch. Steps to configure:

1. **Generate or obtain an SSH key** on your EC2 instance and add the public key as a Deploy Key (with write access) to your GitHub repo. Store the private key as a GitHub secret (e.g. `EC2_SSH_KEY`).
2. **Define secrets** in your repo settings → Secrets and variables → Actions:
   - `EC2_HOST` = the public IP of your EC2
   - `EC2_USER` = e.g. `ubuntu`
   - `EC2_SSH_KEY` = entire private key text
3. **Review the `deploy.yml`** to ensure it matches your paths (like `~/shortify-app`) and commands you want to run (e.g., `git pull`, `npm install`, `pm2 restart`).
4. **Push changes** → GitHub Actions uses those secrets to SSH into EC2 and execute your deploy script.

---

## 11. Contact / Questions
For any questions, clarifications, or additional support about this project, please open an **issue** in this repository or reach out via the contact details in your project environment.

### Live Demo
> **Deployed on AWS** at:  
> **[http://18.231.208.120/](http://18.231.208.120/)**

Feel free to try it out by shortening your own URLs and viewing the stats.


