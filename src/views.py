from flask import Blueprint, render_template, request, url_for, redirect, jsonify, session, flash
from . import mysql
from .query import primary_key
import json
import requests
from . import skyscanner

view = Blueprint('view', __name__)

@view.route('/', methods=['GET', 'POST'])
def home():
    session['ticketId'] = primary_key('T', 'ticketId', 'ticket_t')
    if request.method == 'POST':
        session['form_part_one'] = request.form
        return redirect(url_for('.flights'))
    return render_template('home.html')

@view.route('/_loading')
def _loading():
    return render_template('loading-screen.html')

@view.route('/about')
def about():
    return render_template('about.html')

@view.route('/contact-us')
def contact_us():
    return render_template('contact_us.html')

@view.route('/flights', methods=['GET', 'POST'])
def flights():
    if request.method  == 'POST':
        form_part_one = session['form_part_one']
        return jsonify(form_part_one)

    try:
        session['form_part_one']['to-json'] = json.loads(session['form_part_one']['to-json'])
        session['form_part_one']['from-json'] = json.loads(session['form_part_one']['from-json'])
    except:
        return redirect(url_for('view.home'))

    # return session['form_part_one']

    origin = session['form_part_one']['from-json']['iata']
    destination = session['form_part_one']['to-json']['iata']
    departure_date = session['form_part_one']['departure-date']
    
    cursor = mysql.connection.cursor()

    # GET ALL AVAILABLE ITINERARIES
    cursor.execute(f'''
                    SELECT *
                    FROM itinerary_t I
                    WHERE (I.source = '{origin}' AND I.destination = '{destination}')
                    ORDER BY i.itineraryCode;
                    ''')
    
    available_flights = cursor.fetchall()
    
    if len(available_flights) < 10:
        available_flights = skyscanner.skyscanner.request(origin, destination, departure_date)
        # requests.post('http://127.0.0.1:5000/api/searched-flights', json=available_flights)

    cursor.execute(f'''
                    SELECT TIME_FORMAT(f.etd, '%H:%i')
                    FROM itinerary_t i, itinerary_flight_t it, flight_t f
                    WHERE it.itineraryCode = i.itineraryCode 
                        AND it.flightOrder = 1 and f.flightNo = it.flightNo
                    ORDER BY i.itineraryCode;
                   ''')
    
    depart_time_list = cursor.fetchall()

    cursor.execute(f'''
                   SELECT TIME_FORMAT(f.eta, '%H:%i')
                   FROM itinerary_t i, itinerary_flight_t it, flight_t f
                   WHERE it.itineraryCode = i.itineraryCode 
                    AND it.flightOrder = i.flightCount and f.flightNo = it.flightNo
                   ORDER BY i.itineraryCode;
                   ''')
    
    arrival_time_list = cursor.fetchall()
    
    # return jsonify(available_flights)

    if len(available_flights) == 0:
        return render_template('flights.html', form_part_one=session['form_part_one'], result_count=0, error_message=["No results found."], filtered=False)

    return render_template('flights.html', form_part_one=session['form_part_one'], available_flights=available_flights, depart_time_list=depart_time_list, arrival_time_list=arrival_time_list, result_count=len(available_flights), filtered=False)
    # except:
    #     return redirect(url_for('view.home'))

