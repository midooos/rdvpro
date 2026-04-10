from app import create_app
from models import db, User
from extensions import bcrypt

app = create_app()

with app.app_context():
    # Generate the actual, correct hash for 'Client123'
    correct_hash = bcrypt.generate_password_hash("Client123".encode("utf-8")).decode("utf-8")
    
    # Find all users who are clients
    clients = User.query.filter_by(role="client").all()
    
    if clients:
        for client in clients:
            client.password_hash = correct_hash
            
        db.session.commit()
        print(f"✅ SUCCESS: Updated {len(clients)} client accounts!")
        print(f"If you want to fix your 001_demo_data.sql file for the future, replace the old hashes with this one:")
        print(correct_hash)
    else:
        print("Error: No client users found in the database.")