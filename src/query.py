from flask import Blueprint, render_template, jsonify, request
from . import mysql, app
from shutil import copy
from datetime import datetime
import string
import random
import json

query = Blueprint('query', __name__)

def _debug_bracket():
    return f"[DEBUG {datetime.now().time().strftime('%H:%M:%S')}]"

def primary_key(first_char):
    n = 3
    res = ''.join(random.choices(string.ascii_uppercase +
                                 string.digits, k=n))
    return first_char + res

def create_table(table_name: str, create_table_query: str, csv_filename: str = None, clear_if_exists: bool = True):
    
    responses = []

    if (csv_filename != None):
        response = f"{_debug_bracket()} Copying {app.config['REPO_DIR']}/csv/{csv_filename}.csv file to {app.config['MYSQL_DIR']}/Uploads"
        responses.append(response)
        print(response)
        try:
            copy(f"{app.config['REPO_DIR']}/csv/{csv_filename}.csv", f"{app.config['MYSQL_DIR']}/Uploads" )
            response = f"{_debug_bracket()} Copied successfully."
            responses.append(response)
            print(response)
        except Exception as e:
            response = f"{_debug_bracket()} Something went wrong while copying the files: {e}"
            responses.append(response)
            print(response)
            return jsonify({'response': [responses]})

    cursor = mysql.connection.cursor()
    response = f"{_debug_bracket()} Checking for an existing table named '{table_name}'..."
    responses.append(response)
    print(response)
    cursor.execute(f''' SHOW TABLES LIKE '{table_name}'; ''')
    table = cursor.fetchall()

    if (table):
        response = f"{_debug_bracket()} Existing table {table_name} found."
        responses.append(response)
        print(response)

        if (clear_if_exists):
            response = f"{_debug_bracket()} Deleting all data from `{table_name}` table..."
            responses.append(response)
            print(response)
            try:
                cursor.execute(f''' SELECT COUNT(*) FROM `{table_name}`;''')
                response = f"{_debug_bracket()} {cursor.fetchall()[0][0]} rows deleted."
                responses.append(response)
                cursor.execute(f''' DELETE FROM `{table_name}`; ''')
                response = f"{_debug_bracket()} `{table_name}` cleared successfully."
                responses.append(response)
                print(response)
            except Exception as e:
                response = f"{_debug_bracket()} `{table_name}` cannot be cleared: {e}"
                responses.append(response)
                print(response)
                return jsonify({'response': [responses]})
        else:
            response = f"{_debug_bracket()} `clear_if_exists` is set to false, table creation will now be terminated."
            responses.append(response)
            print(response)
            return jsonify({'response': [responses]})
    else:
        response = f"{_debug_bracket()}  No existing table found. Proceeding to table creation..."
        responses.append(response)
        print(response)
    
        response = f"{_debug_bracket()} Creating the table..."
        responses.append(response)
        print(response)

        try:
            cursor.execute(create_table_query)
            response = f"{_debug_bracket()} Successfully created the {table_name} table"
            responses.append(response)
            print(response)
        except Exception as e:
            response = f"{_debug_bracket()} Something went wrong while creating the table. Check the query and try again: {e}" 
            responses.append(response)
            print(response)
            return jsonify({'response': [responses]})

    if (csv_filename):
        response = f"{_debug_bracket()} Populating the table with the data from {csv_filename}.csv..."
        responses.append(response)
        print(response)
        
        try:
            cursor.execute(f'''
                    LOAD DATA INFILE "../Uploads/{csv_filename}.csv" IGNORE 
                    INTO TABLE {table_name}
                    FIELDS TERMINATED BY ',' 
                    LINES TERMINATED BY '\n';
                        ''')
        except Exception as e:
            response = f"{_debug_bracket()} Something went wrong while loading the data from {app.config['MYSQL_DIR']}/Uploads/{csv_filename}.csv: {e}"
            responses.append(response)
            print(response)
            return jsonify({'response': [responses]})
        
        if csv_filename == 'all_airports':
            cursor.execute(f'''
                        DELETE
                        FROM `all_airport_t`
                        WHERE iata_code IS NULL;
                           ''')

        cursor.execute(f'''
                       SELECT COUNT(*)
                       FROM {table_name};
                       ''')

        response = f"{_debug_bracket()} Table populated successfully. {cursor.fetchall()[0][0]} rows imported."
        responses.append(response)
        print(response)
    else:
        response = f"{_debug_bracket()} No csv file provided to populate the table."
        responses.append(response)
        print(response)

    mysql.connection.commit()
    response = f"{_debug_bracket()} Changes committed."
    responses.append(response)
    print(response)
    return jsonify({'response': [responses]})
    
@query.route('/')
def query_home():
    return render_template('query_home.html')

@query.route('/create-airport-table')
def create_airport_table():
    return create_table('airport_t', f'''
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
                    ''', 'available_airports', True)

