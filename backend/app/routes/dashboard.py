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
        
        # Define gradient colors for groups
        gradients = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
        ]
        
        # Get all groups user is part of
        user_groups = user.groups
        
        for idx, group in enumerate(user_groups):
            group_expenses = Expense.query.filter_by(group_id=group.id).all()
            group_amount = sum(exp.amount for exp in group_expenses) / len(group_expenses) if group_expenses else 0
            total_owed += group_amount
            
            groups_summary.append({
                'id': group.id,
                'name': group.name,
                'amount': f'${group_amount:.2f}',
                'color': gradients[idx % len(gradients)]
            })
        
        return {
            'balance': f'${total_owed:.2f}',
            'groups': groups_summary,
            'owed': total_owed
        }, 200
    except Exception as e:
        return handle_error(str(e), 500)
