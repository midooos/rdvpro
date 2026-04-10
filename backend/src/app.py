from flask import Flask
from flask_cors import CORS

from config.settings import Config
from models import db
from extensions import bcrypt, jwt, migrate, mail

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Init extensions
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    mail.init_app(app)
    
    CORS(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})

    # Register blueprints
    from routes.auth          import auth_bp
    from routes.appointments  import appointments_bp
    from routes.notifications import notifications_bp
    from routes.users         import users_bp
    from routes.slots         import slots_bp

    app.register_blueprint(auth_bp,          url_prefix="/api/auth")
    app.register_blueprint(appointments_bp,  url_prefix="/api/appointments")
    app.register_blueprint(notifications_bp, url_prefix="/api/notifications")
    app.register_blueprint(users_bp,         url_prefix="/api/users")
    app.register_blueprint(slots_bp,         url_prefix="/api/slots")

    # Health check
    @app.get("/api/health")
    def health():
        return {"status": "ok", "app": "RDVPro API", "version": "1.0.0"}

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, host="0.0.0.0", port=5000)