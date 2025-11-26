import sqlite3
from flask import Blueprint, request, jsonify, session
from app.models import db, User
from app.utils.helpers import generate_id, handle_error

from sqlite3 import OperationalError

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/auth/register", methods=["POST"])
def register():
    """Register a new user"""
    try:
        data = request.get_json()

        # Validate input
        if not data or not all(
            k in data for k in ["username", "email", "password", "name"]
        ):
            return {
                "error": "Missing required fields: username, email, password, name"
            }, 400

        username = data.get("username", "").strip()
        email = data.get("email", "").strip()
        password = data.get("password", "").strip()
        name = data.get("name", "").strip()
        currency = data.get("currency", "USD").strip()

        # Validate fields
        if not username or len(username) < 3:
            return {"error": "Username must be at least 3 characters"}, 400
        if not email or "@" not in email:
            return {"error": "Invalid email format"}, 400
        if not password or len(password) < 6:
            return {"error": "Password must be at least 6 characters"}, 400
        if not name:
            return {"error": "Name is required"}, 400

        # Check if user already exists
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            return {"error": "Username already exists"}, 409

        existing_email = User.query.filter_by(email=email).first()
        if existing_email:
            return {"error": "Email already exists"}, 409

        # Create new user
        new_user = User(
            id=generate_id(),
            username=username,
            email=email,
            name=name,
            currency=currency,
        )
        new_user.set_password(password)

        db.session.add(new_user)
        db.session.commit()

        # Set session
        session["user_id"] = new_user.id
        session["username"] = new_user.username

        return {
            "message": "User registered successfully",
            "user": {
                "id": new_user.id,
                "username": new_user.username,
                "email": new_user.email,
                "name": new_user.name,
                "currency": new_user.currency,
            },
        }, 201

    except Exception as e:
        db.session.rollback()
        return handle_error(str(e), 500)


@auth_bp.route("/auth/login", methods=["POST"])
def login():
    """Login user"""
    try:
        data = request.get_json()

        # Validate input
        if not data or not all(k in data for k in ["username", "password"]):
            return {"error": "Missing required fields: username, password"}, 400

        username = data.get("username", "").strip()
        password = data.get("password", "").strip()

        # Find user
        user = User.query.filter_by(username=username).first()
        if not user or not user.check_password(password):
            return {"error": "Invalid username or password"}, 401

        # Set session
        session["user_id"] = user.id
        session["username"] = user.username

        return {
            "message": "Login successful",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "name": user.name,
            },
        }, 200

    except Exception as e:
        return {"error": "Invalid username or password"}, 401


@auth_bp.route("/auth/logout", methods=["POST"])
def logout():
    """Logout user"""
    try:
        session.clear()
        return {"message": "Logout successful"}, 200
    except Exception as e:
        return handle_error(str(e), 500)


@auth_bp.route("/auth/current-user", methods=["GET"])
def get_current_user():
    """Get current logged-in user"""
    try:
        user_id = session.get("user_id")
        if not user_id:
            return {"error": "Not authenticated"}, 401

        user = User.query.get(user_id)
        if not user:
            session.clear()
            return {"error": "User not found"}, 404

        return {
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "name": user.name,
            }
        }, 200

    except Exception as e:
        return handle_error(str(e), 500)


@auth_bp.route("/auth/users", methods=["GET"])
def get_all_users():
    """Get all users (for adding to groups/splits)"""
    try:
        users = User.query.all()
        return {
            "users": [
                {
                    "id": user.id,
                    "username": user.username,
                    "name": user.name,
                    "email": user.email,
                }
                for user in users
            ]
        }, 200
    except Exception as e:
        return handle_error(str(e), 500)
