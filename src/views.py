from flask import Blueprint, render_template, request, url_for, redirect, jsonify, session
from . import mysql
import json

view = Blueprint('view', __name__)

@view.route('/', methods=['GET', 'POST'])
def home():
    if request.method == 'POST':
        form_part_one = request.form
        session['form_part_one'] = form_part_one
        # adult_count = form_part_one.get('passenger-adult')
        # child_count = form_part_one.get('passenger-children')
        # infant_count = form_part_one.get('passenger-infant')
        return redirect(url_for('.flights'))

    return render_template('home.html')

@view.route('/flights', methods=['GET', 'POST'])
def flights():
    return session['form_part_one']
    # form_part_one = request.args.get('form_part_one')
    # return 'flights'
