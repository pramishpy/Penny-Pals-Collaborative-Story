from flask import Blueprint, request, jsonify, session
from app.models import db, Expense, ExpenseSplit, User, Group
from app.utils.helpers import generate_id, serialize_model, handle_error

expenses_bp = Blueprint('expenses', __name__)

def get_current_user():
    """Get current logged-in user from session"""
    user_id = session.get('user_id')
    if not user_id:
        return None
    return User.query.get(user_id)

@expenses_bp.route('/expenses', methods=['GET'])
def get_expenses():
    """Get all expenses for current user"""
    try:
        user = get_current_user()
        if not user:
            return {'error': 'Not authenticated'}, 401
        
        # Icon mapping based on keywords
        def get_icon(title):
            title_lower = title.lower()
            if any(word in title_lower for word in ['grocery', 'groceries', 'food', 'supermarket']):
                return '🛒'
            elif any(word in title_lower for word in ['dinner', 'lunch', 'restaurant', 'cafe', 'bistro']):
                return '🍽️'
            elif any(word in title_lower for word in ['movie', 'cinema', 'tickets']):
                return '🎬'
            elif any(word in title_lower for word in ['coffee', 'cafe', 'starbucks']):
                return '☕'
            elif any(word in title_lower for word in ['internet', 'wifi', 'broadband']):
                return '🌐'
            elif any(word in title_lower for word in ['gas', 'fuel', 'petrol']):
                return '⛽'
            elif any(word in title_lower for word in ['uber', 'taxi', 'transport']):
                return '🚗'
            else:
                return '💰'
        
        # Get expenses paid by user or user is part of
        expenses = Expense.query.filter(
            (Expense.paid_by == user.id) |
            (Expense.splits.any(ExpenseSplit.user_id == user.id))
        ).order_by(Expense.date.desc()).all()
        
        transactions = []
        for expense in expenses:
            # Find user's share
            user_split = ExpenseSplit.query.filter_by(
                expense_id=expense.id,
                user_id=user.id
            ).first()
            
            paid_by_user = User.query.get(expense.paid_by)
            is_owed = expense.paid_by != user.id
            
            transactions.append({
                'id': expense.id,
                'icon': get_icon(expense.title),
                'title': expense.title,
                'paidBy': paid_by_user.name if paid_by_user else 'Unknown',
                'amount': f'${expense.amount:.2f}',
                'owedAmount': f'${user_split.amount:.2f}' if user_split else '$0.00',
                'isOwed': is_owed,
                'date': expense.date.isoformat() if expense.date else '',
            })
        
        return {'transactions': transactions}, 200
    except Exception as e:
        return handle_error(str(e), 500)

@expenses_bp.route('/transactions', methods=['GET'])
def get_transactions():
    """Get all transactions (alias for expenses)"""
    return get_expenses()

@expenses_bp.route('/expenses', methods=['POST'])
def add_expense():
    """Add new expense"""
    try:
        user = get_current_user()
        if not user:
            return {'error': 'Not authenticated'}, 401
        
        data = request.json
        
        # Validate required fields
        required_fields = ['title', 'amount']
        if not all(field in data for field in required_fields):
            return handle_error('Missing required fields')
        
        group_id = data.get('group_id')
        amount = float(data['amount'])
        
        # Determine participants
        participants = []
        if group_id:
            # Get all members of the group
            group = db.session.query(Group).filter_by(id=group_id).first()
            if group and group.members:
                participants = group.members
            else:
                # Fallback to current user and one other user
                all_users = User.query.filter(User.id != user.id).limit(1).all()
                participants = [user] + all_users
        else:
            # No group specified, split with current user and one other
            all_users = User.query.filter(User.id != user.id).limit(1).all()
            participants = [user] + all_users
        
        if not participants:
            participants = [user]
        
        # Create expense
        expense_id = generate_id()
        expense = Expense(
            id=expense_id,
            title=data['title'],
            amount=amount,
            paid_by=user.id,
            group_id=group_id
        )
        db.session.add(expense)
        
        # Create splits - divide equally among participants
        split_amount = amount / len(participants)
        for participant in participants:
            split_id = generate_id()
            split = ExpenseSplit(
                id=split_id,
                expense_id=expense_id,
                user_id=participant.id,
                amount=split_amount
            )
            db.session.add(split)
        
        db.session.commit()
        
        return {
            'success': True,
            'expense': serialize_model(expense)
        }, 201
    except Exception as e:
        db.session.rollback()
        return handle_error(str(e), 500)
