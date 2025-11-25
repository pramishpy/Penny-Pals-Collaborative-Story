# Authentication & Split Sharing Setup

## Overview

A complete user authentication system has been implemented with support for multiple users and split expense sharing. Each user must login to access the application, and expenses can be shared among users in groups.

## Backend Changes

### 1. **User Model Updates** (`app/models/__init__.py`)
- Added `username` field (unique)
- Added `password_hash` field for secure password storage
- Added helper methods:
  - `set_password(password)` - Hashes and stores password using werkzeug
  - `check_password(password)` - Validates password against hash

### 2. **New Auth Routes** (`app/routes/auth.py`)
Complete authentication endpoints:

#### `POST /api/auth/register`
Register a new user
- **Body**: `{ username, email, password, name }`
- **Validation**:
  - Username: min 3 characters, unique
  - Password: min 6 characters
  - Email: valid format, unique
  - Name: required
- **Returns**: User object + session established

#### `POST /api/auth/login`
Login with credentials
- **Body**: `{ username, password }`
- **Returns**: User object if credentials valid, 401 if invalid

#### `POST /api/auth/logout`
Clear user session
- **Returns**: Success message

#### `GET /api/auth/current-user`
Get authenticated user info
- **Returns**: Current user object or 401 if not authenticated

#### `GET /api/auth/users`
Get all users (for adding to groups/splits)
- **Returns**: List of all users in the system

### 3. **Protected Routes**
All other routes now require authentication:
- `/api/dashboard` - Get current user's dashboard
- `/api/expenses` - Get/create expenses for current user
- `/api/groups` - Get/create groups for current user
- `/api/wallet` - Get/manage wallet for current user
- `/api/transactions` - Get transactions for current user

Each route includes `get_current_user()` helper that:
- Reads user ID from session
- Returns 401 if not authenticated
- Only shows data relevant to the logged-in user

### 4. **Session Management**
- Flask session cookies store: `user_id`, `username`
- Uses `SECRET_KEY` in app configuration
- CORS configured with `supports_credentials=True` for cookies

### 5. **Test Users**
Three pre-seeded users for testing:

| Username | Password | Name |
|----------|----------|------|
| john | password123 | John Doe |
| alex | password123 | Alex Smith |
| sam | password123 | Sam Johnson |

## Frontend Changes

### 1. **New Login Page** (`pages/login.tsx`)
- Clean, modern login/register interface
- Supports both login and registration modes
- Toggle between modes
- Demo credentials displayed on login page
- Form validation with user-friendly errors
- Responsive design with gradient background

Features:
- Username/password login
- Full registration (username, email, password, name)
- Password confirmation matching
- Real-time error display
- Loading states

### 2. **Authentication Middleware** (`pages/_app.tsx`)
Protects all routes:
- Checks authentication on app startup
- Public pages: `/login`, `/`
- Protected pages: All others require login
- Auto-redirects unauthenticated users to login
- Shows loading spinner during auth check

### 3. **Updated API Client** (`lib/api.ts`)
New auth methods:
- `register(userData)` - Create new account
- `login(credentials)` - Login user
- `logout()` - Logout and clear session
- `getCurrentUser()` - Get authenticated user
- `getAllUsers()` - Get all users for sharing
- Axios configured with `withCredentials: true` for cookies

### 4. **Enhanced Header Component** (`components/Header.tsx`)
- Displays current username
- Shows user menu with name/email
- Logout button clears session and redirects to login
- Fetches current user on component mount

### 5. **Updated Home Page** (`pages/index.tsx`)
- Checks authentication on load
- Redirects authenticated users to dashboard
- Shows login/signup CTAs for unauthenticated users

## Split Sharing Implementation

### Expense Splits
- Expenses automatically split equally among all participants
- When adding an expense, specify:
  - Title
  - Amount
  - Group (optional) - if group, splits among all group members
  - If no group, splits between current user and one other user

### Group Sharing
- Create groups and add members
- When expense is added to group, automatically splits among all members
- Members contribute their share automatically

### Current User Context
All operations now scoped to authenticated user:
- Dashboard shows only that user's expenses
- Transactions show only that user's splits
- Wallet shows only that user's balance
- Groups show only those the user is member of

## How to Test Multi-User Split Sharing

### Setup
1. Start backend: `python run.py` (runs on port 5000)
2. Start frontend: `npm run dev` (runs on port 3000)
3. Open http://localhost:3000 in browser

### Test Scenario
1. **Browser 1 - Login as John**
   - Go to login page
   - Username: `john`, Password: `password123`
   - See John's dashboard

2. **Browser 2 - Login as Alex** (or incognito window)
   - Go to login page
   - Username: `alex`, Password: `password123`
   - See Alex's dashboard

3. **Add Expense as John**
   - Go to Transactions page
   - Add new expense: "Dinner" for $60
   - This splits between John (paid $60) and Alex (owes $30)

4. **View as Both Users**
   - John's view: Shows he paid $60, owes nothing
   - Alex's view: Shows he owes $30 to John
   - Real-time reflection across both browsers/sessions

5. **Multi-User Group**
   - Create group with multiple members
   - Add expense to group
   - All members see their share
   - Each user only sees their own perspective

## Dependencies Added

- `Werkzeug==2.3.7` - Password hashing and security utilities

## Database Schema Changes

### Users Table
```
users
├── id (String, PK)
├── username (String, UNIQUE)
├── email (String, UNIQUE)
├── password_hash (String)
├── name (String)
└── created_at (DateTime)
```

## Security Notes

- Passwords hashed with Werkzeug's PBKDF2
- Session cookies used instead of tokens
- CORS configured for local development
- Production: Change `SECRET_KEY` in app configuration
- HTTP-only cookies recommended for production

## Future Enhancements

- Email verification
- Password reset functionality
- Social login (Google, Facebook)
- Transaction history and analytics
- Payment settlement system
- Notification system
- Mobile app
