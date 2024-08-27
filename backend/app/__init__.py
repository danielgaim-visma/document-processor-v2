from flask import Flask
from flask_cors import CORS
from .config import Config
import os
import logging

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Ensure the UPLOAD_FOLDER exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Configure logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    logger.info("Application starting...")

    CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

    from .routes import main as main_blueprint
    app.register_blueprint(main_blueprint)

    logger.info("Application created and configured")

    return app