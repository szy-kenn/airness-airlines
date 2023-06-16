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
        form_part_one = session['form_part_one']
        return jsonify(form_part_one)

    session['form_part_one']['to-json'] = json.loads(session['form_part_one']['to-json']);
    session['form_part_one']['from-json'] = json.loads(session['form_part_one']['from-json']);
    # return session['form_part_one']
    return render_template('flights.html', form_part_one=session['form_part_one'])