@query.route('/create-all-airport-table')
def create_all_airport_table():
    return create_table('all_airport_t', f'''
                    CREATE TABLE `{app.config['MYSQL_DB']}`.`all_airport_t` (
                    `id` VARCHAR(45) NOT NULL,
                    `ident` VARCHAR(45) NULL,
                    `type` VARCHAR(45) NULL,
                    `name` VARCHAR(255) NULL,
                    `latitude_deg` VARCHAR(45) NULL,
                    `longitude_deg` VARCHAR(45) NULL,
                    `continent` VARCHAR(45) NULL,
                    `iso_country` VARCHAR(45) NULL,
                    `municipality` VARCHAR(45) NULL,
                    `gps_code` VARCHAR(45) NULL,
                    `iata_code` VARCHAR(45) NULL,
                    `local_code` VARCHAR(45) NULL,
                    `keywords` VARCHAR(45) NULL,
                    PRIMARY KEY (`id`))
                    ENGINE = InnoDB
                    DEFAULT CHARACTER SET = utf8mb4
                    COLLATE = utf8mb4_0900_ai_ci;
                    ''', 'all_airports', False)

@query.route('/create-passenger-table')
def create_passenger_table():
    return create_table('passenger_t', f'''
                        CREATE TABLE `{app.config['MYSQL_DB']}`.`passenger_t` (
                            `passengerId` CHAR(4) NOT NULL,
                            `firstName` VARCHAR(30) NOT NULL,
                            `middleName` VARCHAR(20) NULL,
                            `lastName` VARCHAR(20) NOT NULL,
                            `passportNo` VARCHAR(16) NULL,
                            `issueDate` DATE NULL,
                            `expDate` DATE NULL,
                            `birthDate` DATE NOT NULL,
                            `ageGroup` CHAR(6) NOT NULL,
                            PRIMARY KEY (`passengerId`),
                            UNIQUE INDEX `passportNo_UNIQUE` (`passportNo` ASC) VISIBLE)
                        ENGINE = InnoDB
                        DEFAULT CHARACTER SET = utf8mb4
                        COLLATE = utf8mb4_0900_ai_ci;
                        ''', None, False)

@query.route('/create-flight-table')
def create_flight_table():
    return create_table('flight_t', f'''
                        CREATE TABLE `{app.config['MYSQL_DB']}`.`flight_t` (
                        `flightNo` CHAR(7) NOT NULL,
                        `ETA` TIME NOT NULL,
                        `ETD` TIME NOT NULL,
                        `duration` INT NOT NULL,
                        `source` CHAR(3) NOT NULL,
                        `destination` CHAR(3) NOT NULL,
                        PRIMARY KEY (`flightNo`),
                        FOREIGN KEY (`source`) REFERENCES `all_airport_t`(`iata_code`),
                        FOREIGN KEY (`destination`) REFERENCES `all_airport_t`(`iata_code`))
                        ENGINE = InnoDB
                        DEFAULT CHARACTER SET = utf8mb4
                        COLLATE = utf8mb4_0900_ai_ci;
                        ''', None, False)

# @query.route('/create-seat-table')
# def create_seat_table():
#     return create_table('seat_t', f'''
#                         CREATE TABLE `{app.config['MYSQL_DB']}`.`seat_t` (
#                         `seatId` CHAR(4) NOT NULL,
#                         `airlineClass` CHAR(8) NOT NULL,
#                         `extras` CHAR(8) NULL,
#                         PRIMARY KEY (`seatId`))
#                         ENGINE = InnoDB
#                         DEFAULT CHARACTER SET = utf8mb4
#                         COLLATE = utf8mb4_0900_ai_ci;
#                         ''', None, False)

@query.route('/create-itinerary-table')
def create_itinerary_table():
    return create_table('itinerary_t', f'''
                        CREATE TABLE `{app.config['MYSQL_DB']}`.`itinerary_t` (
                        `itineraryCode` CHAR(6) NOT NULL,
                        `source` CHAR(3) NOT NULL,
                        `destination` CHAR(3) NOT NULL,
                        `flightDate` DATE NOT NULL,
                        `flightCount` INT NOT NULL,
                        PRIMARY KEY (`itineraryCode`),
                        FOREIGN KEY (`source`) REFERENCES `airport_t`(`airport_code`),
                        FOREIGN KEY (`destination`) REFERENCES `airport_t`(`airport_code`))
                        ENGINE = InnoDB
                        DEFAULT CHARACTER SET = utf8mb4
                        COLLATE = utf8mb4_0900_ai_ci;                        
                        ''', None, False)

