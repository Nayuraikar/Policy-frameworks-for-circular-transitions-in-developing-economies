# Circular Policy — Policy Simulation Simulator

Circular Policy is a full-stack web application designed to simulate and forecast recycling adoption rates in urban centers based on policy levers and demographic data. It integrates a Structural Equation Model (SEM) with an XGBoost machine learning model to provide a 12-month forecast on landfill diversion and municipal budget impacts.

## Architecture

* **Frontend**: React + Vite (running on port 5173). Features an interactive dashboard with policy sliders, live forecasting charts, and a downloadable markdown report generator.
* **Backend**: FastAPI (running on port 8000). Hosts the pre-trained XGBoost model and feature scaler, calculates SEM metrics, and generates time-series forecasts.

## Getting Started

### Prerequisites
* Node.js (v16+)
* Python (3.9+)

### 1. Start the Backend
Navigate to the `backend` directory, install dependencies, and start the FastAPI server:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Start the Frontend
In a new terminal window, navigate to the `frontend` directory, install packages, and start the Vite development server:
```bash
cd frontend
npm install
npm run dev
```

Open your browser to `http://localhost:5173`.

## Machine Learning Models

The `backend/models/` directory contains:
* `recycling_intention_model.pkl`: A trained XGBoost classifier (81.2% accuracy) for predicting adoption probability.
* `scaler.pkl`: The feature scaler used to normalize inputs before prediction.

*Note: These files are managed via Git Large File Storage (LFS).*
