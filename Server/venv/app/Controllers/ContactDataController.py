import traceback
from flask import Flask, jsonify, request
from app import app, db
import requests
from sqlalchemy import text, func
from sqlalchemy.exc import SQLAlchemyError
import os
import base64
import json

# Get the base URL from environment variables
API_URL = os.getenv('API_URL')

# Import schemas from the schemas module
from app.models.ContactDataModel import ContactDataBankHead,ContactDataBankDetail, ContactSpecialDates
from app.models.ContactDataSchema import ContactDataBankHeadSchema, ContactDataBankDetailSchema
from app.models.EventGroup.EventGroupModel import EventGroup
contact_data_head_schema = ContactDataBankHeadSchema()
contact_data_head_schemas = ContactDataBankHeadSchema(many=True)

contact_data_detail_schema = ContactDataBankDetailSchema()
contact_data_detail_schemas = ContactDataBankDetailSchema(many=True)


def format_dates(data):
    return {
        "DOB": data.DOB.strftime('%Y-%m-%d') if data.DOB else None,
        "anniversary": data.anniversary.strftime('%Y-%m-%d') if data.anniversary else None,
    }

def format_dates_dict(data):
    for record in data:
        if isinstance(record, dict):
            if 'anniversary' in record and record['anniversary']:
                record['anniversary'] = record['anniversary'].strftime('%Y-%m-%d')
            if 'DOB' in record and record['DOB']:
                record['DOB'] = record['DOB'].strftime('%Y-%m-%d')
    return data

def delete_acgroups_by_eventCode(contact_Id):
    try:
        db.session.execute(
            text("DELETE FROM Contact_Data_Bank_Detail WHERE contact_Id = :contact_Id"),
            {'contact_Id': contact_Id}
        )
        db.session.commit()
        return True
    except:
        db.session.rollback()
        return False


@app.route(API_URL+"/get-contactData", methods=["GET"])
def get_contactData():
    try:

        query = ('''SELECT  h.org_name, h.designation, h.org_holder_name, h.city, h.state, h.country, h.mobile_no, h.email, h.website, h.mobile_no2, h.email2 , h.contact_Id, ISNULL(eventCodeCountTable.eventCodeCount, 0) AS eventCodeCount
                 ,h.anniversary, h.DOB, h.note,  h.office_address, h.residential_addr, h.landline_no
FROM     dbo.Contact_Data_Bank_Head AS h LEFT OUTER JOIN
                      (SELECT contact_Id, COUNT(eventCode) AS eventCodeCount
                       FROM      dbo.Contact_Data_Bank_Detail
                       GROUP BY contact_Id) AS eventCodeCountTable ON h.contact_Id = eventCodeCountTable.contact_Id
ORDER BY h.org_name
                                 '''
            )
        additional_data = db.session.execute(text(query))
        

        # Extracting category name from additional_data
        additional_data_rows = additional_data.fetchall()
        

        # Convert additional_data_rows to a list of dictionaries
        all_data = [dict(row._mapping) for row in additional_data_rows]

        
        all_data = format_dates_dict(all_data)


        # Prepare response data 
        response = {
            "all_data": all_data
        }
        # If record found, return it
        return jsonify(response), 200

    except Exception as e:
        print(e)
        return jsonify({"error": "Internal server error", "message": str(e)}), 500


