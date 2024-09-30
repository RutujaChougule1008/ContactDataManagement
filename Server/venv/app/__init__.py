# app.py
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv
import os
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# Set the database URI using environment variables
app.config['SQLALCHEMY_DATABASE_URI'] = f"mssql+pymssql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}/{os.getenv('DB_NAME')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Initialize JWTManager with your app 
app.config['JWT_SECRET_KEY'] = 'ABCEFGHIJKLMNOPQRSTUVWXYZ'
jwt = JWTManager(app)

from app.Controllers.ContactDataController import *
from app.Controllers.EventGroup.EventGroupController import *
from app.Controllers.Login.LoginController import *
from app.Controllers.UserCreationController import *



if __name__ == '__main__':
    app.run(app, host='localhost', port=8080, debug=True)
