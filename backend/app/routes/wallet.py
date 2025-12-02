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
        
        # Use single source of truth for balance calculation
        from app.models import calculate_user_balance
        wallet_balance, total_owed_by_others, total_owed_to_others = calculate_user_balance(user.id)
        
        # Calculate total spent
        expenses_paid = Expense.query.filter_by(paid_by=user.id).all()
        total_spent = sum(exp.amount for exp in expenses_paid)
        
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
        
        # Get or create wallet (for metadata like card info)
        wallet = Wallet.query.filter_by(user_id=user.id).first()
        if not wallet:
            wallet_id = generate_id()
            wallet = Wallet(
                id=wallet_id,
                user_id=user.id,
                balance=0.0  # Deprecated - balance is calculated from expenses
            )
            db.session.add(wallet)
        
        # Create an expense to represent the deposit
        # User "paid" this amount, and owes themselves $0 (net gain)
        deposit_expense = Expense(
            id=generate_id(),
            title=f"Wallet deposit",
            amount=amount,
            paid_by=user.id,
            group_id=None
        )
        db.session.add(deposit_expense)
        
        # Add a split for the user with $0 owed (they paid for themselves)
        deposit_split = ExpenseSplit(
            id=generate_id(),
            expense_id=deposit_expense.id,
            user_id=user.id,
            amount=0  # User owes themselves nothing, net gain = amount
        )
        db.session.add(deposit_split)
        
        db.session.commit()
        
        # Get calculated balance
        from app.models import calculate_user_balance
        current_balance, _, _ = calculate_user_balance(user.id)
        
        return {
            'success': True,
            'balance': f'${current_balance:.2f}',
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
        
        # Check if sender has sufficient balance (calculated from expenses)
        from app.models import calculate_user_balance
        sender_balance, _, _ = calculate_user_balance(user.id)
        
        if sender_balance < amount:
            return handle_error(
                f'Insufficient funds. Your current balance is ${sender_balance:.2f}, but you are trying to pay ${amount:.2f}',
                400
            )
        
        # Get or create sender's wallet (for card info, not balance)
        sender_wallet = Wallet.query.filter_by(user_id=user.id).first()
        if not sender_wallet:
            sender_wallet = Wallet(
                id=generate_id(),
                user_id=user.id,
                balance=0.0  # Deprecated field
            )
            db.session.add(sender_wallet)
        
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
        
        # Note: We don't modify wallet.balance anymore - balance is calculated from expenses
        # The wallet.balance field is now deprecated in favor of calculated balance
        
        # Create an offsetting expense to settle debts
        # When User A (sender) pays User B (recipient), we want to reduce what A owes to B.
        # In our system:
        # - If B paid an expense and A has a split, then A owes B
        # - To settle this debt, we create an expense paid by B with A in the split
        # This way: A's owed amount to B decreases because now B "paid" and A "owes" for this payment
        # 
        # Actually, the correct way is:
        # - Create expense paid by SENDER with SENDER in the split (sender pays for themselves)
        # - This increases what sender has paid
        # - Also add RECIPIENT to the split for $0 or create a separate mechanism
        # 
        # Better approach: Create expense paid by RECIPIENT with SENDER in split
        # This simulates: Recipient paid for something, Sender owes that amount
        # When we calculate net: Sender's debt to Recipient increases... No wait.
        # 
        # Let's think clearly:
        # If A owes B $50, and A pays B $30:
        # - Before: B paid $50, A has split of $50 → A owes B $50
        # - After payment: We need A to owe B only $20
        # - Solution: Create expense "paid by A" with "A in split for $30"
        #   This increases "A paid $30" and "A owes $30 (to themselves, net 0)"
        #   But we need B to benefit. Add B to split for $30.
        #   Then: A paid $30, B owes A $30 → reduces net debt by $30 ✓
        
        payment_expense = Expense(
            id=generate_id(),
            title=f"Payment from {user.name}",
            amount=amount,
            paid_by=user.id,  # Sender paid
            group_id=None  # Direct payment, not linked to a group
        )
        db.session.add(payment_expense)
        
        # Add split for sender (they paid for themselves - $0 net)
        sender_split = ExpenseSplit(
            id=generate_id(),
            expense_id=payment_expense.id,
            user_id=user.id,
            amount=0  # Sender's share is 0 (they paid full amount for recipient)
        )
        db.session.add(sender_split)
        
        # Add split for recipient (they owe this amount to sender)
        recipient_split = ExpenseSplit(
            id=generate_id(),
            expense_id=payment_expense.id,
            user_id=recipient.id,
            amount=amount  # Recipient owes this amount
        )
        db.session.add(recipient_split)
        
        # Create notification for recipient
        from app.models import Notification
        notification = Notification(
            id=generate_id(),
            user_id=recipient.id,
            message=f"{user.name} sent you ${amount:.2f}",
            type='success'
        )
        db.session.add(notification)
        
        db.session.commit()
        
        # Get updated calculated balance
        new_balance, _, _ = calculate_user_balance(user.id)
        
        return {
            'success': True,
            'new_balance': f'${new_balance:.2f}',
            'message': f'Successfully sent ${amount:.2f} to {recipient.name}'
        }, 200
        
    except Exception as e:
        db.session.rollback()
        return handle_error(str(e), 500)
