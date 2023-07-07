from flask import Flask
from flask_mysqldb import MySQL
import yaml

# mySQL connection initialization
mysql = MySQL()

# Flask initialization
app = Flask(__name__)

def create_app():
    """
    The main function to be called by app.py to create and start the application
    """
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
    app.config['MYSQL_DIR'] = db['MYSQL_DIR']
    app.config['REPO_DIR'] = db['REPO_DIR']

    # initializing the app that will use the mysql
    mysql.init_app(app)

    # ===========| BLUEPRINT REGISTRATION |=========== #
    from .views import view
    from .api import api
    from .dev import dev
    from .query import query

    app.register_blueprint(view, url_prefix='/')
    app.register_blueprint(api, url_prefix='/api')
    app.register_blueprint(dev, url_prefix='/dev')
    app.register_blueprint(query, url_prefix='/query')

    return app