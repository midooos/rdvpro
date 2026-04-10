"""
RDVPro — Auth Middleware
"""
from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from models import User


def require_role(*roles):
    """Decorator: restrict route to users with one of the given roles."""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            user_id = int(get_jwt_identity())
            user    = User.query.get(user_id)
            if not user or user.role not in roles:
                return jsonify({"message": "Accès non autorisé"}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator
