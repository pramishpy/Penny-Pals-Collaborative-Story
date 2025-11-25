from flask import Blueprint, request, jsonify, session
from app.models import db, Group, User, group_members
from app.utils.helpers import generate_id, serialize_model, handle_error

groups_bp = Blueprint('groups', __name__)

def get_current_user():
    """Get current logged-in user from session"""
    user_id = session.get('user_id')
    if not user_id:
        return None
    return User.query.get(user_id)

@groups_bp.route('/groups', methods=['GET'])
def get_groups():
    """Get all groups for current user"""
    try:
        user = get_current_user()
        if not user:
            return {'error': 'Not authenticated'}, 401
        
        groups = user.groups
        
        groups_list = []
        total_balance = 0
        
        # Define gradient colors for groups
        gradients = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
        ]
        
        for idx, group in enumerate(groups):
            expenses = group.expenses
            group_amount = sum(exp.amount for exp in expenses) / len(expenses) if expenses else 0
            total_balance += group_amount
            
            groups_list.append({
                'id': group.id,
                'name': group.name,
                'amount': f'${group_amount:.2f}',
                'color': gradients[idx % len(gradients)]
            })
        
        return {
            'groups': groups_list,
            'balance': f'${total_balance:.2f}'
        }, 200
    except Exception as e:
        return handle_error(str(e), 500)

@groups_bp.route('/groups', methods=['POST'])
def add_group():
    """Create new group"""
    try:
        user = get_current_user()
        if not user:
            return {'error': 'Not authenticated'}, 401
        
        data = request.json
        
        if 'name' not in data:
            return handle_error('Group name is required')
        
        group_id = generate_id()
        group = Group(
            id=group_id,
            name=data['name']
        )
        db.session.add(group)
        
        # Add current user to group
        user.groups.append(group)
        
        # Add other members if provided
        if 'members' in data:
            for member_id in data['members']:
                member = User.query.get(member_id)
                if member:
                    group.members.append(member)
        
        db.session.commit()
        
        return {
            'success': True,
            'group': serialize_model(group)
        }, 201
    except Exception as e:
        db.session.rollback()
        return handle_error(str(e), 500)
