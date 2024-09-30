from flask import jsonify, request
from app import app, db
from app.models.UserCreationModels import UserCreation  
from flask_jwt_extended import create_access_token
from sqlalchemy.exc import SQLAlchemyError
import os

# Get the base URL from environment variables
API_URL = os.getenv('API_URL')

@app.route(API_URL+'/getAllUsers', methods=['GET'])
def get_all_user_creations():
    try:
        user_creations = UserCreation.query.all()
        return jsonify([user_creation.as_dict() for user_creation in user_creations]), 200
    except SQLAlchemyError as e:
        print('Error fetching user creations:', e)
        return jsonify({'error': 'Internal server error'}), 500

@app.route(API_URL+'/get-lastUserCode', methods=['GET'])
def get_last_user_creation_code():
    try:
        last_user_creation_code = db.session.query(UserCreation).order_by(UserCreation.user_code.desc()).first()
        return jsonify({'lastUserCreation': last_user_creation_code.user_code if last_user_creation_code else None}), 200
    except SQLAlchemyError as e:
        print(e)
        return jsonify({'error': 'Internal server error'}), 500

@app.route(API_URL+'/getlastUserData', methods=['GET'])
def get_last_user_creation():
    try:
        last_user_creation = UserCreation.query.order_by(UserCreation.user_code.desc()).first()
        return jsonify({'lastUserCreation': last_user_creation.as_dict() if last_user_creation else None}), 200
    except SQLAlchemyError as e:
        print(e)
        return jsonify({'error': 'Internal server error'}), 500

@app.route(API_URL+'/user_creations', methods=['POST'])
def create_user_creation():
    try:
        data = request.get_json()
        new_user = UserCreation(
            user_name=data.get('User_Name'),
            mobile_no=data.get('Mobile_No'),
            email=data.get('Email'),
            password=data.get('Password'),
            user_type=data.get('User_Type')
        )
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'User creation successful'}), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        print(e)
        return jsonify({'error': 'Internal server error'}), 500

@app.route(API_URL + '/user_update', methods=['PUT'])
def update_user_creation():
    try:
        # Get user_code from query parameters
        user_code = request.args.get('user_code')
        
        if user_code is None:
            return jsonify({'error': 'User code is required'}), 400
        
        user = UserCreation.query.get(user_code)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        user.user_name = data.get('User_Name', user.user_name)  # Keep existing if not provided
        user.mobile_no = data.get('Mobile_No', user.mobile_no)
        user.email = data.get('Email', user.email)
        user.password = data.get('Password', user.password)
        user.user_type = data.get('User_Type', user.user_type)
        
        db.session.commit()
        return jsonify({'message': 'User update successful'}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        print(e)
        return jsonify({'error': 'Internal server error'}), 500


@app.route(API_URL+'/user_delete', methods=['DELETE'])
def delete_user_creation():
    try:
        # Get user_code from query parameters
        user_code = request.args.get('user_code')
        
        if user_code is None:
            return jsonify({'error': 'User code is required'}), 400
        
        user = UserCreation.query.get(user_code)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'User deletion successful'}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        print(e)
        return jsonify({'error': 'Internal server error'}), 500


@app.route(API_URL+'/loginuser', methods=['POST'])
def login_user():
    data = request.get_json()
    username = data.get('User_Name')
    password = data.get('User_Password')

    user = UserCreation.query.filter_by(user_name=username, password=password).first()
    if user:
        access_token = create_access_token(identity=user.user_code)
        return jsonify({'token': access_token, 'user_type': user.user_type, 'user_name': user.user_name}), 200
    return jsonify({'error': 'Invalid username or password'}), 401

@app.route(API_URL+'/get-first-navigation', methods=['GET'])
def get_first_navigation():
    try:
        first_user_creation = UserCreation.query.order_by(UserCreation.user_code.asc()).first()
        return jsonify({'firstUserCreation': first_user_creation.as_dict() if first_user_creation else None}), 200
    except SQLAlchemyError as e:
        print(e)
        return jsonify({'error': 'Internal server error'}), 500

@app.route(API_URL+'/get-last-navigation', methods=['GET'])
def get_last_navigation():
    try:
        last_user_creation = UserCreation.query.order_by(UserCreation.user_code.desc()).first()
        return jsonify({'lastUserCreation': last_user_creation.as_dict() if last_user_creation else None}), 200
    except SQLAlchemyError as e:
        print(e)
        return jsonify({'error': 'Internal server error'}), 500

@app.route(API_URL + '/get_previous_navigation', methods=['GET'])
def get_previous_navigation():
    # Get the current_user_code from the query parameters
    current_user_code = request.args.get('current_user_code')
    
    if current_user_code is None:
        return jsonify({'error': 'current_user_code is required'}), 400

    try:
        previous_user_creation = UserCreation.query.filter(
            UserCreation.user_code < current_user_code
        ).order_by(UserCreation.user_code.desc()).first()

        return jsonify({'previousUserCreation': previous_user_creation.as_dict() if previous_user_creation else None}), 200
    except SQLAlchemyError as e:
        print(e)
        return jsonify({'error': 'Internal server error'}), 500
    


@app.route(API_URL + '/get_next_navigation', methods=['GET'])
def get_next_navigation():
    # Get the current_user_code from the query parameters
    current_user_code = request.args.get('current_user_code')
    
    if current_user_code is None:
        return jsonify({'error': 'current_user_code is required'}), 400

    try:
        next_user_creation = UserCreation.query.filter(
            UserCreation.user_code > current_user_code
        ).order_by(UserCreation.user_code.asc()).first()

        return jsonify({'nextUserCreation': next_user_creation.as_dict() if next_user_creation else None}), 200
    except SQLAlchemyError as e:
        print(e)
        return jsonify({'error': 'Internal server error'}), 500

