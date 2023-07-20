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
                    WHERE it.itineraryCode = i.itineraryCode AND it.flightOrder = 1 and f.flightNo = it.flightNo
                    ORDER BY i.itineraryCode;
                   ''')
    
    depart_time_list = cursor.fetchall()

    cursor.execute(f'''
                   SELECT TIME_FORMAT(f.eta, '%H:%i')
                   FROM itinerary_t i, itinerary_flight_t it, flight_t f
                   WHERE it.itineraryCode = i.itineraryCode AND it.flightOrder = i.flightCount and f.flightNo = it.flightNo
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
                            AND i.flightCount {'<=' if int(filters['stops']) < 2 else '>=' if int(filters['stops']) == 2 else '>='} {int(filters['stops']) + 1 if int(filters['stops']) != 3 else 0}
                            AND it.flightOrder = 1 AND f.ETD BETWEEN '{filters['departure-from']}' AND '{filters['departure-to']}'
                    ORDER BY {'basefare, i.duration' if filters['sortBy'] == 'Best' else 'basefare' if filters['sortBy'] == 'Cheapest' else 'i.duration'};
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
                   WHERE i.itineraryCode IN ({", ".join(available_flights_iata)}) AND i.itineraryCode = it.itineraryCode AND it.flightNo = f.flightNo
                        AND it.flightOrder = i.flightCount
                    ORDER BY {'basefare, i.duration' if filters['sortBy'] == 'Best' else 'basefare' if filters['sortBy'] == 'Cheapest' else 'i.duration'};
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

    try:
        return render_template('payment.html', selected_flight=session['selected_flight'], form_part_one=session['form_part_one'], booked_seats = session['booked_seats'])
    except:
        return redirect(url_for('view.seats'))

@view.route('/confirmation')
def confirmation():

    reservation = []
    all_passengers = []
    itinerary = []
    ticket = []
    seats = []

    return render_template('ticket.html')
    # session['form_part_one']['to-json'] = json.loads(session['form_part_one']['to-json'])
    # session['form_part_one']['from-json'] = json.loads(session['form_part_one']['from-json'])
    # return render_template('ticket.html',
    #                        form_part_one=session['form_part_one'],
    #                        selected_flight=session['selected_flight'], 
    #                        booked_seats=session['booked_seats'],
    #                        payment=session['payment'])