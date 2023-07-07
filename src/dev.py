from flask import Blueprint, render_template
from . import query

dev = Blueprint('dev', __name__)

@dev.route('/search')
def search():
    return render_template('search_flight.html')