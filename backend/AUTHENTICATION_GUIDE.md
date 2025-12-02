# Authentication & Split Sharing Guide

## Quick Start

### Database
Database starts empty - **no pre-seeded users**. You must register users yourself.

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

Then open http://localhost:3000 and register accounts to get started.

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
- `GET /api/dashboard` - User dashboard with groups and amounts
- `GET /api/expenses` - User's expenses from their groups
- `POST /api/expenses` - Add expense (auto-splits equally)
- `GET /api/groups` - User's groups with members
- `POST /api/groups` - Create group (user auto-added)
- `POST /api/groups/<id>/members` - Add members to group
- `GET /api/wallet` - Wallet balance and stats
- `POST /api/wallet/load` - Add funds
- `GET /api/transactions` - Alias for expenses

## File Structure Changes

### Backend
- `app/models/__init__.py` - User model with username, password_hash
- `app/routes/auth.py` - Register, login, logout, get-current-user, get-all-users
- `app/routes/dashboard.py` - Groups with amounts and members
- `app/routes/expenses.py` - Expenses with splitting and group filtering
- `app/routes/groups.py` - Groups with member management
- `app/routes/wallet.py` - Balance and spending statistics

### Frontend
- `pages/login.tsx` - Login/register interface
- `pages/_app.tsx` - Auth middleware protecting routes
- `pages/index.tsx` - Home page redirects to dashboard
- `pages/dashboard.tsx` - Shows groups and balance
- `pages/groups.tsx` - Groups list with member management
- `pages/transactions.tsx` - Expense list
- `pages/wallet.tsx` - Wallet balance and stats
- `lib/api.ts` - API methods with auth
- `components/Header.tsx` - Shows username and logout
- `components/GroupModal.tsx` - Create group
- `components/AddMembersModal.tsx` - Add members to group (NEW)
- `components/ExpenseModal.tsx` - Add expense with member selection

## Code Quality

All code is:
- ✅ Modular and easy to follow
- ✅ Well-commented
- ✅ Consistent with existing style
- ✅ RESTful API design
- ✅ Proper error handling
- ✅ Input validation

## Testing Multi-User Scenario

### Setup
1. Open http://localhost:3000
2. Click Register
3. Create User 1: alice / alice@test.com / pass123
4. Create User 2: Use new incognito window, register bob / bob@test.com / pass123

### Testing Group & Expense Flow
1. **Login as Alice**
   - Click "Create Group" → "Trip"
   - Groups page shows "Trip" (empty members)
   - Click "Add Members" → Select Bob
   - Trip now shows Bob as member

2. **Add Expense as Alice**
   - Click "Add Expense"
   - Title: "Dinner", Amount: $60
   - Group: "Trip"
   - Members auto-loaded: Alice, Bob
   - Both checked (equal split)
   - Submit

3. **View as Alice**
   - Dashboard: "Trip" shows $30 owed
   - Transactions: "Dinner" shows $60 paid
   - Wallet: Total spent $60, owed by others $30

4. **View as Bob** (incognito/other browser)
   - Dashboard: "Trip" shows $30 owed
   - Transactions: "Dinner" shows owes $30
   - Wallet: You owe others $30

### Multi-Tab Testing
- Open two browser tabs (one incognito)
- Login as different users
- Add multiple expenses
- Watch real-time updates across tabs
- All group members see all group expenses

## Database

- SQLite stored in `backend/instance/penny_pals.db`
- Auto-created on first run
- **Starts empty** - no pre-seeded data
- Register users manually via frontend
- Proper foreign keys for data relationships

## Security Considerations

For production, update:
- `app.config['SECRET_KEY']` in `backend/app/__init__.py`
- Use environment variables for config
- Enable HTTPS
- Use httpOnly cookies
- Add CSRF protection
- Implement rate limiting
