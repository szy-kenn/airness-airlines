import requests, requests_cache

# caching api responses (cached for 1 day)
requests_cache.install_cache('api_cache', expire_after=86400) 

def request(origin, destination, departure_date) -> tuple:

    url = "https://skyscanner44.p.rapidapi.com/search"
    querystring = {
        "adults": 1,
        "origin": origin,
        "destination": destination,
        "departureDate": departure_date,
        "currency":"PHP",
        "locale":"en-GB",
        "market":"PH"}

    headers = {
	    "X-RapidAPI-Key": "fd32d46d08msh3e5a5981b4f2bc5p13a8a7jsn21617cfcf8cf", # unique key
	    "X-RapidAPI-Host": "skyscanner44.p.rapidapi.com"
    }

    response = requests.get(url, headers=headers, params=querystring)
    skyscanner_response = response.json()

    try:
        total_results = skyscanner_response['context']['totalResults']
        if total_results == 0:
            return (0, ('No Results Found.', 'Try a different departure date.'))
    except:
        return (0, ('Bad Request.', 'Try a different date or check all your inputs again.'))

    best = skyscanner_response['itineraries']['buckets'][0]

    available_flights = {
        "best" : []
    }

    i = 0
    while True:
        try:
            result = best['items'][i]
            key = 'best'
        except:
            break
    
        available_flights[key].append({})
        available_flights[key][i]['arrival_time']       = result['legs'][0]['arrival']
        available_flights[key][i]['departure_time']     = result['legs'][0]['departure']   
        available_flights[key][i]['duration_in_mins']   = result['legs'][0]['durationInMinutes']  
        available_flights[key][i]['stop_count']         = result['legs'][0]['stopCount']  
        available_flights[key][i]['price']              = result['price']['raw'] 
        available_flights[key][i]['stops']              = []

        for j in range(len(result['legs'][0]['segments'])):
            available_flights[key][i]['stops'].append({})
            available_flights[key][i]['stops'][j]['arrival_time']                  = result['legs'][0]['segments'][i]['arrival']
            available_flights[key][i]['stops'][j]['departure_time']                = result['legs'][0]['segments'][i]['departure']
            available_flights[key][i]['stops'][j]['duration']                      = result['legs'][0]['segments'][i]['durationInMinutes']
            available_flights[key][i]['stops'][j]['flight_number']                 = result['legs'][0]['segments'][i]['flightNumber']

            available_flights[key][i]['stops'][j]['destination']                   = {} 
            available_flights[key][i]['stops'][j]['destination']['iata']           = result['legs'][0]['segments'][i]['destination']['displayCode']
            available_flights[key][i]['stops'][j]['destination']['name']           = result['legs'][0]['segments'][i]['destination']['name']
            available_flights[key][i]['stops'][j]['destination']['municipality']   = result['legs'][0]['segments'][i]['destination']['parent']['name']
            
            available_flights[key][i]['stops'][j]['origin']                        = {} 
            available_flights[key][i]['stops'][j]['origin']['iata']                = result['legs'][0]['segments'][i]['origin']['displayCode']
            available_flights[key][i]['stops'][j]['origin']['name']                = result['legs'][0]['segments'][i]['origin']['name']
            available_flights[key][i]['stops'][j]['origin']['municipality']        = result['legs'][0]['segments'][i]['origin']['parent']['name']

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