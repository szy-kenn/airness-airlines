from flask import Blueprint, render_template, request, url_for, redirect, jsonify, session, flash
from . import mysql
import json
from . import skyscanner

view = Blueprint('view', __name__)

@view.route('/', methods=['GET', 'POST'])
def home():
    if request.method == 'POST':
        form_part_one = request.form
        session['form_part_one'] = form_part_one
        return redirect(url_for('.flights'))

    return render_template('home.html')

@view.route('/flights', methods=['GET', 'POST'])
def flights():
    if request.method  == 'POST':
        form_part_one = session['form_part_one']
        return jsonify(form_part_one)

    session['form_part_one']['to-json'] = json.loads(session['form_part_one']['to-json'])
    session['form_part_one']['from-json'] = json.loads(session['form_part_one']['from-json'])

    # return session['form_part_one']

    origin = session['form_part_one']['from-json']['iata'],
    destination = session['form_part_one']['to-json']['iata'],
    departure_date = session['form_part_one']['departure-date'],
    
    available_flights = skyscanner.request(origin, destination, departure_date)
    # return jsonify(available_flights)

    if available_flights[0] == 0:
        return render_template('flights.html', form_part_one=session['form_part_one'], result_count=0, error_message=available_flights[1])

    return render_template('flights.html', form_part_one=session['form_part_one'], available_flights=available_flights[1], result_count=available_flights[0])

@view.route('/selected-flight/<path:flight>', methods=['POST', 'GET'])
def selected_flight(flight):
    if request.method == 'POST':
        session['selected_flight'] = json.loads(flight)
        response = {'status': 200}
        return jsonify(response)

@view.route('/passenger-details', methods=['GET', 'POST'])
def passenger_details():
    if request.method == 'POST':

        session['form_part_one']['to-json'] = json.loads(session['form_part_one']['to-json'])
        session['form_part_one']['from-json'] = json.loads(session['form_part_one']['from-json'])

        print(session['selected_flight'])

        return render_template('passenger-details.html', selected_flight=session['selected_flight'], form_part_one=(session['form_part_one']))
    return render_template('passenger-details.html')

@view.route('/seats', methods=['GET', 'POST'])
def seats():
    if request.method == 'POST':
        return request.data
    
    return render_template('seats.html')

@view.route('/confirmation')
def confirmation():
    return render_template('ticket.html')