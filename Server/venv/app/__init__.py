# app.py
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv
import os
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO
from datetime import datetime
import subprocess
import urllib.parse
import re



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

API_URL = os.getenv('API_URL')

@app.route(f"{API_URL}/backup", methods=['POST'])
def backup_database():
    try:
        server_name = os.getenv('DB_HOST')
        database_name = os.getenv('DB_NAME')
        username = os.getenv('DB_USER')
        password = os.getenv('DB_PASSWORD')

        # Check if password seems to be URL-encoded (contains % followed by two hexadecimal digits)
        if re.search(r'%[0-9a-fA-F]{2}', password):
            decoded_password = urllib.parse.unquote(password)
        else:
            decoded_password = password  # Use the password as is if it doesn't appear to be encoded

        print(decoded_password)  # Output for debugging: decoded or original password

        # Ensure the backup directory exists
        backup_directory = "D:\\Lata Software\\Client Connect\\Database Backup\\Backup"
        if not os.path.exists(backup_directory):
            os.makedirs(backup_directory, exist_ok=True)

        # Format the backup filename with the current timestamp
        backup_filename = f"{backup_directory}\\clientConnect-{datetime.now().strftime('%Y%m%d%H%M%S')}.bak"

        # Construct the sqlcmd command
        sqlcmd = [
            "sqlcmd",
            "-S", server_name,
            "-d", database_name,
            "-U", username,
            "-P", decoded_password,
            "-Q", f"BACKUP DATABASE [{database_name}] TO DISK = '{backup_filename}' WITH NOFORMAT, INIT, NAME = 'Full Backup of {database_name}', SKIP, NOREWIND, NOUNLOAD, STATS = 10"
        ]

        # Execute the command
        result = subprocess.run(sqlcmd, text=True, capture_output=True)

        # Check if the command was successful
        if result.returncode == 0:
            return jsonify({'success': True, 'message': 'Database backup successful', 'backupFileName': backup_filename}), 200
        else:
            raise Exception(result.stderr)

    except Exception as e:
        return jsonify({'success': False, 'message': 'Database backup failed', 'error': str(e)}), 500



if __name__ == '__main__':
    app.run(app, host='localhost', port=8080, debug=True)
