# FitIT Fitness Planner #


> An AI-powered fitness coach that generates personalized workout routines, tracks physical transformation, and manages tailored nutrition plans.

---

## General Information
* **Who we're working with:** Evan Martinez, Trey Patillo, Javier Flores, Idraak Ahmed
<<<<<<< HEAD
* **What we're creating:** An interactive fitness and nutrition tracking application powered by an AI agent. The app generates custom workout routines, crafts meal and diet plans, and acts as an active coach. It continuously calculates physical progress—estimating muscle gained and fat lost over time using AI—and dynamically adjusts projections if workouts are missed.
=======
* **What we're creating:** An interactive fitness and nutrition tracking application powered by an AI agent. The app generates custom workout routines, crafts meal and diet plans, and acts as an active coach. It continuously calculates physical progress�estimating muscle gained and fat lost over time using AI�and dynamically adjusts projections if workouts are missed.
* **Target Audience:** Individuals seeking an intelligent, automated assistant to construct structured workout plans, optimize their nutrition, and visualize long-term fitness growth.
* **Impact & Vision:** We aim to remove the guesswork from personal health by making fitness and nutrition tracking seamless, accountable, and motivating through dynamic AI feedback.

---

## Technologies Used
* **[Python](https://www.python.org/)** - Core programming language for application backend logic and AI orchestration.
* **[Docker](https://www.docker.com/)** - Containerization platform to ensure consistent development and deployment environments.
* **[Git](https://git-scm.com/)** - Distributed version control system for source code management.

### Frontend & Mobile Development
* **[React Native](https://reactnative.dev/):** Cross-platform mobile framework for building native user interfaces on iOS and Android.
* **[Expo](https://expo.dev/):** Toolchain and platform surrounding React Native for rapid mobile application development and testing.

### Backend & API
* **[Node.js](https://nodejs.org/):** Open-source, cross-platform JavaScript runtime environment for server-side code.
* **[Express.js](https://expressjs.com/):** Web application framework for building REST API endpoints (`/api/auth`, `/api/routines`, `/api/logs`).
* **[JSON Web Tokens (JWT)](https://jwt.io/):** Compact, URL-safe token standard used for secure user session authentication.
* **[bcrypt](https://www.npmjs.com/package/bcrypt):** Password hashing library used to encrypt user security credentials before saving to the database.

### Database & Storage
* **[PostgreSQL](https://www.postgresql.org/):** Open-source relational database management system for storing user profiles, workout plans, and workout logs (`workout_logs` and `set_logs`).

### AI Integration
* **[OpenAI API](https://platform.openai.com/docs/overview):** API service accessing GPT models to generate personalized 7-day workout plans and process user performance adjustments.

### Project Management & Version Control
* **[Bitbucket](https://bitbucket.org/):** Git-based code hosting and team collaboration platform.
* **[Jira](https://www.atlassian.com/software/jira):** Agile project management software for planning Sprints 1�3, managing User Stories, and tracking task backlogs.

### AI Assistants used
* Gemini
* Claude Code


## Features (Sprint 1)

### 1. AI Routine Generator
* **Description:** Interactively prompts the user for fitness goals, current experience level, and available equipment to generate a fully customized workout schedule.
* **User/Consumer:** End User (Gym Goer / Fitness Enthusiast)

### 2. Physical Impact & Progress Modeler
* **Description:** Analyzes workout logging consistency over time to estimate physiological changes (muscle mass gained or fat lost) and recalculates trajectory when sessions are skipped.
* **User/Consumer:** End User

### 3. AI Diet & Meal Assistant
* **Description:** Recommends daily calorie and macronutrient targets while generating structured meal options based on individual dietary preferences and targets.
* **User/Consumer:** End User

---

## Screenshots



## Setup
The database runs in Docker, so you don't need to install PostgreSQL.

### Requirements
| Tool | Version | What it's for |
|---|---|---|
| [Git](https://git-scm.com/downloads) | any recent | Version control |
| [Node.js](https://nodejs.org/) | 24 or newer (LTS) | Runs the backend and the frontend dev server |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | any recent | Runs PostgreSQL and pgAdmin in containers |

Project dependencies (Express, React, etc.) will be listed in each folder's `package.json` and installed with `npm install`.

### 1. Install Node.js and Docker Desktop
- Node.js: download the LTS installer from [nodejs.org](https://nodejs.org/) and run it with the default options.
- Docker Desktop: install it from [docker.com](https://www.docker.com/products/docker-desktop/) and **start it** (the whale icon should appear in your taskbar).

Check both work:
```
node -v
docker --version
```

### 2. Get the code
```
git clone https://bitbucket.org/cs3398-bith0-f26/fitit-ai-fitness-planner.git
cd fitit-ai-fitness-planner
```

### 3. Create your `.env` file
Copy the template, then open `.env` and change `POSTGRES_PASSWORD` to a password of your choice:
```
copy .env.example .env
```
`.env` is ignored by Git, so your password is never committed. Everyone picks their own; it only protects the database on your computer.

### 4. Start the database
```
docker compose up -d
```
The first run downloads the images, which takes a minute. Check that both containers are running:
```
docker compose ps
```
You should see `fitit-db` and `fitit-pgadmin` with status `Up`.

> **Port 5432 already in use?** You have PostgreSQL installed directly on your computer. Stop it: open **Services** (Windows key → "Services"), find **postgresql-x64-…**, click **Stop**, and set **Startup type** to **Manual**.

### 5. Open the database in pgAdmin
1. Go to http://localhost:5050 and log in with `PGADMIN_EMAIL` / `PGADMIN_PASSWORD` from your `.env` (defaults: `admin@example.com` / `admin`).
2. Right-click **Servers** → **Register** → **Server…**
3. **General** tab: Name = `FitIT`
4. **Connection** tab: Host = `db`, Port = `5432`, Username = `postgres`, Password = your `POSTGRES_PASSWORD`. Tick **Save password**.
5. Click **Save**. You should see the `fitit` database under **FitIT → Databases**.

### Everyday commands
| Command | What it does |
|---|---|
| `docker compose up -d` | Start the database and pgAdmin in the background |
| `docker compose ps` | Show what's running |
| `docker compose down` | Stop everything (your data is kept) |
| `docker compose down -v` | Stop everything **and delete all database data** |

### Running the app
Coming soon — instructions for starting the backend and frontend will be added once those folders exist.
