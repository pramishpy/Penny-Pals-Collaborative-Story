from flask import Flask
from flask_cors import CORS
from app.models import db
from app.routes.dashboard import dashboard_bp
from app.routes.expenses import expenses_bp
from app.routes.groups import groups_bp
from app.routes.wallet import wallet_bp

def create_app(config_name='development'):
    app = Flask(__name__)
    
    # Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///penny_pals.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize extensions
    db.init_app(app)
    CORS(app)
    
    # Register blueprints
    app.register_blueprint(dashboard_bp, url_prefix='/api')
    app.register_blueprint(expenses_bp, url_prefix='/api')
    app.register_blueprint(groups_bp, url_prefix='/api')
    app.register_blueprint(wallet_bp, url_prefix='/api')
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Not found'}, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return {'error': 'Internal server error'}, 500
    
    # Create tables and seed data
    with app.app_context():
        db.create_all()
        init_db()
    
    return app

def init_db():
    """Initialize database with seed data"""
    from app.models import User, Group, Wallet, Expense, ExpenseSplit
    from app.utils.helpers import generate_id
    from datetime import datetime, timedelta
    
    # Check if data already exists
    if User.query.first():
        return
    
    # Create sample users
    user1 = User(
        id=generate_id(),
        name='John Doe',
        email='john@example.com'
    )
    user2 = User(
        id=generate_id(),
        name='Alex Smith',
        email='alex@example.com'
    )
    user3 = User(
        id=generate_id(),
        name='Sam Johnson',
        email='sam@example.com'
    )
    
    db.session.add_all([user1, user2, user3])
    db.session.commit()
    
    # Create sample group
    group1 = Group(
        id=generate_id(),
        name='Trip to Miami'
    )
    group1.members.append(user1)
    group1.members.append(user2)
    
    db.session.add(group1)
    db.session.commit()
    
    # Create sample wallet
    wallet1 = Wallet(
        id=generate_id(),
        user_id=user1.id,
        balance=89.27
    )
    db.session.add(wallet1)
    db.session.commit()
    
    # Create sample expenses
    expense1_id = generate_id()
    expense1 = Expense(
        id=expense1_id,
        title='Weekend Groceries',
        amount=85.50,
        paid_by=user1.id,
        group_id=group1.id,
        date=datetime.utcnow() - timedelta(days=2)
    )
    db.session.add(expense1)
    
    # Add splits for expense1
    split1 = ExpenseSplit(
        id=generate_id(),
        expense_id=expense1_id,
        user_id=user1.id,
        amount=42.75
    )
    split2 = ExpenseSplit(
        id=generate_id(),
        expense_id=expense1_id,
        user_id=user2.id,
        amount=42.75
    )
    db.session.add_all([split1, split2])
    
    expense2_id = generate_id()
    expense2 = Expense(
        id=expense2_id,
        title='Dinner at the Bistro Cafe',
        amount=60.50,
        paid_by=user2.id,
        group_id=group1.id,
        date=datetime.utcnow() - timedelta(days=1)
    )
    db.session.add(expense2)
    
    # Add splits for expense2
    split3 = ExpenseSplit(
        id=generate_id(),
        expense_id=expense2_id,
        user_id=user1.id,
        amount=30.25
    )
    split4 = ExpenseSplit(
        id=generate_id(),
        expense_id=expense2_id,
        user_id=user2.id,
        amount=30.25
    )
    db.session.add_all([split3, split4])
    
    db.session.commit()
