from flask import Blueprint, render_template, jsonify, request, session, redirect, url_for
from . import mysql, app
from shutil import copy
from datetime import datetime
import string
import random
import json

query = Blueprint('query', __name__)

def _debug_bracket():
    return f"[DEBUG {datetime.now().time().strftime('%H:%M:%S')}]"

def get_attribute_or_none(attribute):
    try:
        attr = attribute
        if attr != None:
            return '"' + attr + '"'
        else:
            return 'NULL'
    except:
        return 'NULL'

def primary_key(first_char, attribute, table_name, n=3):

    invalid_key = True
    while invalid_key:
        cur = mysql.connection.cursor()
        res = first_char + ''.join(random.choices(string.ascii_uppercase +
                                    string.digits, k=n))
        cur.execute(f"""
                    SELECT COUNT(*)
                    FROM {table_name}
                    WHERE {attribute} = "{res}";
                    """)
        
        count = cur.fetchone()
        if count[0] == 0:
            invalid_key = False

    return res

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
                        WHERE iata_code = '' or type not like "%airport%";
                           ''')
            cursor.execute(f'''
                        ALTER TABLE `all_airport_t`
                        ADD UNIQUE INDEX `iata_code_UNIQUE` (`iata_code` ASC) VISIBLE;;
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
                        `airport_code` CHAR(4) NOT NULL,
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
                    `iata_code` CHAR(4),
                    `local_code` VARCHAR(45) NULL,
                    `keywords` VARCHAR(45) NULL,
                    PRIMARY KEY (`id`))
                    ENGINE = InnoDB
                    DEFAULT CHARACTER SET = utf8mb4
                    COLLATE = utf8mb4_0900_ai_ci;
                    ''', 'all_airports', True)

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
                            PRIMARY KEY (`passengerId`))
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
                        FOREIGN KEY (`itineraryCode`) REFERENCES `itinerary_t`(`itineraryCode`))
                        ENGINE = InnoDB
                        DEFAULT CHARACTER SET = utf8mb4
                        COLLATE = utf8mb4_0900_ai_ci;                        
                        ''', None, False)

