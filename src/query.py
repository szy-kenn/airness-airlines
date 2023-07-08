from flask import Blueprint, render_template, jsonify, request
from . import mysql, app
from shutil import copy
from datetime import datetime

query = Blueprint('query', __name__)

def _debug_bracket():
    return f"[DEBUG {datetime.now().time().strftime('%H:%M:%S')}]"

@query.route('/create-airport-table')
def create_airport_table():

    print(f"{_debug_bracket()} Copying {app.config['REPO_DIR']}/csv/available_airports.csv file to {app.config['MYSQL_DIR']}/Uploads")
    copy(f"{app.config['REPO_DIR']}/csv/available_airports.csv", f"{app.config['MYSQL_DIR']}/Uploads" )
    print(f"{_debug_bracket()} Copied successfully.")

    cursor = mysql.connection.cursor()

    print(f"{_debug_bracket()} Checking for an existing table named 'airport_t'...")
    cursor.execute(''' SHOW TABLES LIKE 'airport_t'; ''')
    tables = cursor.fetchall()
    
    if (len(tables) > 0):
        print(f"{_debug_bracket()} Existing table airport_t found. Dropping the table...")
        cursor.execute(''' DROP TABLE airport_t; ''')
        print(f"{_debug_bracket()} Table dropped successfully.")
    else:
        print(f"{_debug_bracket()} No existing table found. Proceeding to table creation...")

    print(f"{_debug_bracket()} Creating the table...")
    cursor.execute(f'''
                    CREATE TABLE {app.config['MYSQL_DB']}.`airport_t` (
                        `airport_code` CHAR(3) NOT NULL,
                        `name` VARCHAR(100) CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_0900_ai_ci' NULL,
                        `municipality` VARCHAR(50) NULL,
                        `country_code` CHAR(2) NULL,
                        `country_name` VARCHAR(60) NULL,
                        `continent_name` VARCHAR(15) NULL,
                        `continent_code` CHAR(2) NULL,
                        `longitude` VARCHAR(45) NULL,
                        `latitude` VARCHAR(45) NULL,
                        `url` VARCHAR(512) CHARACTER SET 'ascii' COLLATE 'ascii_general_ci',
                        PRIMARY KEY (`airport_code`))
                    ENGINE = InnoDB
                    DEFAULT CHARACTER SET = utf8mb4
                    COLLATE = utf8mb4_0900_ai_ci;
                    ''')
    
    print(f"{_debug_bracket()} Successfully created the airport table")
    
    print(f"{_debug_bracket()} Populating the table with the data from available_airports.csv...")
    cursor.execute('''
                LOAD DATA INFILE "../Uploads/available_airports.csv" IGNORE 
                INTO TABLE airport_t
                FIELDS TERMINATED BY ',' 
                LINES TERMINATED BY '\n';
                    ''')
    
    print(f"{_debug_bracket()} Selecting all rows...")
    cursor.execute('''
                    SELECT *
                    FROM airport_t;   
                    ''')
    mysql.connection.commit()
    print(f"{_debug_bracket()} DONE.")
    return jsonify(cursor.fetchall())

@query.route('/search-airports', methods=['POST'])
def search_airports():
    input = request.get_json()['query']

    cursor = mysql.connection.cursor()
    cursor.execute(f'''
                    SELECT *
                    FROM airport_t 
                    WHERE country_name LIKE '%{input}%'
                        OR municipality LIKE '%{input}%' 
                        OR name LIKE '%{input}%'
                        OR continent_name LIKE '%{input}%' 
                        OR airport_code LIKE '%{input}%'
                    ORDER BY municipality
                    ''')
    returned = cursor.fetchall()
    return jsonify(returned)