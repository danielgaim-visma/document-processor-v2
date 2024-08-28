from app import create_app
from app.config import config

app = create_app(config['production'])  # or whichever config you're using

if __name__ == '__main__':
    app.run()