@query.route('/create-reservation-table')
def create_reservation_table():
    return create_table('reservation_t', f'''
                        CREATE TABLE `{app.config['MYSQL_DB']}`.`reservation_t` (
                            `passengerId` CHAR(4) NOT NULL,
                            `ticketId` CHAR(4) NOT NULL,
                            `seatNo` CHAR(4) NOT NULL,
                            PRIMARY KEY (`passengerId`, `ticketId`),
                            FOREIGN KEY (`passengerId`) REFERENCES `passenger_t`(`passengerId`),
                            FOREIGN KEY (`ticketId`) REFERENCES `ticket_t`(`ticketId`))
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

@query.route('/post-reservation', methods=['POST'])
def post_reservation():
    session['payment'] = request.form
    
    cur = mysql.connection.cursor()

    # PASSENGER FORM
    total_passenger_count = (int(session['form_part_one']['passenger-adult']) + 
                            int(session['form_part_one']['passenger-children']) +
                            int(session['form_part_one']['passenger-infant']))
    
    # Itinerary
    itinerary_code = session['selected_itinerary']

    # Ticket
    ticket_id = session['ticketId']
    accountName = session['payment']['account-name']
    accountNumber = session['payment']['account-number']
    expDate = (session['payment']['account-exp-date'] if session['payment'].get('account-exp-pdate') != None else None)
    modeOfPayment = session['payment']['mode-of-payment']
    contactNo = session['passenger-details']['contactNumber']
    emailAddress = session['passenger-details']['emailAddress']
    airline_class = session['form_part_one']['airline-class']
    departure_date = datetime.strptime(session['form_part_one']['departure-date'], '%Y-%m-%d').date()

    cur.execute(f'''
                INSERT INTO ticket_t (ticketId, accountName, modeOfPayment,
                    accountNumber, expDate, contactNo, emailAddress, passengerCount,
                    totalFare, airlineClass, itineraryCode, departureDate)
                VALUES ("{ticket_id}", "{accountName}", "{modeOfPayment}",
                        "{accountNumber}", {get_attribute_or_none(expDate)}, "{contactNo}",
                        "{emailAddress}", {total_passenger_count},
                        100000.00, "{airline_class}", "{itinerary_code}", "{departure_date}");
                ''')

    seats = []
    for i in range(total_passenger_count):
        FirstName = session['passenger-details'][f"p{i+1}FirstName"]
        MiddleName = session['passenger-details'][f"p{i+1}MiddleName"]
        LastName = session['passenger-details'][f"p{i+1}LastName"]
        PassportNo = session['passenger-details'][f"p{i+1}PassportNo"]
        IssueDateStr = session['passenger-details'][f"p{i+1}IssueDate"]
        ExpDateStr = session['passenger-details'][f"p{i+1}ExpDate"]
        BirthDateStr = session['passenger-details'][f"p{i+1}BirthDate"]
        AgeGroup = session['passenger-details'][f"p{i+1}AgeGroup"]
        if AgeGroup == 'Children':
            AgeGroup = 'Child'

        if AgeGroup != 'Infant':
            seats.append(session['booked_seats'][f"p{i+1}"])

        # convert string to datetime then insert in db
        if IssueDateStr != '':
            IssueDate = datetime.strptime(IssueDateStr, '%Y-%m-%d').date()
        else:
            IssueDate = None
        if ExpDateStr != '':
            ExpDate = datetime.strptime(ExpDateStr, '%Y-%m-%d').date()
        else:
            ExpDate = None
        BirthDate = datetime.strptime(BirthDateStr, '%Y-%m-%d').date()

        if PassportNo == '':
            PassportNo = None

        passengerId = primary_key('P', 'passengerId', 'passenger_t')
        if PassportNo == None:
            cur.execute(f"""
                        SELECT passengerId
                        FROM passenger_t
                        WHERE firstName = "{FirstName}"
                            AND middleName = "{MiddleName}"
                            AND lastName = "{LastName}"
                            AND birthdate = "{BirthDate}";
                        """)
            result = cur.fetchall()
            print(f"RESULT: {result}")
            if len(result) == 1:
                passengerId = result[0][0]
            else:
                cur.execute(f"""INSERT INTO passenger_t(
                        PassengerId,
                        FirstName,
                        MiddleName,
                        LastName,
                        PassportNo,
                        IssueDate,
                        ExpDate,
                        BirthDate,
                        AgeGroup) 
                    VALUES("{passengerId}", "{FirstName}", "{MiddleName}", "{LastName}", 
                     {get_attribute_or_none(PassportNo)}, {get_attribute_or_none(IssueDate)}, 
                     {get_attribute_or_none(ExpDate)}, "{BirthDate}", "{AgeGroup}");""")

        else:
            cur.execute(f"""
                        SELECT passengerId
                        FROM passenger_t
                        WHERE passportNo = "{PassportNo}";
                        """)
            result = cur.fetchall()
            if len(result) == 1:
                passengerId = result[0][0]
            else:
                cur.execute(f"""INSERT INTO passenger_t(
                        PassengerId,
                        FirstName,
                        MiddleName,
                        LastName,
                        PassportNo,
                        IssueDate,
                        ExpDate,
                        BirthDate,
                        AgeGroup) 
                    VALUES("{passengerId}", "{FirstName}", "{MiddleName}", "{LastName}", 
                     {get_attribute_or_none(PassportNo)}, {get_attribute_or_none(IssueDate)}, 
                     {get_attribute_or_none(ExpDate)}, "{BirthDate}", "{AgeGroup}");""")

        cur.execute(f'''
                    INSERT INTO reservation_t
                    VALUES ("{passengerId}", "{ticket_id}", {get_attribute_or_none(session['booked_seats'][f"p{i+1}"])})            
                    ''')

    mysql.connection.commit()
    cur.close()
    return redirect(url_for('view.confirmation'))

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

@query.route('/get-itinerary-details', methods=['POST'])
def get_itinerary_details():
    itineraryCode = request.get_json()['itineraryCode']
    cursor = mysql.connection.cursor()
    cursor.execute(f'''
                   SELECT *
                   FROM itinerary_t i
                   WHERE i.itineraryCode = "{itineraryCode}";
                   ''')
    return jsonify(cursor.fetchall())

@query.route('/get-departure-time', methods=['POST'])
def get_departure_time():
    itineraryCode = request.get_json()['itineraryCode']
    cursor = mysql.connection.cursor()
    cursor.execute(f'''
                    SELECT TIME_FORMAT(f.etd, '%H:%i')
                    FROM itinerary_flight_t it, flight_t f
                    WHERE it.itineraryCode = "{itineraryCode}" AND it.flightOrder = 1 and f.flightNo = it.flightNo;
                   ''')
    return jsonify(cursor.fetchall())

@query.route('/get-arrival-time', methods=['POST'])
def get_arrival_time():
    itineraryCode = request.get_json()['itineraryCode']
    cursor = mysql.connection.cursor()
    cursor.execute(f'''
                    SELECT TIME_FORMAT(f.eta, '%H:%i')
                    FROM itinerary_flight_t it, flight_t f, itinerary_t i
                    WHERE it.itineraryCode = "{itineraryCode}" AND it.itineraryCode = i.itineraryCode AND it.flightOrder = i.flightCount and f.flightNo = it.flightNo;
                   ''')
    return jsonify(cursor.fetchall())

@query.route('/get-stops', methods=['POST'])
def get_stops():
    itineraryCode = request.get_json()['itineraryCode']
    cursor = mysql.connection.cursor()
    cursor.execute(f'''
                   SELECT f.flightNo, TIME_FORMAT(f.eta, '%H:%i'), TIME_FORMAT(f.etd, '%H:%i'), 
                            f.duration, f.source, f.destination
                   FROM itinerary_t i, itinerary_flight_t it, flight_t f
                   WHERE i.itineraryCode = it.itineraryCode 
                    AND i.itineraryCode = "{itineraryCode}"
                    AND f.flightNo = it.flightNo
                   ORDER BY it.flightOrder;
                   ''')
    return jsonify(cursor.fetchall())

@query.route('/get-seat')
def get_seat():
    itineraryCode = session['selected_itinerary']
    print(itineraryCode)
    ticketId = session['ticketId']

    cursor = mysql.connection.cursor()

    print(f'''
                   select seatNo
                    from itinerary_t i, reservation_t r, ticket_t t
                    where i.itineraryCode = '{itineraryCode}' and i.itineraryCode = t.itineraryCode
                        and r.ticketid = t.ticketid 
                        and t.departureDate = '{datetime.strptime(session['form_part_one']['departure-date'], '%Y-%m-%d').date()}';
                   ''')

    cursor.execute(f'''
                   select seatNo
                    from itinerary_t i, reservation_t r, ticket_t t
                    where i.itineraryCode = '{itineraryCode}' and i.itineraryCode = t.itineraryCode
                        and r.ticketid = t.ticketid 
                        and t.departureDate = '{datetime.strptime(session['form_part_one']['departure-date'], '%Y-%m-%d').date()}';
                   ''')
    return jsonify(cursor.fetchall())

@query.route('/get-cheapest-itinerary')
def get_cheapest_itinerary():
    session['form_part_one']['to-json'] = json.loads(session['form_part_one']['to-json'])
    session['form_part_one']['from-json'] = json.loads(session['form_part_one']['from-json'])

    cursor = mysql.connection.cursor()
    cursor.execute(f'''
                    SELECT *
                    FROM itinerary_t I
                    WHERE (I.source = "{session['form_part_one']['from-json']['iata']}" 
                     AND I.destination = "{session['form_part_one']['to-json']['iata']}")
                    ORDER BY I.baseFare;
                    ''')
    available_flights = cursor.fetchall()
    
    cursor.execute(f'''
                    SELECT TIME_FORMAT(f.etd, '%H:%i')
                    FROM itinerary_t i, itinerary_flight_t it, flight_t f
                    WHERE (I.source = "{session['form_part_one']['from-json']['iata']}" 
                     AND I.destination = "{session['form_part_one']['to-json']['iata']}") 
                     AND it.itineraryCode = i.itineraryCode AND it.flightOrder = 1 and f.flightNo = it.flightNo
                    ORDER BY i.baseFare;
                   ''')
    
    depart_time_list = cursor.fetchall()

    cursor.execute(f'''
                   SELECT TIME_FORMAT(f.eta, '%H:%i')
                   FROM itinerary_t i, itinerary_flight_t it, flight_t f
                   WHERE (I.source = "{session['form_part_one']['from-json']['iata']}" 
                     AND I.destination = "{session['form_part_one']['to-json']['iata']}") 
                     AND it.itineraryCode = i.itineraryCode AND it.flightOrder = i.flightCount and f.flightNo = it.flightNo
                   ORDER BY i.baseFare;
                   ''')
    
    arrival_time_list = cursor.fetchall()

    return render_template('flights.html', form_part_one=session['form_part_one'], 
                            available_flights=available_flights, 
                            depart_time_list=depart_time_list, 
                            arrival_time_list=arrival_time_list, 
                            result_count=len(available_flights))


@query.route('/get-fastest-itinerary')
def get_fastest_itinerary():
    session['form_part_one']['to-json'] = json.loads(session['form_part_one']['to-json'])
    session['form_part_one']['from-json'] = json.loads(session['form_part_one']['from-json'])

    cursor = mysql.connection.cursor()
    cursor.execute(f'''
                    SELECT *
                    FROM itinerary_t I
                    WHERE (I.source = "{session['form_part_one']['from-json']['iata']}" 
                     AND I.destination = "{session['form_part_one']['to-json']['iata']}")
                    ORDER BY I.duration;
                    ''')
    available_flights = cursor.fetchall()
    cursor.execute(f'''
                    SELECT TIME_FORMAT(f.etd, '%H:%i')
                    FROM itinerary_t i, itinerary_flight_t it, flight_t f
                    WHERE (I.source = "{session['form_part_one']['from-json']['iata']}" 
                     AND I.destination = "{session['form_part_one']['to-json']['iata']}") 
                     AND it.itineraryCode = i.itineraryCode AND it.flightOrder = 1 and f.flightNo = it.flightNo
                    ORDER BY i.duration;
                   ''')
    
    depart_time_list = cursor.fetchall()

    cursor.execute(f'''
                   SELECT TIME_FORMAT(f.eta, '%H:%i')
                   FROM itinerary_t i, itinerary_flight_t it, flight_t f
                   WHERE (I.source = "{session['form_part_one']['from-json']['iata']}" 
                     AND I.destination = "{session['form_part_one']['to-json']['iata']}") 
                     AND it.itineraryCode = i.itineraryCode AND it.flightOrder = i.flightCount and f.flightNo = it.flightNo
                   ORDER BY i.duration;
                   ''')
    
    arrival_time_list = cursor.fetchall()

    return render_template('flights.html', form_part_one=session['form_part_one'], 
                            available_flights=available_flights, 
                            depart_time_list=depart_time_list, 
                            arrival_time_list=arrival_time_list, 
                            result_count=len(available_flights))

@query.route('/get-direct-only')
def get_direct_only():
    session['form_part_one']['to-json'] = json.loads(session['form_part_one']['to-json'])
    session['form_part_one']['from-json'] = json.loads(session['form_part_one']['from-json'])

    cursor = mysql.connection.cursor()

    cursor.execute(f'''
                    SELECT *
                    FROM itinerary_t I
                    WHERE (I.source = "{session['form_part_one']['from-json']['iata']}" 
                     AND I.destination = "{session['form_part_one']['to-json']['iata']}")
                     AND I.flightCount = 1
                    ORDER BY I.itineraryCode;
                    ''')
    
    available_flights = cursor.fetchall()

    cursor.execute(f'''
                    SELECT TIME_FORMAT(f.etd, '%H:%i')
                    FROM itinerary_t i, itinerary_flight_t it, flight_t f
                    WHERE (I.source = "{session['form_part_one']['from-json']['iata']}" 
                     AND I.destination = "{session['form_part_one']['to-json']['iata']}") 
                     AND it.itineraryCode = i.itineraryCode AND it.flightOrder = 1 and f.flightNo = it.flightNo
                    ORDER BY i.itineraryCode;
                   ''')
    
    depart_time_list = cursor.fetchall()

    cursor.execute(f'''
                   SELECT TIME_FORMAT(f.eta, '%H:%i')
                   FROM itinerary_t i, itinerary_flight_t it, flight_t f
                   WHERE (I.source = "{session['form_part_one']['from-json']['iata']}" 
                     AND I.destination = "{session['form_part_one']['to-json']['iata']}") 
                     AND it.itineraryCode = i.itineraryCode AND it.flightOrder = i.flightCount and f.flightNo = it.flightNo
                   ORDER BY i.itineraryCode;
                   ''')
    
    arrival_time_list = cursor.fetchall()

    if len(available_flights) == 0:
        return render_template('flights.html', form_part_one=session['form_part_one'], result_count=0, error_message=["No results found."])


    return render_template('flights.html', form_part_one=session['form_part_one'], 
                            available_flights=available_flights, 
                            depart_time_list=depart_time_list, 
                            arrival_time_list=arrival_time_list, 
                            result_count=len(available_flights))

@query.route('/get-one-stop-only')
def get_one_stop_only():
    session['form_part_one']['to-json'] = json.loads(session['form_part_one']['to-json'])
    session['form_part_one']['from-json'] = json.loads(session['form_part_one']['from-json'])

    cursor = mysql.connection.cursor()

    cursor.execute(f'''
                    SELECT *
                    FROM itinerary_t I
                    WHERE (I.source = "{session['form_part_one']['from-json']['iata']}" 
                     AND I.destination = "{session['form_part_one']['to-json']['iata']}")
                     AND I.flightCount = 2
                    ORDER BY I.itineraryCode;
                    ''')
    
    available_flights = cursor.fetchall()

    cursor.execute(f'''
                    SELECT TIME_FORMAT(f.etd, '%H:%i')
                    FROM itinerary_t i, itinerary_flight_t it, flight_t f
                    WHERE (I.source = "{session['form_part_one']['from-json']['iata']}" 
                     AND I.destination = "{session['form_part_one']['to-json']['iata']}") 
                     AND it.itineraryCode = i.itineraryCode AND it.flightOrder = 1 and f.flightNo = it.flightNo
                    ORDER BY i.itineraryCode;
                   ''')
    
    depart_time_list = cursor.fetchall()

    cursor.execute(f'''
                   SELECT TIME_FORMAT(f.eta, '%H:%i')
                   FROM itinerary_t i, itinerary_flight_t it, flight_t f
                   WHERE (I.source = "{session['form_part_one']['from-json']['iata']}" 
                     AND I.destination = "{session['form_part_one']['to-json']['iata']}") 
                     AND it.itineraryCode = i.itineraryCode AND it.flightOrder = i.flightCount and f.flightNo = it.flightNo
                   ORDER BY i.itineraryCode;
                   ''')
    
    arrival_time_list = cursor.fetchall()

    if len(available_flights) == 0:
        return render_template('flights.html', form_part_one=session['form_part_one'], result_count=0, error_message=["No results found."])

    return render_template('flights.html', form_part_one=session['form_part_one'], 
                            available_flights=available_flights, 
                            depart_time_list=depart_time_list, 
                            arrival_time_list=arrival_time_list, 
                            result_count=len(available_flights))



@query.route('/min-max-duration')
def get_min_max_duration():
    session['form_part_one']['to-json'] = json.loads(session['form_part_one']['to-json'])
    session['form_part_one']['from-json'] = json.loads(session['form_part_one']['from-json'])
    
    cursor = mysql.connection.cursor()
    cursor.execute(f'''
                    SELECT min(i.duration), max(i.duration)
                    FROM itinerary_t i, itinerary_flight_t it, flight_t f
                    WHERE (I.source = "{session['form_part_one']['from-json']['iata']}"
                    AND I.destination = "{session['form_part_one']['to-json']['iata']}") and i.itineraryCode = it.itineraryCode and it.flightNo = f.flightNo;
                   ''')
    
    return jsonify(cursor.fetchall())

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