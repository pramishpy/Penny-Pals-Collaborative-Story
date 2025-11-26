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
        
        # Get all expenses where user is a participant (has a split) from groups they're in
        user_group_ids = [g.id for g in user.groups]
        
        # Get all expenses from user's groups, ordered by date
        expenses = Expense.query.filter(
            Expense.group_id.in_(user_group_ids)
        ).order_by(Expense.date.desc()).all()
        
        transactions = []
        for expense in expenses:
            # Find user's share - user only sees expenses they're part of
            user_split = ExpenseSplit.query.filter_by(
                expense_id=expense.id,
                user_id=user.id
            ).first()
            
            # Only include if user has a split in this expense
            if user_split:
                paid_by_user = User.query.get(expense.paid_by)
                is_owed = expense.paid_by != user.id
                
                transactions.append({
                    'id': expense.id,
                    'icon': get_icon(expense.title),
                    'title': expense.title,
                    'paidBy': paid_by_user.name if paid_by_user else 'Unknown',
                    'amount': f'${expense.amount:.2f}',
                    'owedAmount': f'${user_split.amount:.2f}',
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
        if 'participants' in data and data['participants']:
            # Use explicitly selected participants
            participant_ids = data['participants']
            for pid in participant_ids:
                p = User.query.get(pid)
                if p:
                    participants.append(p)
        elif group_id:
            # Get all members of the group
            group = Group.query.filter_by(id=group_id).first()
            if not group:
                return handle_error('Group not found', 404)
            if user not in group.members:
                return handle_error('You are not a member of this group', 403)
            participants = group.members
        else:
            return handle_error('Either group_id or participants list is required', 400)
        
        if not participants:
            return handle_error('No participants for this expense', 400)
        
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
