from flask import Flask
from flask_cors import CORS
from .config import Config


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

    from .routes import main as main_blueprint
    app.register_blueprint(main_blueprint)

    return app