from flask import Flask
from flask_cors import CORS
from .config import Config
import os
import logging

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    logger.info("Application starting...")
    logger.info(f"Upload folder: {app.config['UPLOAD_FOLDER']}")

    CORS(app, resources={r"/*": {"origins": "*"}})  # Allow all origins on Heroku

    from .routes import main as main_blueprint
    app.register_blueprint(main_blueprint)

    logger.info("Application created and configured")

    return app