@view.route('/filtered', methods=['POST'])
def get_filtered():
    filters = request.form
    session['form_part_one']['to-json'] = json.loads(session['form_part_one']['to-json'])
    session['form_part_one']['from-json'] = json.loads(session['form_part_one']['from-json'])
    cursor = mysql.connection.cursor()
    
    print(f'''
                    SELECT i.*, it.*
                    FROM itinerary_t i, itinerary_flight_t it, flight_t f
                    WHERE (I.source = "{session['form_part_one']['from-json']['iata']}" 
                            AND I.destination = "{session['form_part_one']['to-json']['iata']}")
                            AND i.itineraryCode = it.itineraryCode AND it.flightNo = f.flightNo
                            AND i.duration <= {filters['duration-to']} * 60 
                            AND i.flightCount {'<=' if int(filters['stops']) < 2 else '>=' if int(filters['stops']) == 2 else '>='} {int(filters['stops']) + 1 if int(filters['stops']) != 3 else 0}
                            AND it.flightOrder = 1 AND f.ETD BETWEEN '{filters['departure-from']}' AND '{filters['departure-to']}'
                    ORDER BY {'basefare, i.duration' if filters['sortBy'] == 'Best' else 'basefare' if filters['sortBy'] == 'Cheapest' else 'i.duration'};
                   ''')

    cursor.execute(f'''
                    SELECT i.*, it.*
                    FROM itinerary_t i, itinerary_flight_t it, flight_t f
                    WHERE (I.source = "{session['form_part_one']['from-json']['iata']}" 
                            AND I.destination = "{session['form_part_one']['to-json']['iata']}")
                            AND i.itineraryCode = it.itineraryCode AND it.flightNo = f.flightNo
                            AND i.duration <= {filters['duration-to']} * 60 
                            AND i.flightCount {'<=' if int(filters['stops']) < 2 else '>=' if int(filters['stops']) == 2 else '>='} {int(filters['stops']) + 1 if int(filters['stops']) != 3 else 0}
                            AND it.flightOrder = 1 AND f.ETD BETWEEN '{filters['departure-from']}' AND '{filters['departure-to']}'
                    ORDER BY {'basefare, i.duration' if filters['sortBy'] == 'Best' else 'basefare' if filters['sortBy'] == 'Cheapest' else 'i.duration'};
                   ''')
    
    available_flights = cursor.fetchall()
    
    cursor.execute(f'''
                    SELECT TIME_FORMAT(f.etd, '%H:%i')
                    FROM itinerary_t i, itinerary_flight_t it, flight_t f
                    WHERE (I.source = "{session['form_part_one']['from-json']['iata']}" 
                            AND I.destination = "{session['form_part_one']['to-json']['iata']}")
                            AND i.itineraryCode = it.itineraryCode AND it.flightNo = f.flightNo
                            AND i.duration <= {filters['duration-to']} * 60 
                            AND i.flightCount 
                                {'<=' if int(filters['stops']) < 2 
                                    else '>=' if int(filters['stops']) == 2 
                                    else '>='} 
                                {int(filters['stops']) + 1 
                                 if int(filters['stops']) != 3 
                                 else 0}
                            AND it.flightOrder = 1 AND f.ETD BETWEEN '{filters['departure-from']}' 
                            AND '{filters['departure-to']}'
                    ORDER BY {'basefare, i.duration' 
                              if filters['sortBy'] == 'Best' 
                              else 'basefare' if filters['sortBy'] == 'Cheapest' 
                              else 'i.duration'};
                   ''')
    
    depart_time_list = cursor.fetchall()

    if len(available_flights) == 0:
        return render_template('flights.html', form_part_one=session['form_part_one'], 
                               result_count=0, error_message=["No results found."], filtered=True, filters=json.dumps(filters))

    # cursor.execute(f'''
    #                 SELECT TIME_FORMAT(f.eta, '%H:%i')
    #                 FROM itinerary_t i, itinerary_flight_t it, flight_t f
    #                 WHERE (I.source = "{session['form_part_one']['from-json']['iata']}" 
    #                         AND I.destination = "{session['form_part_one']['to-json']['iata']}")
    #                         AND i.itineraryCode = it.itineraryCode AND it.flightNo = f.flightNo
    #                         AND i.duration <= {filters['duration-to']} * 60 
    #                         AND i.flightCount {'<=' if int(filters['stops']) < 2 else '>=' if int(filters['stops']) == 2 else '>='} {int(filters['stops']) + 1 if int(filters['stops']) != 3 else 0}
    #                         AND it.flightOrder = i.flightCount AND f.ETD BETWEEN '{filters['departure-from']}' AND '{filters['departure-to']}'
    #                 ORDER BY {'basefare, i.duration' if filters['sortBy'] == 'Best' else 'basefare' if filters['sortBy'] == 'Cheapest' else 'i.duration'};
    #                ''')
    available_flights_iata = ['"' + available_flight[0] + '"' for available_flight in available_flights]

    cursor.execute(f'''
                   SELECT TIME_FORMAT(f.eta, '%H:%i')
                   FROM itinerary_t i, itinerary_flight_t it, flight_t f
                   WHERE i.itineraryCode IN ({", ".join(available_flights_iata)}) 
                        AND i.itineraryCode = it.itineraryCode AND it.flightNo = f.flightNo
                        AND it.flightOrder = i.flightCount
                    ORDER BY {'basefare, i.duration' 
                              if filters['sortBy'] == 'Best' 
                              else 'basefare' if filters['sortBy'] == 'Cheapest' 
                              else 'i.duration'};
                   ''')

    arrival_time_list = cursor.fetchall()

    return render_template('flights.html', form_part_one=session['form_part_one'], 
                            available_flights=available_flights, 
                            depart_time_list=depart_time_list, 
                            arrival_time_list=arrival_time_list, 
                            result_count=len(available_flights),
                            filtered=True, filters=json.dumps(filters))

@view.route('/selected-itinerary/<path:itineraryCode>', methods=['POST', 'GET'])
def selected_itinerary(itineraryCode):
    if request.method == 'POST':
        session['selected_itinerary'] = json.loads(itineraryCode)
        # for stop in session['selected_flight']['stops']:
        #     print(stop['flight_number'])
            
        response = {'status': 200}
        return jsonify(response)

@view.route('/passenger-details', methods=['GET', 'POST'])
def passenger_details():
    if request.method == 'POST':
        session['form_part_one']['to-json'] = json.loads(session['form_part_one']['to-json'])
        session['form_part_one']['from-json'] = json.loads(session['form_part_one']['from-json'])

        # origin_country = requests.post("http://127.0.0.1/get-country", json=)
        if session['form_part_one']['from-json']['iso_country'] == session['form_part_one']['to-json']['iso_country']:
            flight_type = 'local'
        else:
            flight_type = 'international'
        return render_template('passenger-details.html', flight_type=flight_type, selected_flight=session['selected_flight'], form_part_one=(session['form_part_one']))
    
    try:
        return render_template('passenger-details.html')
    except:
        return redirect(url_for('view.home'))

