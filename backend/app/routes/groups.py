from flask import Blueprint, request, jsonify
from app.models import db, Group, User, group_members
from app.utils.helpers import generate_id, serialize_model, handle_error

groups_bp = Blueprint('groups', __name__)

@groups_bp.route('/groups', methods=['GET'])
def get_groups():
    """Get all groups for current user"""
    try:
        user = User.query.first()
        if not user:
            return {'groups': [], 'balance': '$0.00'}, 200
        
        groups = user.groups
        
        groups_list = []
        total_balance = 0
        
        for group in groups:
            expenses = group.expenses
            group_amount = sum(exp.amount for exp in expenses) / len(expenses) if expenses else 0
            total_balance += group_amount
            
            groups_list.append({
                'id': group.id,
                'name': group.name,
                'amount': f'${group_amount:.2f}',
                'color': f'hsl({hash(group.id) % 360}, 70%, 60%)'
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
        data = request.json
        
        if 'name' not in data:
            return handle_error('Group name is required')
        
        user = User.query.first()
        if not user:
            return handle_error('User not found', 404)
        
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
