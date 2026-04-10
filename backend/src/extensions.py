from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_mail import Mail

bcrypt = Bcrypt()
jwt = JWTManager()
migrate = Migrate()
mail = Mail()