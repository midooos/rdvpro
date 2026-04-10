from datetime import datetime, timedelta
from flask import current_app
from flask_mail import Message

from models import db, User, RefreshToken
from extensions import bcrypt

class AuthService:

    @staticmethod
    def create_user(data: dict):
        required = ["firstName", "lastName", "email", "password"]
        for field in required:
            if not data.get(field):
                return None, f"Missing: {field}"

        # Safely encode to bytes before hashing, decode back to string for the DB
        pw_hash = bcrypt.generate_password_hash(
            data["password"].encode("utf-8")
        ).decode("utf-8")

        user = User(
            first_name=data["firstName"].strip(),
            last_name=data["lastName"].strip(),
            email=data["email"].lower().strip(),
            password_hash=pw_hash,
            phone=data.get("phone"),
            role=data.get("role", "client"),
        )

        db.session.add(user)
        db.session.commit()
        return user, None

    @staticmethod
    def check_password(user: User, password: str) -> bool:
        # Force encode strings to bytes so the underlying C-library doesn't crash
        return bcrypt.check_password_hash(
            user.password_hash.encode("utf-8"), 
            password.encode("utf-8")
        )

    @staticmethod
    def set_password(user: User, password: str):
        user.password_hash = bcrypt.generate_password_hash(
            password.encode("utf-8")
        ).decode("utf-8")

    @staticmethod
    def save_refresh_token(user_id: int, token: str):
        rt = RefreshToken(
            user_id=user_id,
            token=token,
            expires_at=datetime.utcnow() + timedelta(days=30),
        )
        db.session.add(rt)
        db.session.commit()

    @staticmethod
    def send_reset_email(user: User, token: str):
        from extensions import mail

        frontend = current_app.config.get("FRONTEND_URL", "http://localhost:3000")
        link = f"{frontend}/reset-password?token={token}"

        msg = Message(
            subject="RDVPro reset password",
            recipients=[user.email],
            html=f"<a href='{link}'>Reset password</a>",
        )

        mail.send(msg)