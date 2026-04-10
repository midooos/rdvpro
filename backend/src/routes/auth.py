
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity, get_jwt
)
from datetime import datetime, timedelta
import secrets

from models import db, User, RefreshToken, PasswordResetToken
from services.auth_service import AuthService
from middleware.auth_middleware import require_role

auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/register")
def register():
    data = request.get_json()
    if not data:
        return jsonify({"message": "Données manquantes"}), 400

    # Check duplicate email
    if User.query.filter_by(email=data.get("email", "").lower()).first():
        return jsonify({"message": "Cet e-mail est déjà utilisé"}), 409

    user, error = AuthService.create_user(data)
    if error:
        return jsonify({"message": error}), 422

    # Send welcome notification
    from services.notification_service import NotificationService
    NotificationService.notify_welcome(user)

    access_token  = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    AuthService.save_refresh_token(user.id, refresh_token)
    return jsonify({
        "user":         user.to_dict(),
        "token":        access_token,
        "refreshToken": refresh_token,
    }), 201


@auth_bp.post("/login")
def login():
    data = request.get_json()
    email    = data.get("email", "").lower().strip()
    password = data.get("password", "")

    print(f"\n========== DEBUG LOGIN ==========")
    print(f"1. Email received: '{email}'")
    print(f"2. Password received: '{password}'")

    user = User.query.filter_by(email=email).first()
    
    if not user:
        print("3. ERROR: User NOT FOUND in database!")
        print("=================================\n")
        return jsonify({"message": "Identifiants incorrects"}), 401

    print(f"3. User FOUND! ID: {user.id}")
    print(f"4. DB Password Hash: {user.password_hash}")
    
    try:
        from extensions import bcrypt
        # We test the check explicitly here to catch any silent errors
        is_valid = bcrypt.check_password_hash(user.password_hash, password)
        print(f"5. Bcrypt check returned: {is_valid}")
    except Exception as e:
        print(f"5. BCRYPT CRASHED WITH ERROR: {str(e)}")
        is_valid = False

    if not is_valid:
        print("6. ERROR: Password check failed!")
        print("=================================\n")
        return jsonify({"message": "Identifiants incorrects"}), 401

    if not user.is_active:
        print("6. ERROR: User is inactive!")
        print("=================================\n")
        return jsonify({"message": "Compte désactivé."}), 403

    print("6. SUCCESS: Passwords match, generating token!")
    print("=================================\n")
    
    # Generate tokens
    from flask_jwt_extended import create_access_token, create_refresh_token
    from services.auth_service import AuthService
    
    access_token  = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    AuthService.save_refresh_token(user.id, refresh_token)

    return jsonify({
        "user":         user.to_dict(),
        "token":        access_token,
        "refreshToken": refresh_token,
    })

@auth_bp.post("/logout")
@jwt_required()
def logout():
    data = request.get_json() or {}
    refresh_token_val = data.get("refreshToken")
    if refresh_token_val:
        token = RefreshToken.query.filter_by(token=refresh_token_val).first()
        if token:
            token.revoked = True
            db.session.commit()
    return jsonify({"message": "Déconnexion réussie"})


@auth_bp.post("/refresh")
def refresh():
    data = request.get_json() or {}
    token_val = data.get("refreshToken")
    if not token_val:
        return jsonify({"message": "Refresh token manquant"}), 400

    token = RefreshToken.query.filter_by(token=token_val, revoked=False).first()
    if not token or token.expires_at < datetime.utcnow():
        return jsonify({"message": "Token invalide ou expiré"}), 401

    new_access = create_access_token(identity=str(token.user_id))
    return jsonify({"token": new_access})


@auth_bp.get("/me")
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    return jsonify({"user": user.to_dict()})


@auth_bp.put("/profile")
@jwt_required()
def update_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    data = request.get_json() or {}

    if "firstName" in data: user.first_name = data["firstName"].strip()
    if "lastName"  in data: user.last_name  = data["lastName"].strip()
    if "phone"     in data: user.phone       = data["phone"].strip()

    db.session.commit()
    return jsonify({"user": user.to_dict()})


@auth_bp.put("/change-password")
@jwt_required()
def change_password():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    data = request.get_json() or {}

    if not AuthService.check_password(user, data.get("currentPassword", "")):
        return jsonify({"message": "Mot de passe actuel incorrect"}), 401

    AuthService.set_password(user, data.get("newPassword", ""))
    db.session.commit()
    return jsonify({"message": "Mot de passe modifié"})


@auth_bp.post("/forgot-password")
def forgot_password():
    data  = request.get_json() or {}
    email = data.get("email", "").lower().strip()
    user  = User.query.filter_by(email=email).first()

    if user:
        token_val  = secrets.token_urlsafe(48)
        expires_at = datetime.utcnow() + timedelta(hours=2)
        token = PasswordResetToken(user_id=user.id, token=token_val, expires_at=expires_at)
        db.session.add(token)
        db.session.commit()
        AuthService.send_reset_email(user, token_val)

    # Always return 200 to avoid email enumeration
    return jsonify({"message": "Si l'adresse existe, un e-mail a été envoyé."})


@auth_bp.post("/reset-password")
def reset_password():
    data  = request.get_json() or {}
    token_val = data.get("token")
    password  = data.get("password")

    token = PasswordResetToken.query.filter_by(token=token_val, used=False).first()
    if not token or token.expires_at < datetime.utcnow():
        return jsonify({"message": "Lien invalide ou expiré"}), 400

    AuthService.set_password(token.user, password)
    token.used = True
    db.session.commit()
    return jsonify({"message": "Mot de passe réinitialisé"})


@auth_bp.post("/verify-email")
def verify_email():
    # Placeholder — extend with EmailVerificationToken model
    return jsonify({"message": "E-mail vérifié"})


@auth_bp.post("/resend-verification")
@jwt_required()
def resend_verification():
    return jsonify({"message": "E-mail de vérification renvoyé"})
