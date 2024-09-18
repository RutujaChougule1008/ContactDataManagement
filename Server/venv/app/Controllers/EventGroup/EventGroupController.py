from flask import Flask, jsonify, request
from app import app, db
import requests
from sqlalchemy import text, func
from sqlalchemy.exc import SQLAlchemyError
import os

from app.models.EventGroup.EventGroupModel import EventGroup

# Get the base URL from environment variables
API_URL = os.getenv('API_URL')

@app.route(API_URL + "/event_groups", methods=['GET'])
def get_event_groups():
    event_groups = EventGroup.query.all()
    event_group_data = [
        {column.name: getattr(event, column.name) for column in event.__table__.columns}
        for event in event_groups
    ]
    return jsonify(event_group_data)

@app.route(API_URL + "/create-eventgroup", methods=["POST"])
def create_eventgroup():
    try:
        data = request.json
        event_name = data.get('eventName')
        
        if not event_name:
            return jsonify({'error': 'Missing eventName parameter'}), 400

        new_event = EventGroup(eventName=event_name)
        db.session.add(new_event)
        db.session.commit()

        new_record_data = {column.name: getattr(new_event, column.name) for column in new_event.__table__.columns}
        return jsonify({'message': 'EventGroup created successfully', 'record': new_record_data}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route(API_URL + "/get-eventgroup", methods=["GET"])
def get_eventgroup():
    event_code = request.args.get('event_code', type=int)
    if not event_code:
        return jsonify({'error': 'Missing event_code parameter'}), 400
    
    try:
        record = EventGroup.query.filter_by(eventCode=event_code).first()
        if not record:
            return jsonify({'error': 'EventGroup record not found'}), 404

        record_data = {column.name: getattr(record, column.name) for column in record.__table__.columns}
        return jsonify(record_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route(API_URL + "/update-eventgroup", methods=["PUT"])
def update_eventgroup():
    event_code = request.args.get('event_code', type=int)
    if not event_code:
        return jsonify({'error': 'Missing event_code parameter'}), 400
    
    try:
        update_data = request.json
        event_name = update_data.get('eventName')
        if not event_name:
            return jsonify({'error': 'Missing eventName parameter'}), 400

        record = EventGroup.query.filter_by(eventCode=event_code).first()
        if not record:
            return jsonify({'error': 'EventGroup record not found'}), 404

        record.eventName = event_name
        db.session.commit()

        updated_record_data = {column.name: getattr(record, column.name) for column in record.__table__.columns}
        return jsonify({'message': 'EventGroup updated successfully', 'record': updated_record_data}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route(API_URL + "/delete-eventgroup", methods=["DELETE"])
def delete_eventgroup():
    event_code = request.args.get('event_code', type=int)
    if not event_code:
        return jsonify({'error': 'Missing event_code parameter'}), 400

    try:
        record = EventGroup.query.filter_by(eventCode=event_code).first()
        if not record:
            return jsonify({'error': 'EventGroup record not found'}), 404

        db.session.delete(record)
        db.session.commit()
        return jsonify({'message': 'EventGroup deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route(API_URL + "/get-first-eventgroup", methods=["GET"])
def get_first_eventgroup():
    try:
        first_record = EventGroup.query.order_by(EventGroup.eventCode.asc()).first()
        if not first_record:
            return jsonify({'error': 'No EventGroup records found'}), 404
        
        record_data = {column.name: getattr(first_record, column.name) for column in first_record.__table__.columns}
        return jsonify(record_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route(API_URL + "/get-next-eventgroup", methods=["GET"])
def get_next_eventgroup():
    current_code = request.args.get('current_code', type=int)
    if not current_code:
        return jsonify({'error': 'Missing current_code parameter'}), 400
    
    try:
        next_record = EventGroup.query.filter(EventGroup.eventCode > current_code).order_by(EventGroup.eventCode.asc()).first()
        if not next_record:
            return jsonify({'error': 'No next EventGroup record found'}), 404
        
        record_data = {column.name: getattr(next_record, column.name) for column in next_record.__table__.columns}
        return jsonify(record_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route(API_URL + "/get-previous-eventgroup", methods=["GET"])
def get_previous_eventgroup():
    current_code = request.args.get('current_code', type=int)
    if not current_code:
        return jsonify({'error': 'Missing current_code parameter'}), 400
    
    try:
        previous_record = EventGroup.query.filter(EventGroup.eventCode < current_code).order_by(EventGroup.eventCode.desc()).first()
        if not previous_record:
            return jsonify({'error': 'No previous EventGroup record found'}), 404
        
        record_data = {column.name: getattr(previous_record, column.name) for column in previous_record.__table__.columns}
        return jsonify(record_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route(API_URL + "/get-last-eventgroup", methods=["GET"])
def get_last_eventgroup():
    try:
        last_record = EventGroup.query.order_by(EventGroup.eventCode.desc()).first()
        if not last_record:
            return jsonify({'error': 'No EventGroup records found'}), 404
        
        record_data = {column.name: getattr(last_record, column.name) for column in last_record.__table__.columns}
        return jsonify(record_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
