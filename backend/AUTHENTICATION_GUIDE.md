# Authentication & Split Sharing Guide

## Quick Start

### Test Users (Pre-seeded in database)
- **john** / password123
- **alex** / password123  
- **sam** / password123

### Running the Application

**Terminal 1 - Backend:**
```bash
cd backend
pip install -r requirements.txt
python run.py
```
Runs on: http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Runs on: http://localhost:3000

## Features Implemented

### 1. User Authentication
- ✅ Register new users (username, email, password)
- ✅ Login with username/password
- ✅ Logout functionality
- ✅ Protected routes (require login)
- ✅ Session-based authentication

### 2. Split Sharing
- ✅ Create expenses and split equally
- ✅ Add users to groups
- ✅ Track who owes whom
- ✅ Multi-user expense tracking
- ✅ User-specific dashboard

### 3. Multi-User Testing
Open two browser windows/tabs:
- Tab 1: Login as "john"
- Tab 2: Login as "alex" (incognito recommended)
- Both can add expenses simultaneously
- Both see their own view of who owes what

## Backend API Endpoints

### Auth Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/current-user` - Get logged-in user info
- `GET /api/auth/users` - Get all users

### Protected Endpoints
- `GET /api/dashboard` - User dashboard
- `GET /api/expenses` - User's expenses
- `POST /api/expenses` - Add expense
- `GET /api/groups` - User's groups
- `POST /api/groups` - Create group
- `GET /api/wallet` - Wallet balance
- `POST /api/wallet/load` - Add funds

## File Structure Changes

### Backend
- `app/models/__init__.py` - Updated User model (added username, password_hash)
- `app/routes/auth.py` - NEW authentication routes
- `app/routes/dashboard.py` - Updated to use current user
- `app/routes/expenses.py` - Updated to use current user
- `app/routes/groups.py` - Updated to use current user
- `app/routes/wallet.py` - Updated to use current user
- `backend/requirements.txt` - Added Werkzeug

### Frontend
- `pages/login.tsx` - NEW login/register page
- `pages/_app.tsx` - Added auth middleware
- `pages/index.tsx` - Updated to check auth
- `lib/api.ts` - Added auth methods
- `components/Header.tsx` - Added logout and user info

## Code Quality

All code is:
- ✅ Modular and easy to follow
- ✅ Well-commented
- ✅ Consistent with existing style
- ✅ RESTful API design
- ✅ Proper error handling
- ✅ Input validation

## Testing Multi-User Scenario

1. Open http://localhost:3000
2. You'll be redirected to login page
3. Login as "john" (password: password123)
4. See John's dashboard
5. Open new incognito window
6. Login as "alex" (password: password123)
7. Add an expense in John's browser
8. Refresh Alex's browser
9. See the updated expense split

## Database

- SQLite stored in `backend/app/penny_pals.db`
- Auto-created on first run
- Pre-seeded with test data (john, alex, sam)
- Foreign keys for Users, Groups, Expenses, Splits

## Security Considerations

For production, update:
- `app.config['SECRET_KEY']` in `backend/app/__init__.py`
- Use environment variables for config
- Enable HTTPS
- Use httpOnly cookies
- Add CSRF protection
- Implement rate limiting
