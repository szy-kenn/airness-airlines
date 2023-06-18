from flask import Flask
from celery import Celery
from flask_mysqldb import MySQL
import yaml

# mySQL connection initialization
mysql = MySQL()

# Flask initialization
app = Flask(__name__)

# initializing celery
celery = Celery(app.name, broker='redis://localhost:6379/0')

def create_app():
    """
    The main function to be called by app.py to create and start the application
    """
    # retrieving db information from 'db.yaml' file
    with open('db.yaml', 'r') as file:
        db = yaml.safe_load(file)

    # ===========| APP CONFIGURATION |=========== #

    app.config['SECRET_KEY'] = 'secret'

    # celery config
    app.config['CELERY_BROKER_URL'] = 'redis://localhost:6379/0'
    app.config['CELERY_RESULT_BACKEND'] = 'redis://localhost:6379/0'

    # mySQL server config
    app.config['MYSQL_HOST'] = db['HOST_NAME']
    app.config['MYSQL_USER'] = db['DB_USER']
    app.config['MYSQL_PASSWORD'] = db['DB_PASS']
    app.config['MYSQL_DB'] = db['DB_NAME']

    celery.conf.update(app.config)

    # initializing the app that will use the mysql
    mysql.init_app(app)

    # ===========| BLUEPRINT REGISTRATION |=========== #
    from .views import view
    from .api import api

    app.register_blueprint(view, url_prefix='/')
    app.register_blueprint(api, url_prefix='/api')

    return app