from app import create_app
from app.config import config

app = create_app(config['production'])  # Use production config on Heroku

if __name__ == '__main__':
    app.run()