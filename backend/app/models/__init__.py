from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

# Many-to-many association table
group_members = db.Table('group_members',
    db.Column('user_id', db.String(36), db.ForeignKey('users.id'), primary_key=True),
    db.Column('group_id', db.String(36), db.ForeignKey('groups.id'), primary_key=True),
    extend_existing=True
)

class User(db.Model):
    __tablename__ = 'users'
    __table_args__ = {'extend_existing': True}
    
    id = db.Column(db.String(36), primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    expenses = db.relationship('Expense', backref='user', lazy=True)
    groups = db.relationship('Group', secondary=group_members, backref='members')

class Group(db.Model):
    __tablename__ = 'groups'
    __table_args__ = {'extend_existing': True}
    
    id = db.Column(db.String(36), primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    expenses = db.relationship('Expense', backref='group', lazy=True, cascade='all, delete-orphan')

class Expense(db.Model):
    __tablename__ = 'expenses'
    __table_args__ = {'extend_existing': True}
    
    id = db.Column(db.String(36), primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    paid_by = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    group_id = db.Column(db.String(36), db.ForeignKey('groups.id'), nullable=True)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    splits = db.relationship('ExpenseSplit', backref='expense', lazy=True, cascade='all, delete-orphan')

class ExpenseSplit(db.Model):
    __tablename__ = 'expense_splits'
    __table_args__ = {'extend_existing': True}
    
    id = db.Column(db.String(36), primary_key=True)
    expense_id = db.Column(db.String(36), db.ForeignKey('expenses.id'), nullable=False)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    
    user = db.relationship('User', backref='splits')

class Wallet(db.Model):
    __tablename__ = 'wallets'
    __table_args__ = {'extend_existing': True}
    
    id = db.Column(db.String(36), primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), unique=True, nullable=False)
    balance = db.Column(db.Float, default=0.0)
    
    user = db.relationship('User', backref='wallet', uselist=False)
