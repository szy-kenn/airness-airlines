from flask import Flask
from flask_mysqldb import MySQL
import yaml

# mySQL connection initialization
mysql = MySQL()

def create_app():
    """
    The main function to be called by app.py to create and start the application
    """

    # Flask initialization
    app = Flask(__name__)

    # retrieving db information from 'db.yaml' file
    with open('db.yaml', 'r') as file:
        db = yaml.safe_load(file)

    # ===========| APP CONFIGURATION |=========== #

    app.config['SECRET_KEY'] = 'secret'
    #mySQL server details
    app.config['MYSQL_HOST'] = db['HOST_NAME']
    app.config['MYSQL_USER'] = db['DB_USER']
    app.config['MYSQL_PASSWORD'] = db['DB_PASS']
    app.config['MYSQL_DB'] = db['DB_NAME']

    # initializing the app that will use the mysql
    mysql.init_app(app)

    # ===========| BLUEPRINT REGISTRATION |=========== #
    from .views import view

    app.register_blueprint(view, url_prefix='/')

    return app