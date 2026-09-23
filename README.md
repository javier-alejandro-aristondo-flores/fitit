# FitIT Fitness Planner #


> An AI-powered fitness coach that generates personalized workout routines, tracks physical transformation, and manages tailored nutrition plans.

---

## General Information
* **Who we're working with:** Evan Martinez, Trey Patillo, Javier Flores, Idraak Ahmed
* **What we're creating:** An interactive fitness and nutrition tracking application powered by an AI agent. The app generates custom workout routines, crafts meal and diet plans, and acts as an active coach. It continuously calculates physical progress—estimating muscle gained and fat lost over time using AI—and dynamically adjusts projections if workouts are missed.
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
* **[Jira](https://www.atlassian.com/software/jira):** Agile project management software for planning Sprints 1–3, managing User Stories, and tracking task backlogs.


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
These steps are written for Windows.

### Requirements
| Tool | Version | What it's for |
|---|---|---|
| [Git](https://git-scm.com/downloads) | any recent | Version control |
| [Node.js](https://nodejs.org/) | 24 or newer (LTS) | Runs the backend and the frontend dev server |
| [PostgreSQL](https://www.postgresql.org/download/windows/) | 18 | The database |
| pgAdmin 4 | comes with PostgreSQL | Visual tool for viewing the database |

Project dependencies (Express, React, etc.) will be listed in each folder's `package.json` and installed with `npm install`.

### 1. Install Node.js
Download the LTS installer from [nodejs.org](https://nodejs.org/) and run it with the default options.

### 2. Install PostgreSQL and pgAdmin
1. Download the installer from [postgresql.org/download/windows](https://www.postgresql.org/download/windows/) (choose the newest Windows x86-64 version).
2. Run it and keep these components checked: **PostgreSQL Server**, **pgAdmin 4**, **Command Line Tools**. Stack Builder is not needed.
3. Set a password for the `postgres` superuser and **write it down** — the backend needs it later.
4. Keep the default port, `5432`.

### 3. Add PostgreSQL to your PATH
The installer does not do this, so the terminal can't find `psql` until you do. Run this in PowerShell (change `18` if you installed a different version):

```
[Environment]::SetEnvironmentVariable("Path", [Environment]::GetEnvironmentVariable("Path","User") + ";C:\Program Files\PostgreSQL\18\bin", "User")
```

Then close and reopen VS Code (or your terminal).

### 4. Check that everything works
```
node -v
psql --version
```
Both commands should print a version number.

### 5. Get the code
```
git clone https://bitbucket.org/cs3398-bith0-f26/fitit-ai-fitness-planner.git
cd fitit-ai-fitness-planner
```

### Running the app
Coming soon — instructions for starting the backend and frontend will be added once those folders exist.


