import os
import sys

from logging_config import setup_logging
logger = setup_logging()

current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

from app import create_app
from app.config import config

app = create_app(config['production'])

if __name__ == '__main__':
    app.run()