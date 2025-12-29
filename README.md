# Banking Fraud Detection Dashboard (Frontend)

## Project Info

**Project URL**: http://localhost:3000
 (Local)
**GitHub Repo**: https://github.com/areeba-qamar/banking_fraud_detection_simulation.git

This frontend provides a real-time dashboard for banking transactions and fraud alerts. It connects to the backend service, listens to live transaction streams via SSE, and visualizes fraud alerts, metrics, and transaction history.

### How Can I Edit This Code?

#### 1. Using Lovable

If your project is on Lovable, open the project here
 and make edits. Changes are automatically committed to the repo.

#### 2. Using Your Local IDE

You can also work locally:

##### Clone the repository

git clone https://github.com/areeba-qamar/banking_fraud_detection_simulation.git

##### Navigate to frontend folder
cd banking_fraud_detection_simulation

##### Install dependencies

npm install

##### Start development server

npm run dev

Open your browser at http://localhost:3000 to view the dashboard.

#### 3. Edit Directly on GitHub

Navigate to the file(s) in the repo.

Click the pencil icon to edit and commit changes.

#### 4. GitHub Codespaces

- Go to the repo main page → Click Code → Codespaces → New codespace.

- Edit files inside Codespaces, commit, and push changes.

## Technologies Used

- React (Vite + TypeScript) – Frontend framework

- Tailwind CSS & shadcn-ui – Styling and UI components

- Server-Sent Events (SSE) – Real-time transaction and alert streaming

- Fetch API / Axios – Backend communication

Running the Dashboard

## Working

**Make sure backend service is running and accessible (http://localhost:8080).**

### Start the frontend dev server:

npm run dev


Open http://localhost:3000 in your browser.

#### The dashboard displays:

- Recent transactions

- Live fraud alerts

- Metrics (total transactions today, alerts per second, top risky accounts)

- Deploying

If using Lovable, click Share → Publish.

For custom domains, navigate to Project → Settings → Domains → Connect Domain.

For manual deployment, build with:

npm run build


and serve the dist/ folder via any static file server.