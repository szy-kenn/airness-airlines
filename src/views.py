from flask import Blueprint, render_template, request, url_for, redirect
from . import mysql

view = Blueprint('view', __name__)

@view.route('/', methods=['GET', 'POST'])
def home():
    if request.method == 'POST':
        passenger_count_form = request.form
        adult_count = passenger_count_form.get('passenger-adult')
        child_count = passenger_count_form.get('passenger-children')
        infant_count = passenger_count_form.get('passenger-infant')
        return redirect(url_for('view.flights'))

    return render_template('home.html')

@view.route('/flights')
def flights():
    return 'flights'
