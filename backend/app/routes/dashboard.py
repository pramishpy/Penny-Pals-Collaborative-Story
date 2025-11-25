from flask import Blueprint, request, jsonify, session
from app.models import db, User, Group, Expense, ExpenseSplit, Wallet
from app.utils.helpers import generate_id, serialize_model, handle_error

dashboard_bp = Blueprint('dashboard', __name__)

def get_current_user():
    """Get current logged-in user from session"""
    user_id = session.get('user_id')
    if not user_id:
        return None
    return User.query.get(user_id)

@dashboard_bp.route('/dashboard', methods=['GET'])
def get_dashboard():
    """Get dashboard summary for current user"""
    try:
        user = get_current_user()
        if not user:
            return {'error': 'Not authenticated'}, 401
        
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
            # Get user's total splits in this group (per-user amount, not total expense)
            user_splits = ExpenseSplit.query.filter(
                ExpenseSplit.user_id == user.id,
                Expense.group_id == group.id
            ).join(Expense).all()
            
            group_amount = sum(split.amount for split in user_splits)
            total_owed += group_amount
            
            groups_summary.append({
                'id': group.id,
                'name': group.name,
                'amount': f'${group_amount:.2f}',
                'color': gradients[idx % len(gradients)],
                'members': [
                    {'id': m.id, 'username': m.username, 'name': m.name}
                    for m in group.members
                ]
            })
        
        return {
            'user': user.username,
            'balance': f'${total_owed:.2f}',
            'groups': groups_summary,
            'owed': total_owed
        }, 200
    except Exception as e:
        return handle_error(str(e), 500)
