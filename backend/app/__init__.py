from flask import Flask
from flask_cors import CORS
from app.models import db
from app.routes.auth import auth_bp
from app.routes.dashboard import dashboard_bp
from app.routes.expenses import expenses_bp
from app.routes.groups import groups_bp
from app.routes.wallet import wallet_bp

def create_app(config_name='development'):
    app = Flask(__name__)
    
    # Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///penny_pals.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = 'your-secret-key-change-in-production'
    
    # Initialize extensions
    db.init_app(app)
    CORS(app, supports_credentials=True)
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api')
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
    """Initialize database - no seed data, starts clean"""
    pass