@query.route('/create-itinerary-flight-table')
def create_itinerary_flight_table():
    return create_table('itinerary_flight_t', f'''
                        CREATE TABLE `{app.config['MYSQL_DB']}`.`itinerary_flight_t` (
                        `itineraryCode` CHAR(6) NOT NULL,
                        `flightNo` CHAR(7) NOT NULL,
                        `flightOrder` INT NOT NULL,
                        PRIMARY KEY (`itineraryCode`, `flightNo`),
                        FOREIGN KEY (`itineraryCode`) REFERENCES `itinerary_t`(`itineraryCode`),
                        FOREIGN KEY (`flightNo`) REFERENCES `flight_t`(`flightNo`))
                        ENGINE = InnoDB
                        DEFAULT CHARACTER SET = utf8mb4
                        COLLATE = utf8mb4_0900_ai_ci;                        
                        ''', None, False)

@query.route('/create-ticket-table')
def create_ticket_table():
    return create_table('ticket_t', f'''
                        CREATE TABLE `{app.config['MYSQL_DB']}`.`ticket_t` (
                        `ticketId` CHAR(4) NOT NULL,
                        `accountName` VARCHAR(70) NOT NULL,
                        `modeOfPayment` CHAR(10) NOT NULL,
                        `accountNumber` VARCHAR(16) NOT NULL,
                        `expDate` DATE NULL,
                        `contactNo` VARCHAR(15) NOT NULL,
                        `passengerCount` INT NOT NULL,
                        `totalFare` DECIMAL(10,2) NOT NULL,
                        `airlineClass` CHAR(8) NOT NULL,
                        `itineraryCode` CHAR(6) NOT NULL,
                        PRIMARY KEY (`ticketId`),
                        FOREIGN KEY (`itineraryCode`) REFERENCES `itinerary`(`itineraryCode`))
                        ENGINE = InnoDB
                        DEFAULT CHARACTER SET = utf8mb4
                        COLLATE = utf8mb4_0900_ai_ci;                        
                        ''', None, False)

@query.route('/create-reservation-table')
def create_reservation_table():
    return create_table('reservation_t', f'''
                        CREATE TABLE `flask_test`.`reservation_t` (
                            `passengerId` CHAR(4) NOT NULL,
                            `ticketId` CHAR(4) NOT NULL,
                            `seatNo` CHAR(4) NOT NULL,
                            PRIMARY KEY (`passengerId`, `ticketId`),
                            FOREIGN KEY (`passengerId`) REFERENCES `passenger_t`(`passengerId`),
                            FOREIGN KEY (`ticketId`) REFERENCES `ticket_t`(`ticketId`)
                        ENGINE = InnoDB
                        DEFAULT CHARACTER SET = utf8mb4
                        COLLATE = utf8mb4_0900_ai_ci;
                        ''', None, False)

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
                        OR country_code LIKE '%{input}'
                    ORDER BY municipality
                    ''')
                    
    returned = cursor.fetchall()
    return jsonify(returned)

@query.route('/get-geocode', methods=['POST'])
def get_geocode():
    iata = request.get_json()['iata']
    cursor = mysql.connection.cursor()
    cursor.execute(f'''
                    SELECT name, longitude_deg, latitude_deg
                    FROM `all_airport_t`
                    WHERE iata_code = '{iata}';
                   ''')
    
    rev = cursor.fetchall()
    return jsonify(rev)

@query.route('/get-country', methods=['POST'])
def get_country():
    iata = request.get_json()['iata']
    cursor = mysql.connection.cursor()
    cursor.execute(f'''
                    SELECT country_code
                    FROM `airport_t`
                    WHERE iata_code = '{iata}';
                   ''')
    rev = cursor.fetchall()
    return jsonify(rev)

@query.route('/post-flight', methods=['POST'])
def post_flight():
    flight_details = request.get_json()
    flights = flight_details['itineraries']['results']
    length = len(flights)
    legs = flights[0]['legs'][0]

    cursor = mysql.connection.cursor()

    for i in range(length):
        legs = flights[i]['legs'][0]
        ETA = legs['arrival'][11:16]
        ETD = legs['departure'][11:16]
        duration_in_mins = legs['durationInMinutes']
        price = flights[i]['pricing_options'][0]['price']['amount']
        stop_count = legs['stopCount']
        stops_json = legs['segments']

        for i in range(len(stops_json)):
            arrival = stops_json[i]['arrival'][11:16]
            departure = stops_json[i]['departure'][11:16]
            durationInMinutes = stops_json[i]['durationInMinutes']
            flight_number = stops_json[i]['marketingCarrier']['alternate_di'] + stops_json[i]['flightNumber']
            destination_iata = stops_json[i]['destination']['flightPlaceId']
            origin_iata = stops_json[i]['origin']['flightPlaceId']
            # print(f"{flight_number}, {arrival}, {departure}, {durationInMinutes}, {origin_iata}, {destination_iata}")
        
            try:
                cursor.execute(f'''
                    INSERT INTO `flight_t` (flightNo, ETA, ETD, duration, source, destination) 
                        VALUES ('{flight_number}', '{arrival}', '{departure}', {durationInMinutes}, '{origin_iata}', '{destination_iata}');
                    ''')
                mysql.connection.commit()
            except:
                continue

    # for flight in legs:
    #     print(flight, " ", legs[flight])
    return jsonify({})