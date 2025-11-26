# PennyPals Copilot Instructions

## Project Overview

**PennyPals** is a full-stack expense-sharing application with Flask backend (SQLite) and Next.js frontend.

### Architecture
- **Backend**: Flask REST API (`backend/app/`) with modular blueprint routes
- **Frontend**: Next.js + TypeScript with Tailwind CSS (`frontend/`)
- **Database**: SQLite with SQLAlchemy ORM (auto-created in `backend/instance/`)
- **Auth**: Session-based (server-side via Flask session)

### Key Data Model
```
User (id, username, email, password_hash, name)
  ├─ Groups (many-to-many via group_members table)
  ├─ Expenses (paid_by relationship)
  └─ ExpenseSplits (owns portion of expenses)

Expense (id, title, amount, paid_by, group_id)
  └─ ExpenseSplits (one-to-many)

ExpenseSplit (id, expense_id, user_id, amount)
  └─ Tracks individual portions
```

## Essential Patterns

### Backend (Flask)
- **Location**: `backend/app/routes/` - one file per domain (auth.py, expenses.py, groups.py, dashboard.py, wallet.py)
- **Bootstrap**: `backend/app/__init__.py` creates Flask app with blueprints, seed data, CORS
- **Session Auth**: All routes validate `session.get('user_id')` directly (no middleware)
- **Error Handling**: Use `handle_error(msg, status_code)` helper from `app.utils.helpers`
- **Serialization**: `serialize_model(instance)` converts SQLAlchemy models to dicts with ISO datetime
- **ID Generation**: All IDs are UUIDs via `generate_id()` helper

### Frontend (Next.js)
- **API Layer**: `lib/api.ts` exports `api` object with all endpoints (wraps axios with error handling)
- **Auth Guard**: `pages/_app.tsx` middleware - redirects unauthenticated users to `/login` except public routes (['/login', '/'])
- **Component Pattern**: Reusable UI components in `components/` (Button, Card, Header, Footer, Modals)
- **Page Structure**: Each page calls `api.*` methods in useEffect and manages local state
- **Environment**: `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:5000/api`)

### Cross-Cutting Concerns
- **CORS**: Enabled with `supports_credentials=True` (needed for session cookies)
- **Request Format**: All POST/PUT bodies are JSON with `Content-Type: application/json`
- **Error Response**: `{ error: string }` format on failure; `{ message?: string, data?: any }` on success

## Development Workflow

### Setup
```bash
# Backend
cd backend && pip install -r requirements.txt
python run.py  # runs on http://0.0.0.0:5000

# Frontend  
cd frontend && npm install
npm run dev  # runs on http://localhost:3000
```

### Debugging
- **Backend**: Flask debug mode enabled by default; logs to stdout
- **Frontend**: Next.js dev server with hot reload
- **Database**: SQLite file at `backend/instance/penny_pals.db`; re-initializes if empty with seed data
- **Kill Servers**: Run `./kill-servers.sh` to stop all running processes

### Testing Credentials
Database auto-seeds with:
- john / password123
- alex / password123
- sam / password123

## Adding Features

### New Endpoint
1. Create route in `backend/app/routes/{domain}.py` as a Blueprint function
2. Validate session in route: `user = User.query.get(session.get('user_id'))`
3. Return `{ message/error: string, data?: any }` tuples with status code
4. Register blueprint in `backend/app/__init__.py`: `app.register_blueprint(..._bp, url_prefix='/api')`
5. Add wrapper in `frontend/lib/api.ts` with error handling

### New Database Model
1. Define in `backend/app/models/__init__.py`
2. Relationships use string-based ForeignKey names (e.g., `db.ForeignKey('users.id')`)
3. Always include `extend_existing=True` in `__table_args__` (handles re-runs)
4. Add `cascade='all, delete-orphan'` for parent-owned children

### Frontend Form/Modal
1. Create component in `components/`
2. Accept data and callback: `interface Props { data?: any; onSubmit: (data) => Promise<void>; }`
3. Use `api.* methods` for requests; show errors with toast/alert
4. Parent page manages modal state and triggers refresh on success

## File Structure Quick Reference
```
backend/
  run.py              # Entry point
  app/__init__.py     # Flask factory, blueprint registration, seed data
  app/models/         # SQLAlchemy ORM models (single __init__.py)
  app/routes/         # One route file per domain (blueprint pattern)
  app/utils/          # Shared helpers (generate_id, serialize_model, handle_error)

frontend/
  lib/api.ts          # Axios wrapper with all endpoint methods
  pages/              # Next.js pages (auto-routed)
  components/         # Reusable React components
  types/index.ts      # Shared TypeScript interfaces
  styles/globals.css  # Tailwind + global styles
```

## Conventions
- **Naming**: snake_case for Python, camelCase for TypeScript
- **IDs**: Always UUID strings (frontend and backend)
- **Amounts**: Floats in DB; formatted as `$X.XX` strings for display
- **Dates**: ISO 8601 format (via `datetime.isoformat()`)
- **Icons**: Emoji mapped in expense list based on title keywords (see `get_icon()` in expenses.py)
