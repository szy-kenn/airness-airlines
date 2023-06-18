from flask import Blueprint, render_template, request, url_for, redirect, jsonify, session, flash
from . import mysql
import json
import requests
from . import skyscanner, celery

view = Blueprint('view', __name__)

@view.route('/', methods=['GET', 'POST'])
def home():
    if request.method == 'POST':
        form_part_one = request.form
        session['form_part_one'] = form_part_one
        return redirect(url_for('.flights'))

    return render_template('home.html')

@view.route('/update-result', methods=['POST'])
def update():
    data = request.get_json(force=True)
    # response = skyscanner.async_request.apply_async(
    #     args=[data['origin'], data['destination'], data['departure_date']], 
    #     countdown=1)
    response = skyscanner.async_request.delay()
    print("UPDATE", response.id)
    # print("IN UPDATE")
    return jsonify({'task_id': response.id}), 202, 

# @view.route('/update-result', methods=['POST'])
# def _update(origin, destination, departure_date):
#     response = skyscanner.async_request.apply_async(args=[origin, destination, departure_date], countdown=35)
#     return jsonify(response)

@view.route('/updated/<task_id>')
def updated(task_id):
    task = skyscanner.async_request.AsyncResult(task_id)
    # return str(task.get())
    return str(task.state)
    # if task.state == 'PENDING':
    #     return task.state
    # else:
    #     return "not pending"

@view.route('/flights', methods=['GET'])
def flights():

    session['form_part_one']['to-json'] = json.loads(session['form_part_one']['to-json']);
    session['form_part_one']['from-json'] = json.loads(session['form_part_one']['from-json']);

    # return session['form_part_one']
    origin = session['form_part_one']['from-json']['iata'],
    destination = session['form_part_one']['to-json']['iata'],
    departure_date = session['form_part_one']['departure-date'],
    
    available_flights = skyscanner.request(origin, destination, departure_date)    
    # return jsonify(available_flights)
    try:
        if (available_flights[1]['status'] == 'incomplete'):
                message = {
                    'origin': origin,
                    'destination': destination,
                    'departure_date': departure_date
                    }
                res = requests.post('http://127.0.0.1:5000/update-result', json=message)
                print("res: ", res['Location'])

    except:
        if available_flights[0] == 0:
            # if (available_flights[1][0] == 'No Results Found'):
            message = {
                'origin': origin,
                'destination': destination,
                'departure_date': departure_date
                }
            res = requests.post('http://127.0.0.1:5000/update-result', json=message)
            print("AVAILABLE", res.content.decode('utf-8'))
            return redirect(url_for('view.updated', task_id=res.json().get('task_id')))
            # return redirect(url_for('view.updated', task_id=res.id))
            
            # return render_template('flights.html', form_part_one=session['form_part_one'], result_count=0, error_message=available_flights[1])

    return render_template('flights.html', form_part_one=session['form_part_one'], available_flights=available_flights[1], result_count=available_flights[0])

@view.route('/selected-flight/<path:flight>', methods=['POST', 'GET'])
def selected_flight(flight):
    if request.method == 'POST':
        session['selected_flight'] = json.loads(flight)
        response = {'status': 200}
        return jsonify(response)

@view.route('/passenger-details')
def passenger_details():

    return render_template('passenger-details.html')

@view.route('/seats')
def seats():
    return render_template('seats.html')

@view.route('/confirmation')
def confirmation():
    return render_template('ticket.html')