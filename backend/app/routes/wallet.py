from flask import Blueprint, request, jsonify, session
from app import db
from app.models import Wallet, Expense, ExpenseSplit, User
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
        # Total spent by user - User's share in those expenses
        user_share_in_paid_expenses = 0.0
        for split in all_splits:
            expense = Expense.query.get(split.expense_id)
            if expense and expense.paid_by == user.id:
                user_share_in_paid_expenses += split.amount
                
        total_owed_by_others = total_spent - user_share_in_paid_expenses
        
        return {
            'balance': f'${wallet_balance:.2f}',
            'card_last_four': wallet.card_last_four if wallet else '3456',
            'bank_account': wallet.bank_account if wallet else None,
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

@wallet_bp.route('/wallet/link-bank', methods=['POST'])
def link_bank_account():
    """Link a bank account"""
    try:
        user = get_current_user()
        if not user:
            return {'error': 'Not authenticated'}, 401
        
        data = request.json
        if 'account_number' not in data:
            return handle_error('Account number is required')
            
        account_number = data['account_number']
        if len(account_number) < 4:
            return handle_error('Invalid account number')
            
        wallet = Wallet.query.filter_by(user_id=user.id).first()
        if not wallet:
            wallet = Wallet(
                id=generate_id(),
                user_id=user.id,
                balance=0.0,
                bank_account=account_number[-4:] # Store last 4 digits for security/demo
            )
            db.session.add(wallet)
        else:
            wallet.bank_account = account_number[-4:]
            
        db.session.commit()
        
        return {
            'success': True,
            'message': 'Bank account linked successfully',
            'bank_account': wallet.bank_account
        }, 200
    except Exception as e:
        db.session.rollback()
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
            # Create wallet if it doesn't exist (auto-create for demo)
            wallet_id = generate_id()
            wallet = Wallet(
                id=wallet_id,
                user_id=user.id,
                balance=amount
            )
            db.session.add(wallet)
        else:
            # In a real app, we would check if bank_account is linked
            # For this demo, we allow adding funds even if not linked, or we could enforce it.
            # Let's enforce it if the user asked "make sure i can add dummy money, after i have linked a dummy bank account"
            # But to be user friendly, let's just allow it but maybe warn? 
            # The user said "make sure i can add dummy money, after i have linked a dummy bank account number."
            # So let's just process it.
            wallet.balance += amount
        
        db.session.commit()
        
        return {
            'success': True,
            'balance': f'${wallet.balance:.2f}',
            'message': f'Successfully added ${amount:.2f} to your wallet'
        }, 200
    except Exception as e:
        db.session.rollback()
        return handle_error(str(e), 500)
@wallet_bp.route('/wallet/pay', methods=['POST'])
def pay_user():
    """Pay another user"""
    try:
        user = get_current_user()
        if not user:
            return {'error': 'Not authenticated'}, 401
        
        data = request.json
        
        if not all(k in data for k in ['recipient_id', 'amount']):
            return handle_error('Missing recipient_id or amount')
        
        recipient_id = data['recipient_id']
        amount = float(data['amount'])
        
        if amount <= 0:
            return handle_error('Amount must be greater than 0')
        
        if recipient_id == user.id:
            return handle_error('Cannot pay yourself')
        
        recipient = User.query.get(recipient_id)
        if not recipient:
            return handle_error('Recipient not found', 404)
        
        # Get sender's wallet
        sender_wallet = Wallet.query.filter_by(user_id=user.id).first()
        if not sender_wallet or sender_wallet.balance < amount:
            return handle_error('Insufficient funds')
        
        # Get recipient's wallet
        recipient_wallet = Wallet.query.filter_by(user_id=recipient.id).first()
        if not recipient_wallet:
            # Create wallet for recipient if it doesn't exist
            recipient_wallet = Wallet(
                id=generate_id(),
                user_id=recipient.id,
                balance=0.0
            )
            db.session.add(recipient_wallet)
        
        # Transfer funds
        sender_wallet.balance -= amount
        recipient_wallet.balance += amount
        
        db.session.commit()
        
        return {
            'success': True,
            'new_balance': f'${sender_wallet.balance:.2f}',
            'message': f'Successfully sent ${amount:.2f} to {recipient.name}'
        }, 200
        
    except Exception as e:
        db.session.rollback()
        return handle_error(str(e), 500)
