"""RDVPro — Users Routes (stub — expand as needed)"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User
from middleware.auth_middleware import require_role

users_bp = Blueprint("users", __name__)

@users_bp.get("")
@jwt_required()
@require_role("admin")
def list_users():
    page   = request.args.get("page", 1, type=int)
    limit  = request.args.get("limit", 10, type=int)
    search = request.args.get("search", "")
    role   = request.args.get("role")

    query = User.query
    if search:
        query = query.filter(
            (User.first_name.ilike(f"%{search}%")) |
            (User.last_name.ilike(f"%{search}%"))  |
            (User.email.ilike(f"%{search}%"))
        )
    if role:
        query = query.filter_by(role=role)

    paginated = query.order_by(User.created_at.desc()).paginate(page=page, per_page=limit, error_out=False)
    return jsonify({"users": [u.to_dict() for u in paginated.items], "total": paginated.total})


@users_bp.post("")
@jwt_required()
@require_role("admin")
def create_user():
    from services.auth_service import AuthService
    data = request.get_json() or {}
    user, error = AuthService.create_user(data)
    if error:
        return jsonify({"message": error}), 422
    return jsonify({"user": user.to_dict()}), 201


@users_bp.put("/<int:user_id>")
@jwt_required()
@require_role("admin")
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json() or {}
    if "firstName" in data: user.first_name = data["firstName"]
    if "lastName"  in data: user.last_name  = data["lastName"]
    if "phone"     in data: user.phone      = data["phone"]
    if "role"      in data: user.role       = data["role"]
    db.session.commit()
    return jsonify({"user": user.to_dict()})


@users_bp.delete("/<int:user_id>")
@jwt_required()
@require_role("admin")
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    # Soft delete: deactivate instead of hard-deleting to preserve appointment history
    user.is_active = False
    db.session.commit()
    return jsonify({"message": "Utilisateur désactivé"})


@users_bp.patch("/<int:user_id>/toggle-active")
@jwt_required()
@require_role("admin")
def toggle_active(user_id):
    user = User.query.get_or_404(user_id)
    user.is_active = not user.is_active
    db.session.commit()
    return jsonify({"user": user.to_dict()})
