# Backend API

Flask-based API for the expense splitting application.

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

## Running

```bash
pip install -r requirements.txt
python run.py
```

Server runs on `http://0.0.0.0:5000`
