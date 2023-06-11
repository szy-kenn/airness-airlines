from flask import Blueprint, render_template, request
from . import mysql

view = Blueprint('view', __name__)

@view.route('/')
def home():
    return render_template('home.html')