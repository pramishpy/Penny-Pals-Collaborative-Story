from flask import Blueprint, request, jsonify
from app.models import db, User, Group, Expense, ExpenseSplit, Wallet
from app.utils.helpers import generate_id, serialize_model, handle_error

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/dashboard', methods=['GET'])
def get_dashboard():
    """Get dashboard summary for current user"""
    try:
        # For demo, using first user. In real app, get from session/auth
        user = User.query.first()
        if not user:
            return {'balance': '$0.00', 'groups': [], 'owed': 0}, 200
        
        # Calculate total balance
        total_owed = 0
        groups_summary = []
        
        # Get all groups user is part of
        user_groups = db.session.query(Group).join(
            db.Table('group_members', 
                db.Column('user_id', db.String), 
                db.Column('group_id', db.String)
            )
        ).filter(Group.id.in_(
            [g.id for g in user.groups]
        )).all()
        
        for group in user_groups:
            group_expenses = Expense.query.filter_by(group_id=group.id).all()
            group_amount = sum(exp.amount for exp in group_expenses) / len(group_expenses) if group_expenses else 0
            total_owed += group_amount
            
            groups_summary.append({
                'id': group.id,
                'name': group.name,
                'amount': f'${group_amount:.2f}'
            })
        
        return {
            'balance': f'${total_owed:.2f}',
            'groups': groups_summary,
            'owed': total_owed
        }, 200
    except Exception as e:
        return handle_error(str(e), 500)
