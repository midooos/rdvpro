from app import create_app
from models import db, User
from extensions import bcrypt

app = create_app()

with app.app_context():
    admin = User.query.filter_by(email="admin@rdvpro.tn").first()
    if admin:
        # Generate a brand new, correct hash for 'Admin123'
        new_hash = bcrypt.generate_password_hash("Admin123".encode("utf-8")).decode("utf-8")
        admin.password_hash = new_hash
        db.session.commit()
        print(f"SUCCESS: Admin password hash updated to: {new_hash}")
    else:
        print("Error: Admin user not found in the database.")