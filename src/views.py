from flask import Blueprint, render_template, request, url_for, redirect, jsonify, session, flash
from . import mysql
import json

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
        form1Data = session['form_part_one']
        return jsonify(form1Data)

        # if form1Data['from'] == '' or form1Data['to'] == '' or form1Data['passenger-adult'] == 0:
        #     flash('Fields are not completed')
        #     return redirect(url_for('.home'))

        return session['form_part_one']
    
    return session['form_part_one']