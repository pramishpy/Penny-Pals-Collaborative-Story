from flask import Blueprint, request, jsonify, session
from app.models import db, Group, User, group_members, Expense, ExpenseSplit
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
            # Get user's total splits in this group (per-user amount, not total expense)
            user_splits = ExpenseSplit.query.filter(
                ExpenseSplit.user_id == user.id,
                Expense.group_id == group.id
            ).join(Expense).all()
            
            group_amount = sum(split.amount for split in user_splits)
            total_balance += group_amount
            
            groups_list.append({
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
        group.members.append(user)
        
        db.session.commit()
        
        return {
            'success': True,
            'group': serialize_model(group)
        }, 201
    except Exception as e:
        db.session.rollback()
        return handle_error(str(e), 500)

@groups_bp.route('/groups/<group_id>/members', methods=['POST'])
def add_members_to_group(group_id):
    """Add members to an existing group"""
    try:
        user = get_current_user()
        if not user:
            return {'error': 'Not authenticated'}, 401
        
        group = Group.query.get(group_id)
        if not group:
            return handle_error('Group not found', 404)
        
        # Check if user is in the group (can only add if you're a member)
        if user not in group.members:
            return handle_error('You are not a member of this group', 403)
        
        data = request.json
        if 'member_ids' not in data:
            return handle_error('member_ids list is required')
        
        member_ids = data['member_ids']
        added_members = []
        
        for member_id in member_ids:
            member = User.query.get(member_id)
            if member and member not in group.members:
                group.members.append(member)
                added_members.append({
                    'id': member.id,
                    'username': member.username,
                    'name': member.name
                })
        
        db.session.commit()
        
        return {
            'success': True,
            'added_members': added_members,
            'group': {
                'id': group.id,
                'name': group.name,
                'members': [
                    {'id': m.id, 'username': m.username, 'name': m.name}
                    for m in group.members
                ]
            }
        }, 200
    except Exception as e:
        db.session.rollback()
        return handle_error(str(e), 500)
