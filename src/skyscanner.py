import requests, requests_cache
import sqlite3
from . import celery
import time
from flask import jsonify

@celery.task(bind=True)
def async_request(self):
    

    # self.update_state(state='PROGRESS', 
    #                 meta={
    #                     'status': 'hello'
    #                 })
    
    return jsonify({'status': 'request completed'})

    return request(origin, destination, departure_date)

def _getSeconds(day: int):
    return day * 24 * 60 * 60

def _delete_cache(response):
    cache = requests_cache.get_cache().responses
    key_delete = ""
    for key, value in cache.items():
        if value.url == response.url:
            key_delete = key
            break
    
    if len(key_delete) > 0:
        with sqlite3.connect('api_cache.sqlite') as conn:
            cursor  = conn.cursor()
            cursor.execute(f"DELETE FROM responses WHERE key='{key_delete}'")
            try:
                conn.commit()
            except:
                print('THERE IS A PROBLEM WITH THE DB CONNECTION RIGHT NOW')

# caching api responses (cached for 1 day)
requests_cache.install_cache('api_cache', expire_after=_getSeconds(60)) 

def request(origin, destination, departure_date) -> tuple:
    # url = "https://skyscanner44.p.rapidapi.com/search"

    url = "https://skyscanner44.p.rapidapi.com/search-extended"

    querystring = {
        "adults":"1",
        "origin": origin,
        "destination": destination,
        "departureDate": departure_date,
        "currency":"PHP",
        "stops":"0,1,2",
        "duration":"50",
        "startFrom":"00:00",
        "arriveTo":"23:59",
        "returnStartFrom":"00:00",
        "returnArriveTo":"23:59",
        "locale":"en-GB",
        "market":"PH"}

    # querystring = {
    #     "adults": 1,
    #     "origin": origin,
    #     "destination": destination,
    #     "departureDate": departure_date,
    #     "currency":"PHP",
    #     "locale":"en-GB",
    #     "market":"PH"}

    headers = {
	    "X-RapidAPI-Key": "fd32d46d08msh3e5a5981b4f2bc5p13a8a7jsn21617cfcf8cf", # unique key
	    "X-RapidAPI-Host": "skyscanner44.p.rapidapi.com"
    }

    try:
        response = requests.get(url, headers=headers, params=querystring)
        skyscanner_response = response.json()
        try:
            status = skyscanner_response['context']['status']
            if (status == 'incomplete'):
                _delete_cache(response)
        except:
            return (0, ('Bad Request', 'Try a different date or check all your inputs again.'))
    except Exception as error:
        print(error)
        return (0, ('Network Error', 'There seems to be a problem with your connection right now.'))
    # return skyscanner_response

    if len(skyscanner_response['itineraries']['results']) == 0:
        return (0, ('No Results Found', 'Try a different departure date.'))

    best = skyscanner_response['itineraries']['results']

    available_flights = {
        "best" : [],
        "status": skyscanner_response['context']['status'],
        "totalResults": len(best)
    }

    i = 0
    while True:
        try:
            result = best[i]
            key = 'best'
        except:
            break
    
        available_flights[key].append({})
        available_flights[key][i]['arrival_time']       = result['legs'][0]['arrival']
        available_flights[key][i]['departure_time']     = result['legs'][0]['departure']   
        available_flights[key][i]['duration_in_mins']   = result['legs'][0]['durationInMinutes']  
        available_flights[key][i]['stop_count']         = result['legs'][0]['stopCount']  
        available_flights[key][i]['price']              = result['pricing_options'][0]['price']['amount']
        available_flights[key][i]['stops']              = []

        for j in range(len(result['legs'][0]['segments'])):
            available_flights[key][i]['stops'].append({})
            available_flights[key][i]['stops'][j]['arrival_time']                  = result['legs'][0]['segments'][j]['arrival']
            available_flights[key][i]['stops'][j]['departure_time']                = result['legs'][0]['segments'][j]['departure']
            available_flights[key][i]['stops'][j]['duration']                      = result['legs'][0]['segments'][j]['durationInMinutes']
            available_flights[key][i]['stops'][j]['marketing_carrier']             = result['legs'][0]['segments'][j]['marketingCarrier']['name']
            available_flights[key][i]['stops'][j]['flight_number']                 = result['legs'][0]['segments'][j]['marketingCarrier']['alternate_di'] + result['legs'][0]['segments'][j]['flightNumber']

            available_flights[key][i]['stops'][j]['destination']                   = {} 
            available_flights[key][i]['stops'][j]['destination']['iata']           = result['legs'][0]['segments'][j]['destination']['flightPlaceId']
            available_flights[key][i]['stops'][j]['destination']['name']           = result['legs'][0]['segments'][j]['destination']['name'] + ' ' + result['legs'][0]['segments'][j]['destination']['type']
            available_flights[key][i]['stops'][j]['destination']['municipality']   = result['legs'][0]['segments'][j]['destination']['parent']['name']
            
            available_flights[key][i]['stops'][j]['origin']                        = {} 
            available_flights[key][i]['stops'][j]['origin']['iata']                = result['legs'][0]['segments'][j]['origin']['flightPlaceId']
            available_flights[key][i]['stops'][j]['origin']['name']                = result['legs'][0]['segments'][j]['origin']['name'] + ' ' + result['legs'][0]['segments'][j]['origin']['type']
            available_flights[key][i]['stops'][j]['origin']['municipality']        = result['legs'][0]['segments'][j]['origin']['parent']['name']

        i+=1
    return (i, available_flights)

    # skyscanner_response['itineraries']['buckets'][0/1/2] => best / cheapest / fastest
    # => ['items'][0-n] results in best/cheaptest/fastest
    # => ['legs']

    # arrival_time = skyscanner_response['itineraries']['buckets'][0]['items'][0]['legs'][0]['arrival'] 
    # departure_time = skyscanner_response['itineraries']['buckets'][0]['items'][0]['legs'][0]['departure']
    # destination = skyscanner_response['itineraries']['buckets'][0]['items'][0]['legs'][0]['destination']
    # duration_in_mins = skyscanner_response['itineraries']['buckets'][0]['items'][0]['legs'][0]['durationInMinutes']
    # segments = skyscanner_response['itineraries']['buckets'][0]['items'][0]['legs'][0]['segments'] # stops
    # stop_count = skyscanner_response['itineraries']['buckets'][0]['items'][0]['legs'][0]['stopCount']
    # price = skyscanner_response['itineraries']['buckets'][0]['items'][0]['price']['raw']