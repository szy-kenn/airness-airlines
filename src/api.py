from flask import Blueprint, render_template, request, url_for, redirect, jsonify
import pandas as pd

api = Blueprint('api', __name__)

@api.route('/iata-codes')
def iata():
    # encoding="ISO-8859-1"
    dataframe = pd.read_csv("data.csv")
    
    # available_terminals = [
    #     'DPS', 'BKK', 'PEK', 'BNE', 'PUS',
    #     'CEB', 'CRK', 'DMM', 'DOH', 'DXB',
    #     'DVO', 'FUK', 'GUM', 'GES', 'CAN',
    #     'HAN', 'SGN', 'HKG', 'HNL', 'CGK',
    #     'KLO', 'KUL', 'LAX', 'MFM', 'MEL',
    #     'NGO', 'JFK', 'KIX', 'PER', 'PNH',
    #     'POM', 'JJN', 'RUH', 'SFO', 'CTS',
    #     'ICN', 'PVG', 'SIN', 'SYD', 'TPE',
    #     'HND', 'NRT', 'YYZ', 'YVR', 'XMN',
    #     'MNL', 'EUQ', 'BCD', 'BSO', 'USU',
    #     'BXU', 'CGY', 'CYP', 'CGM', 'CRM',
    #     'MPH', 'CBO', 'CRK', 'DVO', 'DPL',
    #     'DGT', 'GES', 'ILO', 'KLO', 'LAO',
    #     'DRP', 'OZC', 'PAG', 'PPS', 'RXS',
    #     'SWL', 'IAO', 'TAC', 'TAG', 'ZAM',
    #     'TWT']

    # # df = pd.DataFrame()
    # for idx, iata in enumerate(dataframe['iata_code']):
    #     if iata in available_terminals:
    #         results[iata] = (dataframe['name'][idx],
    #                          dataframe['iso_country'][idx],
    #                          dataframe['municipality'][idx])
            
    # values = list(results.values())
    # names = []
    # iso_country = []
    # municipality = []
    # for value in values:
    #     names.append(value[0])
    #     iso_country.append(value[1])
    #     municipality.append(value[2])

    # df = pd.DataFrame({'iata': results.keys(), 
    #                    'name': names,
    #                    'iso_country': iso_country,
    #                    'municipality': municipality});
    # df.to_csv('data.csv');

    return dataframe.to_json()
    # return render_template('api.html', results=results)