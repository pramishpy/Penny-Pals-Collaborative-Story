# Backend API

Flask-based API for PennyPals.
Here are the endpoints to interact with the backend services.

## Authentication

### Auth Endpoints
- `POST /api/auth/register` - Register a new user
  - Body: `{ username, email, password, name }`
  - Returns: User object with id, username, email, name
  
- `POST /api/auth/login` - Login user
  - Body: `{ username, password }`
  - Returns: User object with session established
  
- `POST /api/auth/logout` - Logout user
  - Returns: Success message
  
- `GET /api/auth/current-user` - Get current logged-in user
  - Returns: Current user object
  
- `GET /api/auth/users` - Get all users
  - Returns: List of all users (for adding to groups/splits)

## Endpoints

### Dashboard
- `GET /api/dashboard` - Get dashboard summary with user stats, recent expenses, and group info

### Expenses
- `GET /api/expenses` - Fetch all expenses
- `POST /api/expenses` - Create a new expense

### Groups
- `GET /api/groups` - Fetch all groups
- `POST /api/groups` - Create a new group

### Wallet
- `GET /api/wallet` - Get wallet balance
- `POST /api/wallet/load` - Add funds to wallet

## Test Users

The database is initialized with test users. You can login with:

| Username | Password | Name |
|----------|----------|------|
| john | password123 | John Doe |
| alex | password123 | Alex Smith |
| sam | password123 | Sam Johnson |

## Running

```bash
pip install -r requirements.txt
python run.py
```

Server runs on `http://0.0.0.0:5000`
