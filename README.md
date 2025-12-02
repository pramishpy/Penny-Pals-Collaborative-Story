# PennyPals - Collaborative Story & Fintech App

PennyPals is a collaborative application with features for managing finances, splitting expenses, and more. This project consists of a Flask backend and a Next.js frontend.

## Prerequisites

- Node.js (v14 or higher)
- Python (v3.8 or higher)
- npm or yarn

## Project Structure

- `backend/`: Flask API server and SQLite database
- `frontend/`: Next.js React application

## Setup Instructions

### 1. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Initialize the database:

The application uses a SQLite database (`app.db`). To initialize it with the required schemasimply run the application, which will create the database if it doesn't exist.

Run the backend server:

```bash
python3 run.py
```

The backend will start on `http://localhost:5000`.

### 2. Frontend Setup

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

The frontend will start on `http://localhost:3000`.
Make sure you sign up and set up users if you are logging in for the first time.

## Running the Application

1. Ensure the backend is running on port 5000.
2. Ensure the frontend is running on port 3000.
3. Open your browser and visit `http://localhost:3000`.

## Database Management

The project uses SQLAlchemy with SQLite. The database file is located at `backend/app.db`.

To add the currency column to an existing database (if needed):

```bash
cd backend
python3 update_db_currency.py
```

## Troubleshooting

- **Port Conflicts**: Ensure ports 3000 and 5000 are free.
- **Database Issues**: If you encounter schema errors, you can delete `backend/app.db` and restart the backend to recreate it fresh (warning: this deletes all data).
