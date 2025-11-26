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

### 5. **Database Initialization**
Database starts empty - no pre-seeded users. Users must register themselves.
- SQLite database auto-created at `backend/instance/penny_pals.db`
- All tables created on first run
- Fresh start for each deployment

## Frontend Changes

### 1. **New Login Page** (`pages/login.tsx`)
- Clean login/register interface
- Toggle between modes
- Form validation with error display
- Responsive design with gradient background

Features:
- Username/password login
- Full registration (username, email, password, name)
- Password confirmation
- Real-time error messages
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

### Group Management
- Users create groups (user auto-added as creator)
- Add existing users to groups via "Add Members" modal
- Only group members can see the group and its expenses
- Group members can add new members to the group

### Expense Splitting
- Create expenses within a group
- Select which group members participate
- Amount automatically divided equally among participants
- Each participant gets an ExpenseSplit record for their share
- User can see total owed to/by them in wallet

### User Isolation
- All operations scoped to authenticated user
- Dashboard shows only user's groups
- Transactions show only expenses from user's groups
- Wallet shows only user's balance and splits
- Users cannot see other users' groups or expenses

## How to Test Multi-User Split Sharing

### Setup
1. Start backend: `python run.py` (runs on http://localhost:5000)
2. Start frontend: `npm run dev` (runs on http://localhost:3000)
3. Open http://localhost:3000 in browser

### Test Scenario
1. **Register User 1** (Alice)
   - Click Register
   - Username: `alice`, Email: `alice@test.com`, Password: `pass123`, Name: `Alice`
   - See dashboard (empty initially)

2. **Register User 2** (Bob) - Use incognito/new browser
   - Register with username: `bob`, Email: `bob@test.com`, Password: `pass123`, Name: `Bob`

3. **Create Group (Alice)**
   - Click "Create Group"
   - Name: "Trip"
   - Submit → Group created

4. **Add Members (Alice)**
   - View Groups → Click "Trip"
   - Click "Add Members"
   - Select Bob
   - Bob is now in group

5. **Add Expense (Alice)**
   - Click "Add Expense"
   - Title: "Dinner", Amount: $60
   - Select Group: "Trip"
   - Members auto-loaded: Alice, Bob
   - Both checked (equal split)
   - Submit → Expense created: Alice paid $60, Bob owes $30

6. **View as Alice**
   - Dashboard: "Trip" group shows $30 owed
   - Transactions: "Dinner" shows paid $60
   - Wallet: Total spent $60, owed by others $30

7. **View as Bob** (incognito/other browser)
   - Dashboard: "Trip" group shows $30 owed
   - Transactions: "Dinner" shows owes $30 to Alice
   - Wallet: You owe others $30

### Multi-Tab Testing
- Open two browser tabs in incognito mode
- Login as different users
- Add expenses and watch real-time updates
- Members see all group expenses instantly

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
