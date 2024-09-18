from flask import jsonify, request
from app import app, db
from app.models.LoginModels import UserLogin
from flask_jwt_extended import create_access_token
import os

# Get the base URL from environment variables
API_URL = os.getenv('API_URL')

@app.route(API_URL + "/userlogin", methods=['POST'])
def userlogin():
    # Parse login credentials from JSON request data
    login_data = request.get_json()
    if not login_data:
        return jsonify({'error': 'No data provided'}), 400

    # Retrieve user name and password from the request data
    login_name = login_data.get('User_Name')
    password = login_data.get('User_Password')

    # Validate that the necessary data is present
    if not login_name or not password:
        return jsonify({'error': 'Both username and password are required'}), 400

    # Check if user exists in the database
    user = UserLogin.query.filter_by(User_Name=login_name).first()
    if user is None:
        return jsonify({'error': 'User not found'}), 404

    # Check if the password is correct
    if user.User_Password != password:
        return jsonify({'error': 'Invalid login credentials'}), 401

    # Generate a JWT token
    access_token = create_access_token(identity=user.uid)

    # If the credentials are correct, respond with a success message and JWT token
    return jsonify({'message': 'Login successful', 'access_token': access_token}), 200
