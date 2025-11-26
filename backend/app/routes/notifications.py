from flask import Blueprint, request, jsonify, session
from app import db
from app.models import Notification, User
from app.utils.helpers import generate_id, handle_error, serialize_model

notifications_bp = Blueprint('notifications', __name__)

def get_current_user():
    """Get current logged-in user from session"""
    user_id = session.get('user_id')
    if not user_id:
        return None
    return User.query.get(user_id)

@notifications_bp.route('/notifications', methods=['GET'])
def get_notifications():
    """Get user's notifications"""
    try:
        user = get_current_user()
        if not user:
            return {'error': 'Not authenticated'}, 401
            
        notifications = Notification.query.filter_by(user_id=user.id).order_by(Notification.created_at.desc()).limit(50).all()
        
        return {
            'success': True,
            'notifications': [serialize_model(n) for n in notifications]
        }
    except Exception as e:
        return handle_error(str(e), 500)

@notifications_bp.route('/notifications/<notification_id>/read', methods=['POST'])
def mark_read(notification_id):
    """Mark notification as read"""
    try:
        user = get_current_user()
        if not user:
            return {'error': 'Not authenticated'}, 401
            
        notification = Notification.query.filter_by(id=notification_id, user_id=user.id).first()
        if not notification:
            return handle_error('Notification not found', 404)
            
        notification.read = True
        db.session.commit()
        
        return {'success': True}
    except Exception as e:
        db.session.rollback()
        return handle_error(str(e), 500)

def create_notification(user_id, message, type='info'):
    """Helper to create a notification"""
    try:
        notification = Notification(
            id=generate_id(),
            user_id=user_id,
            message=message,
            type=type
        )
        db.session.add(notification)
        db.session.commit()
        return notification
    except Exception as e:
        print(f"Failed to create notification: {e}")
        return None
