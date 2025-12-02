import uuid
from datetime import datetime

def generate_id():
    return str(uuid.uuid4())

def serialize_model(model):
    """Convert SQLAlchemy model to dict"""
    result = {}
    for column in model.__table__.columns:
        value = getattr(model, column.name)
        if isinstance(value, datetime):
            result[column.name] = value.isoformat()
        else:
            result[column.name] = value
    return result

def handle_error(message, status_code=400):
    """Standard error response"""
    return {'error': message}, status_code
