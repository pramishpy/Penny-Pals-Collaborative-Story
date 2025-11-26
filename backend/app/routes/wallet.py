from flask import Blueprint, request, jsonify, session
from app.models import db, Wallet, User, Expense, ExpenseSplit
from app.utils.helpers import generate_id, serialize_model, handle_error

wallet_bp = Blueprint('wallet', __name__)

def get_current_user():
    """Get current logged-in user from session"""
    user_id = session.get('user_id')
    if not user_id:
        return None
    return User.query.get(user_id)

@wallet_bp.route('/wallet', methods=['GET'])
def get_wallet():
    """Get wallet information with spending stats"""
    try:
        user = get_current_user()
        if not user:
            return {'error': 'Not authenticated'}, 401
        
        wallet = Wallet.query.filter_by(user_id=user.id).first()
        wallet_balance = wallet.balance if wallet else 0.0
        
        # Calculate spending stats
        total_spent = 0.0
        total_owed_by_others = 0.0
        total_owed_to_others = 0.0
        
        # Get all expenses the user paid
        expenses_paid = Expense.query.filter_by(paid_by=user.id).all()
        total_spent = sum(exp.amount for exp in expenses_paid)
        
        # Get all expense splits for the user
        all_splits = ExpenseSplit.query.filter_by(user_id=user.id).all()
        
        for split in all_splits:
            expense = Expense.query.get(split.expense_id)
            if expense:
                if expense.paid_by != user.id:
                    # User owes this amount (someone else paid)
                    total_owed_to_others += split.amount
                else:
                    # User paid, others owe them
                    # This is already counted in total_spent, but we calculate who owes what
                    pass
        
        # Calculate how much others owe the user
        total_owed_by_others = total_spent - sum(
            s.amount for s in all_splits if Expense.query.get(s.expense_id).paid_by == user.id
        )
        
        return {
            'balance': f'${wallet_balance:.2f}',
            'card_last_four': '3456',
            'user_id': user.id,
            'total_spent': f'${total_spent:.2f}',
            'total_owed_by_others': f'${total_owed_by_others:.2f}',
            'total_owed_to_others': f'${total_owed_to_others:.2f}',
            'raw_balance': wallet_balance,
            'raw_total_spent': total_spent,
            'raw_owed_by': total_owed_by_others,
            'raw_owed_to': total_owed_to_others
        }, 200
    except Exception as e:
        return handle_error(str(e), 500)

@wallet_bp.route('/wallet/load', methods=['POST'])
def load_balance():
    """Load balance to wallet"""
    try:
        user = get_current_user()
        if not user:
            return {'error': 'Not authenticated'}, 401
        
        data = request.json
        
        if 'amount' not in data:
            return handle_error('Amount is required')
        
        amount = float(data['amount'])
        if amount <= 0:
            return handle_error('Amount must be greater than 0')
        
        wallet = Wallet.query.filter_by(user_id=user.id).first()
        if not wallet:
            wallet_id = generate_id()
            wallet = Wallet(
                id=wallet_id,
                user_id=user.id,
                balance=amount
            )
            db.session.add(wallet)
        else:
            wallet.balance += amount
        
        db.session.commit()
        
        return {
            'success': True,
            'balance': f'${wallet.balance:.2f}'
        }, 200
    except Exception as e:
        db.session.rollback()
        return handle_error(str(e), 500)
