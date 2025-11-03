from flask import Blueprint, request, jsonify
from app.models import db, Wallet, User
from app.utils.helpers import generate_id, serialize_model, handle_error

wallet_bp = Blueprint('wallet', __name__)

@wallet_bp.route('/wallet', methods=['GET'])
def get_wallet():
    """Get wallet information"""
    try:
        user = User.query.first()
        if not user:
            return {'balance': '$0.00', 'card_last_four': '0000'}, 200
        
        wallet = Wallet.query.filter_by(user_id=user.id).first()
        if not wallet:
            return {'balance': '$0.00', 'card_last_four': '3456'}, 200
        
        return {
            'balance': f'${wallet.balance:.2f}',
            'card_last_four': '3456',
            'user_id': user.id
        }, 200
    except Exception as e:
        return handle_error(str(e), 500)

@wallet_bp.route('/wallet/load', methods=['POST'])
def load_balance():
    """Load balance to wallet"""
    try:
        data = request.json
        
        if 'amount' not in data:
            return handle_error('Amount is required')
        
        user = User.query.first()
        if not user:
            return handle_error('User not found', 404)
        
        amount = float(data['amount'])
        if amount <= 0:
            return handle_error('Amount must be greater than 0')
        
        wallet = Wallet.query.filter_by(user_id=user.id).first()
        if not wallet:
            wallet_id = generate_id()
            wallet = Wallet(
                id=wallet_id,
                user_id=user.id,
                balance=amount
            )
            db.session.add(wallet)
        else:
            wallet.balance += amount
        
        db.session.commit()
        
        return {
            'success': True,
            'balance': f'${wallet.balance:.2f}'
        }, 200
    except Exception as e:
        db.session.rollback()
        return handle_error(str(e), 500)
