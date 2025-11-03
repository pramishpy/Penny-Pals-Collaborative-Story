from flask import Blueprint, request, jsonify
from app.models import db, Expense, ExpenseSplit, User
from app.utils.helpers import generate_id, serialize_model, handle_error

expenses_bp = Blueprint('expenses', __name__)

@expenses_bp.route('/expenses', methods=['GET'])
def get_expenses():
    """Get all expenses for current user"""
    try:
        user = User.query.first()
        if not user:
            return {'transactions': []}, 200
        
        # Get expenses paid by user or user is part of
        expenses = Expense.query.filter(
            (Expense.paid_by == user.id) |
            (Expense.splits.any(ExpenseSplit.user_id == user.id))
        ).all()
        
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

@expenses_bp.route('/expenses', methods=['POST'])
def add_expense():
    """Add new expense"""
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['title', 'amount', 'participants']
        if not all(field in data for field in required_fields):
            return handle_error('Missing required fields')
        
        user = User.query.first()
        if not user:
            return handle_error('User not found', 404)
        
        # Create expense
        expense_id = generate_id()
        expense = Expense(
            id=expense_id,
            title=data['title'],
            amount=float(data['amount']),
            paid_by=user.id,
            group_id=data.get('group_id')
        )
        db.session.add(expense)
        
        # Create splits for participants
        for participant in data['participants']:
            split_id = generate_id()
            split = ExpenseSplit(
                id=split_id,
                expense_id=expense_id,
                user_id=participant['user_id'],
                amount=float(participant['amount'])
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