@view.route('/save-passenger-details', methods=['POST'])
def save_passenger_details():
    session['passenger-details'] = request.get_json()
    print(session['passenger-details'])
    # session['form_part_one']['to-json'] = json.loads(session['form_part_one']['to-json'])
    # session['form_part_one']['from-json'] = json.loads(session['form_part_one']['from-json'])
    # return redirect(url_for('view.seats'))
    return jsonify({})

@view.route('/seats', methods=['GET', 'POST'])
def seats():
    if request.method == 'POST':
        try:
            # session['passenger-details'] = request.form
            session['form_part_one']['to-json'] = json.loads(session['form_part_one']['to-json'])
            session['form_part_one']['from-json'] = json.loads(session['form_part_one']['from-json'])
        except:
            return redirect(url_for('view.passenger_details'))
        
        return render_template('seats.html', selected_flight=session['selected_flight'], form_part_one=session['form_part_one'])
    try:
        session['form_part_one']['to-json'] = json.loads(session['form_part_one']['to-json'])
        session['form_part_one']['from-json'] = json.loads(session['form_part_one']['from-json'])
        return render_template('seats.html', selected_flight=session['selected_flight'], form_part_one=session['form_part_one'])
        # return render_template('seats.html')
    except:
        return redirect(url_for('view.passenger_details'))

@view.route('/payment', methods=['GET', 'POST'])
def payment():
    if request.method == 'POST':
        print(request.data)
        session['form_part_one']['to-json'] = json.loads(session['form_part_one']['to-json'])
        session['form_part_one']['from-json'] = json.loads(session['form_part_one']['from-json'])
        session['booked_seats'] = json.loads(request.data)
        return jsonify({'status': 202})

    res = requests.post('http://127.0.0.1:5000/query/get-itinerary-details', json={'itineraryCode': session['selected_itinerary']}).json()
    print(res)

    # try:
    return render_template('payment.html', 
                               selected_flight=res, 
                               form_part_one=session['form_part_one'], 
                               booked_seats = session['booked_seats'])
    # except:
    #     return redirect(url_for('view.seats'))

@view.route('/confirmation')
def confirmation():

    reservation = []
    passenger_names = []
    itinerary = []  # departureDate
    ticket = []     # airlineClass,     
    seats = []      # bookedSeats
    stops = []      # flightNo, source, dest

    municipalities = []

    cursor = mysql.connection.cursor()

    stops = (requests.post('http://127.0.0.1:5000/query/get-stops', json={'itineraryCode' : session['selected_itinerary']})).json()
    print(session['booked_seats'])

    cursor.execute(f'''
                    SELECT DATE_FORMAT(departureDate, '%d-%m-%Y')
                   FROM ticket_t
                   WHERE ticketid = "{session['ticketId']}";
                   ''')
    
    departureDate = cursor.fetchall()[0][0]

    cursor.execute(f'''
                   SELECT CONCAT_WS(' ', CONCAT(UPPER(LEFT(firstName, 1)), 
                        MID(firstName, 2, LENGTH(firstName))), 
                        IF(LENGTH(middleName)>0, 
                        CONCAT(UPPER(LEFT(middleName, 1)), '.'), ''), 
                        CONCAT(UPPER(LEFT(lastName, 1)), 
                        MID(lastName, 2, LENGTH(lastName))))
                   FROM passenger_t p, reservation_t r
                   WHERE r.ticketId = "{session['ticketId']}"
                        AND r.passengerId = p.passengerId;
                   ''')
    
    passenger_names = cursor.fetchall()

    cursor.execute(f'''
                   SELECT UPPER(CONCAT_WS(' ', CONCAT(a.municipality, ','), a.iso_country))
                   FROM itinerary_t i, itinerary_flight_t it, flight_t f, all_airport_t a
                   WHERE i.itineraryCode = it.itineraryCode 
                    AND i.itineraryCode = "{session['selected_itinerary']}"
                    AND f.flightNo = it.flightNo
                    AND (f.source = a.iata_code 
                    OR (f.destination = a.iata_code AND it.flightOrder = i.flightCount))
                    ORDER BY it.flightOrder;
                    ''')

    municipalities = cursor.fetchall()

    # return render_template('ticket.html')
    # session['form_part_one']['to-json'] = json.loads(session['form_part_one']['to-json'])
    # session['form_part_one']['from-json'] = json.loads(session['form_part_one']['from-json'])
    return render_template('ticket.html',
                           form_part_one=session['form_part_one'],
                           stops=stops,
                           departureDate=departureDate,
                           passenger_names=passenger_names,
                           municipalities=municipalities)