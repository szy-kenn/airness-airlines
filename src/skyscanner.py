import requests, requests_cache
import sqlite3
from flask import session
from . import mysql
from .query import primary_key

class Skyscanner:
    def __init__(self) -> None:
        self.url_extended = "https://skyscanner44.p.rapidapi.com/search-extended"
        self.url = "https://skyscanner44.p.rapidapi.com/search"
        
        self.querystring_extended = {
            "adults":"1",
            "origin": None,
            "destination": None,
            "departureDate": None,
            "currency":"PHP",
            "stops":"0,1,2",
            "duration":"50",
            "startFrom":"00:00",
            "arriveTo":"23:59",
            "returnStartFrom":"00:00",
            "returnArriveTo":"23:59",
            "locale":"en-GB",
            "market":"PH"}

        self.querystring = {
            "adults": 1,
            "origin": None,
            "destination": None,
            "departureDate": None,
            "currency":"PHP",
            "locale":"en-GB",
            "market":"PH"}

    @property
    def _cache(self):
        return requests_cache.get_cache().responses

    def _getSeconds(self, day: int):
        return day * 24 * 60 * 60

    def _delete_cache(self, response):
        print("deleting")
        cache = self._cache
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
                    print("deleted")
                except:
                    print('THERE IS A PROBLEM WITH THE DB CONNECTION RIGHT NOW')

    def post_itinerary(self):
        
        pass

    def request(self, origin, destination, departure_date) -> tuple:

        headers = {
            "X-RapidAPI-Key": "a5ac9eda9cmsh534816737785f1bp15fabdjsn04779416bc84", # unique key
            "X-RapidAPI-Host": "skyscanner44.p.rapidapi.com"
        }

        self.querystring_extended['origin'] = origin
        self.querystring_extended['destination'] = destination
        self.querystring_extended['departureDate'] = departure_date

        try:
            response = requests.get(self.url_extended, headers=headers, params=self.querystring_extended)
            skyscanner_response = response.json()
            try:
                status = skyscanner_response['context']['status']
                if (status == 'incomplete'):
                    requests.post('http://127.0.0.1:5000/query/post-flight', json=skyscanner_response)
                    self._delete_cache(response)
                elif status == 'complete':
                    requests.post('http://127.0.0.1:5000/query/post-flight', json=skyscanner_response)
            except:
                print(skyscanner_response)
                return (0, ('Bad Request', skyscanner_response['message']))
            
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

        cur = mysql.connection.cursor()
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

            stops = []
            for stop in available_flights[key][i]['stops']:
                stops.append('"' + stop['flight_number'] + '"')

            cur.execute(f'''
                        SELECT I.itineraryCode, COUNT(DISTINCT I.itineraryCode)
                        FROM itinerary_flight_t T, itinerary_t I, flight_t F
                        WHERE T.flightNo IN ({', '.join(stops)}) AND T.itineraryCode = I.itineraryCode 
                            AND I.source = '{session['form_part_one']['from-json']['iata']}' 
                            AND I.destination = '{session['form_part_one']['to-json']['iata']}' 
                            AND I.flightCount = {available_flights[key][i]['stop_count'] + 1}
                        GROUP BY I.itineraryCode;
                        ''')
            
            result = cur.fetchall()
            if len(result) == 0:
                print("addibng")

                itineraryCode = primary_key('I', 'itineraryCode', 'itinerary_flight_t', 5)

                cur.execute(f"""
                            INSERT INTO itinerary_t(
                                itineraryCode, source, destination, flightCount, duration, price
                            ) VALUES(
                                "{itineraryCode}",
                                "{session['form_part_one']['from-json']['iata']}", 
                                "{session['form_part_one']['to-json']['iata']}",
                                {available_flights[key][i]['stop_count'] + 1},
                                {available_flights[key][i]['duration_in_mins']},
                                {available_flights[key][i]['price']}
                            );
                            """)
                
                # insert
                for idx, flight_no in enumerate(stops):
                    cur.execute(f"""
                                INSERT INTO itinerary_flight_t(
                                    itineraryCode, flightNo, flightOrder
                                ) VALUES (
                                    "{itineraryCode}", "{flight_no.strip('"')}", {idx+1}
                                );
                                """)
                    
            mysql.connection.commit()
            i+=1

        # GET ALL AVAILABLE ITINERARIES
        cursor = mysql.connection.cursor()
        # cursor.execute(f'''
        #             SELECT *
        #             FROM itinerary_t i
        #             WHERE i.source = '{origin}' AND i.destination = '{destination}';
        #             ''')
        cursor.execute(f'''
                        SELECT *
                        FROM itinerary_t I
                        WHERE (I.source = '{origin}' AND I.destination = '{destination}')
                        ORDER BY I.itineraryCode;
                        ''')
    
        return (cursor.fetchall())

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

skyscanner = Skyscanner()

# caching api responses (cached for 60 days)
requests_cache.install_cache('api_cache', expire_after=skyscanner._getSeconds(60)) 