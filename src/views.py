from flask import Blueprint, render_template, request, url_for, redirect, jsonify, session, flash
from . import mysql
import json
import requests, requests_cache

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

    session['form_part_one']['to-json'] = json.loads(session['form_part_one']['to-json']);
    session['form_part_one']['from-json'] = json.loads(session['form_part_one']['from-json']);

    # return session['form_part_one']
    '''
    For Skyscanner API integration:
    '''
    url = "https://skyscanner44.p.rapidapi.com/search"
    querystring = {
        "adults":session['form_part_one']['passenger-adult'],
        "origin":session['form_part_one']['to-json']['iata'],
        "destination":session['form_part_one']['from-json']['iata'],
        "departureDate":session['form_part_one']['departure-date'],
        "currency":"PHP",
        "locale":"en-GB",
        "market":"PH"}

    headers = {
        "X-RapidAPI-Key": "a5ac9eda9cmsh534816737785f1bp15fabdjsn04779416bc84",
        "X-RapidAPI-Host": "skyscanner44.p.rapidapi.com"
    }

    requests_cache.install_cache('api_cache', expire_after=200)

    response = requests.get(url, headers=headers, params=querystring)
    skyscanner_response = response.json()
    
    # return skyscanner_response

    total_results = 0

    try:
        total_results = skyscanner_response['context']['totalResults']   
    except:
        return render_template('flights.html', form_part_one=session['form_part_one'], result_count=0, error_message=['Bad Request.', 'Try a different date or check all your inputs again.'])

    # skyscanner_response['itineraries']['buckets'][0/1/2] => best / cheapest / fastest
        # => ['items'][0-n] results in best/cheaptest/fastest
        # => ['legs']

    if total_results == 0:
        return render_template('flights.html', form_part_one=session['form_part_one'], result_count=0, error_message=['No Results Found.', 'Try a different departure date.'])

    arrival_time = skyscanner_response['itineraries']['buckets'][0]['items'][0]['legs'][0]['arrival'] 
    departure_time = skyscanner_response['itineraries']['buckets'][0]['items'][0]['legs'][0]['departure']
    destination = skyscanner_response['itineraries']['buckets'][0]['items'][0]['legs'][0]['destination']
    duraiton_in_mins = skyscanner_response['itineraries']['buckets'][0]['items'][0]['legs'][0]['durationInMinutes']
    segments = skyscanner_response['itineraries']['buckets'][0]['items'][0]['legs'][0]['segments'] # stops
    stop_count = skyscanner_response['itineraries']['buckets'][0]['items'][0]['legs'][0]['stopCount']
    price = skyscanner_response['itineraries']['buckets'][0]['items'][0]['price']['raw']

    best = skyscanner_response['itineraries']['buckets'][0]
    cheapest = skyscanner_response['itineraries']['buckets'][1]
    fastest = skyscanner_response['itineraries']['buckets'][2]

    available_flights = {
        "best" : [],
        "cheapest" : [],
        "fastest" : []
    }

    for h in range(3):
        i = 0
        
        while True:

            try:
                if (h == 0):
                    result = best['items'][i]
                    key = 'best'
                elif (h == 1):
                    result = cheapest['items'][i]
                    key = 'cheapest'
                else:
                    result = fastest['items'][i]
                    key = 'fastest'
            except:
                break

            print(key)
        
            available_flights[key].append({})
            available_flights[key][i]['arrival_time'] = result['legs'][0]['arrival']
            available_flights[key][i]['departure_time'] = result['legs'][0]['departure']  
            available_flights[key][i]['segments'] = result['legs'][0]['segments']  
            available_flights[key][i]['duration_in_mins'] = result['legs'][0]['durationInMinutes']  
            available_flights[key][i]['stop_count'] = result['legs'][0]['stopCount']  
            available_flights[key][i]['price'] = result['price']['raw'] 
            i+=1


    # available_flights = {
    #     "best" : {
    #         "arrival_time" : best['items'][0]['legs'][0]['arrival'],
    #         "departure_time" : best['items'][0]['legs'][0]['departure'],
    #         "destination" : best['items'][0]['legs'][0]['destination'],
    #         "duration_in_mins" : best['items'][0]['legs'][0]['durationInMinutes'],
    #         # "segments" : best['items'][0]['legs'][0]['segments'], # stops
    #         "stop_count" : best['items'][0]['legs'][0]['stopCount'],
    #         "price" : best['items'][0]['price']['raw'] 
    #     }
    # }

    # return jsonify(available_flights)
    return render_template('flights.html', form_part_one=session['form_part_one'], available_flights=available_flights, result_count=i)