@app.route(API_URL + "/insert-contactData", methods=["POST"])
def insert_contact_data():
    try:
        # Ensure the request content type is multipart/form-data
        if not request.content_type.startswith('multipart/form-data'):
            return jsonify({"error": "Unsupported Media Type", "message": "Content type must be multipart/form-data"}), 415

        # Retrieve master_data and contact_data from form fields
        master_data = request.form.get('master_data', '{}')  # Defaults to an empty dict if not provided
        contact_data = request.form.get('contact_data', '[]')  # Defaults to an empty list if not provided
        special_dates_data = request.form.get('special_dates', '[]')

        # Parse the received JSON strings
        try:
            master_data = json.loads(master_data)
            contact_data_list = json.loads(contact_data)
            special_dates = json.loads(special_dates_data)
        except json.JSONDecodeError as e:
            return jsonify({"error": "Bad request", "message": "Invalid JSON in master_data or contact_data"}), 400

        # Debugging logs to verify incoming data
        print("Received master_data:", master_data)
        print("Received contact_data:", contact_data_list)

        # Ensure that required data is present
        if not master_data:
            return jsonify({"error": "Required fields missing in master_data"}), 400



        profile1 = request.files.get('profile1')
        profile2 = request.files.get('profile2')
        profile3 = request.files.get('profile3')

        # Convert image file data to binary for storage in the database
        if 'profile1' in master_data and master_data['profile1']:
            master_data['profile1'] = base64.b64decode(master_data['profile1'].split(",")[1])
        if 'profile2' in master_data and master_data['profile2']:
            master_data['profile2'] = base64.b64decode(master_data['profile2'].split(",")[1])
        if 'profile3' in master_data and master_data['profile3']:
            master_data['profile3'] = base64.b64decode(master_data['profile3'].split(",")[1])

        # Create a new master record in the database
        new_master = ContactDataBankHead(**master_data)
        db.session.add(new_master)
        db.session.flush()  # Ensure new_master.contact_Id is generated

        newContactId = new_master.contact_Id
        print("newContactId:", newContactId)

        createdDetails = []

        # Process contact data
        for contact_item in contact_data_list:
            if isinstance(contact_item, dict) and contact_item.get('rowaction') == 'add':
                # Remove 'rowaction' before creating the detail record
                del contact_item['rowaction']
                
                contact_item['contact_Id'] = newContactId
                eventCode = contact_item.get('eventCode')
                if eventCode and isinstance(eventCode, list):
                    for code in eventCode:
                        detail_data = {k: v for k, v in contact_item.items() if k != 'eventCode'}
                        detail_data['eventCode'] = code
                        detail_data['contact_Id'] = newContactId
                        new_detail = ContactDataBankDetail(**detail_data)
                        db.session.add(new_detail)
                        createdDetails.append(new_detail)

        # Save profile images and update paths in the database
        for i in range(1, 4):
            file = request.files.get(f'profile{i}')
            if file:
                # Save the binary content of the file directly into the database
                new_master.__setattr__(f'profile{i}', file.read())
        
        for special_date in special_dates:
            new_special_date = ContactSpecialDates(
                contact_Id=newContactId,
                special_date=special_date['date'],
                description=special_date['description']
            )
            db.session.add(new_special_date)

        db.session.commit()

        return jsonify({
            "message": "Data inserted successfully",
            "ContactHead": contact_data_head_schema.dump(new_master),
            "ContactDetailsCreated": contact_data_detail_schemas.dump(createdDetails)
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Exception occurred: {str(e)}")
        print("Traceback:", traceback.format_exc())
        return jsonify({"error": "Internal server error", "message": str(e)}), 500



@app.route(API_URL + "/update-contactData", methods=["PUT"])
def update_contactData():
    try:
        contact_Id = request.args.get('contact_Id')
        if not contact_Id:
            return jsonify({"error": "Missing 'contact_Id' parameter"}), 400

        master_data = None
        contact_data_list = None

        if request.content_type.startswith('multipart/form-data'):
            master_data = request.form.get('master_data', '{}')
            contact_data = request.form.get('contact_data', '[]')
            special_dates_data = request.form.get('special_dates', '[]')

            try:
                master_data = json.loads(master_data)
                contact_data_list = json.loads(contact_data)
                special_dates = json.loads(special_dates_data)
            except json.JSONDecodeError:
                return jsonify({"error": "Invalid JSON format"}), 400
        else:
            data = request.get_json()
            if data:
                master_data = data.get('master_data', {})
                contact_data_list = data.get('contact_data', [])
                special_dates = data.get('special_dates', [])

        if master_data is None:
            return jsonify({"error": "Missing required data"}), 400

        if 'contact_Id' in master_data:
            del master_data['contact_Id']

        if 'profile1' in master_data and master_data['profile1']:
            master_data['profile1'] = base64.b64decode(master_data['profile1'].split(",")[1])
        if 'profile2' in master_data and master_data['profile2']:
            master_data['profile2'] = base64.b64decode(master_data['profile2'].split(",")[1])
        if 'profile3' in master_data and master_data['profile3']:
            master_data['profile3'] = base64.b64decode(master_data['profile3'].split(",")[1])

        ContactDataBankHead.query.filter_by(contact_Id=contact_Id).update(master_data)
        db.session.flush()  # It might be necessary to flush session to apply updates before querying

        updated_account_master = ContactDataBankHead.query.filter_by(contact_Id=contact_Id).one()
        updatedAcCode = updated_account_master.contact_Id

        createdDetails = []
        updatedDetails = []
        deletedDetailIds = []

        for contact_data in contact_data_list:
            contact_data['contact_Id'] = updatedAcCode  # Ensure contact_Id is updated correctly

            if contact_data.get('rowaction') == "add":
                del contact_data['rowaction']
                if 'eventCode' in contact_data and isinstance(contact_data['eventCode'], list):
                    for eventCode in contact_data['eventCode']:
                        detail_data = {key: val for key, val in contact_data.items() if key != 'eventCode'}
                        detail_data['eventCode'] = eventCode
                        detail_data['contact_Id'] = updatedAcCode

                        new_contact = ContactDataBankDetail(**detail_data)
                        db.session.add(new_contact)
                        createdDetails.append(new_contact)

            elif contact_data.get('rowaction') == "update":
                contactdetail_id = contact_data.get('contactdetail_id')
                update_values = {k: v for k, v in contact_data.items() if k not in ('contactdetail_id', 'rowaction', 'contact_Id')}
                ContactDataBankDetail.query.filter_by(contactdetail_id=contactdetail_id).update(update_values)
                updatedDetails.append(contactdetail_id)

            elif contact_data.get('rowaction') == "delete":
                contactdetail_id = contact_data.get('contactdetail_id')
                contact_to_delete = ContactDataBankDetail.query.filter_by(contactdetail_id=contactdetail_id).one_or_none()
                if contact_to_delete:
                    db.session.delete(contact_to_delete)
                    deletedDetailIds.append(contactdetail_id)

        for i in range(1, 4):
            file = request.files.get(f'profile{i}')
            if file:
                binary_data = file.read()
                updated_account_master.__setattr__(f'profile{i}', binary_data)

        ContactSpecialDates.query.filter_by(contact_Id=contact_Id).delete()  # Delete existing special dates
        for special_date in special_dates:
            updated_special_date = ContactSpecialDates(
                contact_Id=updatedAcCode,
                special_date=special_date['date'],
                description=special_date['description']
            )
            db.session.add(updated_special_date)

        db.session.commit()

        return jsonify({
            "message": "Data updated successfully",
            "created_contacts": contact_data_detail_schemas.dump(createdDetails),
            "updated_contacts": updatedDetails,
            "deleted_contact_ids": deletedDetailIds
        }), 200

    except Exception as e:
        db.session.rollback()
        print("Traceback", traceback.format_exc())
        return jsonify({"error": "Internal server error", "message": str(e)}), 500
    

@app.route(API_URL + "/delete_contactData", methods=["DELETE"])
def delete_contactData():
    try:
        contact_Id = request.args.get('contact_Id')
        if not all ([contact_Id]):
            return jsonify({"error": "Missing required parameter"}), 400

        with db.session.begin():
            ContactSpecialDates.query.filter_by(contact_Id=contact_Id).delete()
            deleted_contact_rows = ContactDataBankDetail.query.filter_by(contact_Id=contact_Id).delete()
            deleted_master_rows = ContactDataBankHead.query.filter_by(contact_Id=contact_Id).delete()

        db.session.commit()

        return jsonify({
            "message": f"Deleted {deleted_master_rows} master row(s) and {deleted_contact_rows} contact row(s) successfully"
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal server error", "message": str(e)}), 500
    
# @app.route(API_URL + "/getcontactDataByid", methods=["GET"])
# def getcontactDataByid():
#     try:
#         contact_Id = request.args.get('contact_Id')
#         if not all([contact_Id]):
#             return jsonify({"error": "Missing required parameters"}), 400

#         account_master = ContactDataBankHead.query.filter_by(contact_Id=contact_Id).first()
#         if not account_master:
#             return jsonify({"error": "No records found"}), 404

#         contact_Id = account_master.contact_Id

#         account_master_data = {column.name: getattr(account_master, column.name) for column in account_master.__table__.columns}
#         account_master_data.update(format_dates(account_master))

#         detail_records = ContactDataBankDetail.query.filter_by(contact_Id=contact_Id).all()
#         if not detail_records:
#             detail_data = []
#         else:
#             detail_data = [{column.name: getattr(detail_record, column.name) for column in detail_record.__table__.columns} for detail_record in detail_records]

#         response = {
#             "account_master_data": account_master_data,
#             "account_detail_data": detail_data,
#         }
#         return jsonify(response), 200

#     except Exception as e:
#         return jsonify({"error": "Internal server error", "message": str(e)}), 500

@app.route(API_URL + "/getcontactDataByid", methods=["GET"])
def getcontactDataByid():
    try:
        contact_Id = request.args.get('contact_Id')
        if not contact_Id:
            return jsonify({"error": "Missing required parameters"}), 400

        # Query to fetch the account master data
        account_master = ContactDataBankHead.query.filter_by(contact_Id=contact_Id).first()
        if not account_master:
            return jsonify({"error": "No records found"}), 404

        # Mapping account master data
        account_master_data = {column.name: getattr(account_master, column.name) for column in account_master.__table__.columns}
        account_master_data.update(format_dates(account_master))
        # Convert images (stored as binary) to base64-encoded strings
        images = {}
        for i in range(1, 4):
            image_field = getattr(account_master, f'profile{i}', None)
            if image_field:
                images[f'profile{i}'] = base64.b64encode(image_field).decode('utf-8')
            else:
                images[f'profile{i}'] = None  # If no image is available, set it to None

        # Add the images to the master data
        account_master_data.update(images)

        # Use the text() function to execute raw SQL query
        detail_records = db.session.execute(text("""
            SELECT 
                MAX(dbo.EventGroup.eventName) AS eventName, 
                dbo.Contact_Data_Bank_Detail.contactdetail_id, 
                dbo.Contact_Data_Bank_Detail.eventCode, 
                dbo.Contact_Data_Bank_Detail.contact_Id
            FROM 
                dbo.EventGroup 
            RIGHT OUTER JOIN 
                dbo.Contact_Data_Bank_Detail ON dbo.EventGroup.eventCode = dbo.Contact_Data_Bank_Detail.eventCode 
            RIGHT OUTER JOIN 
                dbo.Contact_Data_Bank_Head ON dbo.Contact_Data_Bank_Detail.contact_Id = dbo.Contact_Data_Bank_Head.contact_Id
            WHERE 
                dbo.Contact_Data_Bank_Head.contact_Id = :contact_Id
            GROUP BY 
                dbo.Contact_Data_Bank_Detail.contactdetail_id, 
                dbo.Contact_Data_Bank_Detail.eventCode, 
                dbo.Contact_Data_Bank_Detail.contact_Id
        """), {'contact_Id': contact_Id}).fetchall()

        # Map detail records including event names
        detail_data = [
            {
                "contactdetail_id": detail_record.contactdetail_id,
                "eventCode": detail_record.eventCode,
                "contact_Id": detail_record.contact_Id,
                "eventName": detail_record.eventName  # Include eventName from EventGroup table
            }
            for detail_record in detail_records
        ]

        special_dates = ContactSpecialDates.query.filter_by(contact_Id=contact_Id).all()
        special_dates_data = [
            {"special_date": special_date.special_date.strftime('%Y-%m-%d'),
             "description": special_date.description}
            for special_date in special_dates
        ]

        # Prepare response
        response = {
            "account_master_data": account_master_data,
            "account_detail_data": detail_data,  # Includes eventName from EventGroup table
            "special_date": special_dates_data
        }

        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": "Internal server error", "message": str(e)}), 500

    
@app.route(API_URL + "/get-lastcontactdata", methods=["GET"])
def get_lastcontactdata():
    try:
        # Retrieve the last record from the ContactDataBankHead table
        last_account_master = ContactDataBankHead.query.order_by(ContactDataBankHead.contact_Id.desc()).first()

        if not last_account_master:
            return jsonify({"error": "No records found"}), 404

        # Convert account master data to a dictionary
        account_master_data = {column.name: getattr(last_account_master, column.name) for column in last_account_master.__table__.columns}
        account_master_data.update(format_dates(last_account_master))

        # Return file paths or URLs instead of binary data
        account_master_data['profile1'] = base64.b64encode(last_account_master.profile1).decode('utf-8') if last_account_master.profile1 else None
        account_master_data['profile2'] = base64.b64encode(last_account_master.profile2).decode('utf-8') if last_account_master.profile2 else None
        account_master_data['profile3'] = base64.b64encode(last_account_master.profile3).decode('utf-8') if last_account_master.profile3 else None


        contact_Id = last_account_master.contact_Id

        # Fetch detail records for the specific contact_Id
        detail_records = ContactDataBankDetail.query.filter_by(contact_Id=contact_Id).all()

        # Convert detail records to dictionaries
        detail_data = [{column.name: getattr(detail_record, column.name) for column in detail_record.__table__.columns} for detail_record in detail_records]

        special_dates = ContactSpecialDates.query.filter_by(contact_Id=contact_Id).all()
        special_dates_data = [
            {"special_date": special_date.special_date.strftime('%Y-%m-%d'),
             "description": special_date.description}
            for special_date in special_dates
        ]

       
        # Build the response object
        response = {
            "account_master_data": account_master_data,
            "account_detail_data": detail_data,
            "special_date": special_dates_data
        }

        return jsonify(response), 200

    except Exception as e:
        print(f"Exception occurred: {str(e)}")
        return jsonify({"error": "Internal server error", "message": str(e)}), 500



    
@app.route(API_URL + "/get-firstcontact-navigation", methods=["GET"])
def get_firstcontact_navigation():
    try:
        first_account_master = ContactDataBankHead.query.order_by(ContactDataBankHead.contact_Id.asc()).first()

        if not first_account_master:
            return jsonify({"error": "No records found"}), 404

        contact_Id = first_account_master.contact_Id

        # Map account master data
        account_master_data = {column.name: getattr(first_account_master, column.name) for column in first_account_master.__table__.columns}
        account_master_data.update(format_dates(first_account_master))

        account_master_data['profile1'] = base64.b64encode(first_account_master.profile1).decode('utf-8') if first_account_master.profile1 else None
        account_master_data['profile2'] = base64.b64encode(first_account_master.profile2).decode('utf-8') if first_account_master.profile2 else None
        account_master_data['profile3'] = base64.b64encode(first_account_master.profile3).decode('utf-8') if first_account_master.profile3 else None

        # Fetch detail records for the specific contact_Id
        detail_records = ContactDataBankDetail.query.filter_by(contact_Id=contact_Id).all()

        if not detail_records:
            detail_data = []
        else:
            detail_data = [{column.name: getattr(detail_record, column.name) for column in detail_record.__table__.columns} for detail_record in detail_records]

        special_dates = ContactSpecialDates.query.filter_by(contact_Id=contact_Id).all()
        special_dates_data = [
            {"special_date": special_date.special_date.strftime('%Y-%m-%d'),
             "description": special_date.description}
            for special_date in special_dates
        ]

        response = {
            "account_master_data": account_master_data,
            "account_detail_data": detail_data,
            "special_date": special_dates_data
        }
        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": "Internal server error", "message": str(e)}), 500

    
@app.route(API_URL + "/get-previouscontact-navigation", methods=["GET"])
def get_previouscontact_navigation():
    try:
        current_contactId = request.args.get('current_contactId')

        if not all([current_contactId]):
            return jsonify({"error": "Missing required parameters"}), 400

        previous_account_master = ContactDataBankHead.query.filter(ContactDataBankHead.contact_Id < current_contactId).order_by(ContactDataBankHead.contact_Id.desc()).first()

        if not previous_account_master:
            return jsonify({"error": "No previous records found"}), 404

        contact_Id = previous_account_master.contact_Id

        account_master_data = {column.name: getattr(previous_account_master, column.name) for column in previous_account_master.__table__.columns}
        account_master_data.update(format_dates(previous_account_master))

        account_master_data['profile1'] = base64.b64encode(previous_account_master.profile1).decode('utf-8') if previous_account_master.profile1 else None
        account_master_data['profile2'] = base64.b64encode(previous_account_master.profile2).decode('utf-8') if previous_account_master.profile2 else None
        account_master_data['profile3'] = base64.b64encode(previous_account_master.profile3).decode('utf-8') if previous_account_master.profile3 else None


        detail_records = ContactDataBankDetail.query.filter_by(contact_Id=contact_Id).all()


        if not detail_records:
            detail_data = []
        else:
            detail_data = [{column.name: getattr(detail_record, column.name) for column in detail_record.__table__.columns} for detail_record in detail_records]

        special_dates = ContactSpecialDates.query.filter_by(contact_Id=contact_Id).all()
        special_dates_data = [
        {
        "special_date": special_date.special_date.strftime('%Y-%m-%d') if special_date.special_date else "",
        "description": special_date.description if special_date.description else ""
        }
        for special_date in special_dates
        ]

        response = {
            "account_master_data": account_master_data,
            "account_detail_data": detail_data,
            "special_date": special_dates_data
        }
        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": "Internal server error", "message": str(e)}), 500

@app.route(API_URL + "/get-nextcontact-navigation", methods=["GET"])
def get_nextcontact_navigation():
    try:
        current_contactId = request.args.get('current_contactId')
        

        if not all([current_contactId]):
            return jsonify({"error": "Missing required parameters"}), 400

        next_account_master = ContactDataBankHead.query.filter(ContactDataBankHead.contact_Id > current_contactId).order_by(ContactDataBankHead.contact_Id.asc()).first()

        if not next_account_master:
            return jsonify({"error": "No next records found"}), 404

        contact_Id = next_account_master.contact_Id

        account_master_data = {column.name: getattr(next_account_master, column.name) for column in next_account_master.__table__.columns}
        account_master_data.update(format_dates(next_account_master))

        account_master_data['profile1'] = base64.b64encode(next_account_master.profile1).decode('utf-8') if next_account_master.profile1 else None
        account_master_data['profile2'] = base64.b64encode(next_account_master.profile2).decode('utf-8') if next_account_master.profile2 else None
        account_master_data['profile3'] = base64.b64encode(next_account_master.profile3).decode('utf-8') if next_account_master.profile3 else None


        detail_records = ContactDataBankDetail.query.filter_by(contact_Id=contact_Id).all()

        if not detail_records:
            detail_data = []
        else:
            detail_data = [{column.name: getattr(detail_record, column.name) for column in detail_record.__table__.columns} for detail_record in detail_records]

        special_dates = ContactSpecialDates.query.filter_by(contact_Id=contact_Id).all()
        special_dates_data = [
            {"special_date": special_date.special_date.strftime('%Y-%m-%d'),
             "description": special_date.description}
            for special_date in special_dates
        ]

        response = {
            "account_master_data": account_master_data,
            "account_detail_data": detail_data,
            "special_date": special_dates_data
        }
        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": "Internal server error", "message": str(e)}), 500
    



@app.route(API_URL + "/contact_data", methods=['GET'])
def get_contact_data():
    try:
        # Get the comma-separated eventCode parameter as a string
        event_codes_str = request.args.get('eventCode')  # Expecting eventCode=1,2,3

        # Validate input
        if not event_codes_str:
            return jsonify({'error': 'Please provide eventCode(s)'}), 400

        # Convert the comma-separated string into a list of integers
        event_codes = [int(code) for code in event_codes_str.split(',')]

        # Number of event codes provided
        number_of_event_codes = len(event_codes)

        # Example of how to use event_codes in a SQL query
        query = text("""
            SELECT h.org_name, h.contact_Id, h.org_holder_name, h.city, h.designation, h.state, h.country, h.mobile_no, h.email, h.website, h.anniversary, h.DOB, e.eventName
            FROM dbo.Contact_Data_Bank_Head AS h
            LEFT OUTER JOIN dbo.Contact_Data_Bank_Detail AS d ON h.contact_Id = d.contact_Id
            LEFT OUTER JOIN dbo.EventGroup AS e ON d.eventCode = e.eventCode
            WHERE e.eventCode IN :eventCodes
            GROUP BY h.org_name, h.contact_Id, h.org_holder_name, h.city, h.designation, h.state, h.country, h.mobile_no, h.email, h.website, h.anniversary, h.DOB, e.eventName

            ORDER BY h.org_name
        """)

        result = db.session.execute(query, {
            'eventCodes': tuple(event_codes),  
            
        })

        # Construct the response as a list of dictionaries
        contact_data = [
            {
                'org_name': row.org_name,
                'contact_Id': row.contact_Id,
                'org_holder_name': row.org_holder_name,
                'city': row.city,
                'state': row.state,
                'designation': row.designation,
                'state': row.state,
                'mobile_no': row.mobile_no,
                'email': row.email,
                'website': row.website,
                'anniversary': row.anniversary.strftime('%Y-%m-%d') if row.anniversary else None,
                'DOB': row.DOB.strftime('%Y-%m-%d') if row.DOB else None,
                'eventName': row.eventName,
            }
            for row in result
        ]

        return jsonify(contact_data)

    except SQLAlchemyError as e:
        # Rollback in case of an error
        db.session.rollback()
        return jsonify({'error': str(e), 'trace': traceback.format_exc()}), 500

    except Exception as e:
        return jsonify({'error': str(e), 'trace': traceback.format_exc()}), 500


@app.route(API_URL + "/get-organization-names", methods=["GET"])
def get_organization_names():
    try:
       
        query = text("SELECT DISTINCT org_name FROM dbo.Contact_Data_Bank_Head ORDER BY org_name")

      
        result = db.session.execute(query)
        
        
        organization_names = [row.org_name for row in result]

        
        return jsonify({"organization_names": organization_names}), 200

    except SQLAlchemyError as e:
       
        db.session.rollback()
        return jsonify({'error': str(e), 'trace': traceback.format_exc()}), 500

    except Exception as e:
        
        return jsonify({'error': str(e), 'trace': traceback.format_exc()}), 500
    
@app.route(API_URL + "/contact_data_by_orgname", methods=['GET'])
def get_contact_data_by_orgname():
    try:
        
        org_names_str = request.args.get('org_names')

        
        if not org_names_str:
            return jsonify({'error': 'Please provide organization name(s)'}), 400

        
        org_names = [name.strip() for name in org_names_str.split(',')]

        
        if not org_names or len(org_names) == 0:
            return jsonify({'error': 'No valid organization names provided'}), 400

       
        if len(org_names) == 1:
            org_names = (org_names[0],)  

        
        query = text("""
           SELECT h.org_name, h.contact_Id, h.org_holder_name, h.city, h.designation, h.state, h.country, h.mobile_no, h.email, h.website, h.anniversary, h.DOB, e.eventName
            FROM dbo.Contact_Data_Bank_Head AS h
            LEFT OUTER JOIN dbo.Contact_Data_Bank_Detail AS d ON h.contact_Id = d.contact_Id
            LEFT OUTER JOIN dbo.EventGroup AS e ON d.eventCode = e.eventCode
            WHERE h.org_name IN :orgNames
            GROUP BY h.org_name, h.contact_Id, h.org_holder_name, h.city, h.designation, h.state, h.country, h.mobile_no, h.email, h.website, h.anniversary, h.DOB, e.eventName
            ORDER BY h.org_name
        """)

        
        result = db.session.execute(query, {'orgNames': tuple(org_names)})

       
        contact_data = [
            {
                'org_name': row.org_name,
                'contact_Id': row.contact_Id,
                'org_holder_name': row.org_holder_name,
                'city': row.city,
                'state': row.state,
                'designation': row.designation,
                'mobile_no': row.mobile_no,
                'email': row.email,
                'website': row.website,
                'anniversary': row.anniversary.strftime('%Y-%m-%d') if row.anniversary else None,
                'DOB': row.DOB.strftime('%Y-%m-%d') if row.DOB else None,
                'eventName': row.eventName,
            }
            for row in result
        ]

        return jsonify(contact_data), 200

    except SQLAlchemyError as e:
        
        db.session.rollback()
        return jsonify({'error': str(e), 'trace': traceback.format_exc()}), 500

    except Exception as e:
        
        return jsonify({'error': str(e), 'trace': traceback.format_exc()}), 500

