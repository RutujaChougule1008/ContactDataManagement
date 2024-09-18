import traceback
from flask import Flask, jsonify, request
from app import app, db
import requests
from sqlalchemy import text, func
from sqlalchemy.exc import SQLAlchemyError
import os

# Get the base URL from environment variables
API_URL = os.getenv('API_URL')

# Import schemas from the schemas module
from app.models.ContactDataModel import ContactDataBankHead,ContactDataBankDetail
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

        query = ('''SELECT contact_Id, org_name, org_holder_name, designation, office_address, city, state, country, mobile_no, email, website
FROM     Contact_Data_Bank_Head
ORDER BY org_name
                                 '''
            )
        additional_data = db.session.execute(text(query))

        # Extracting category name from additional_data
        additional_data_rows = additional_data.fetchall()
        

        # Convert additional_data_rows to a list of dictionaries
        all_data = [dict(row._mapping) for row in additional_data_rows]


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
def insert_contactData():
    try:
        data = request.get_json()
        master_data = data['master_data']
        contact_data_list = data['contact_data']  # Ensure contact_data is a list of contact details

        # Insert new master record
        new_master = ContactDataBankHead(**master_data)
        db.session.add(new_master)
        db.session.flush()  # Ensure new_master.contact_Id is generated

        newContactId = new_master.contact_Id
        print("newContactId", newContactId)

        createdDetails = []

        # Iterate over contact_data_list
        for contact_data in contact_data_list:
            if contact_data.get('rowaction') == "add":
                del contact_data['rowaction']
                contact_data['contact_Id'] = newContactId
                
                # Ensure 'eventCode' exists and is a list
                if 'eventCode' in contact_data and isinstance(contact_data['eventCode'], list):
                    for eventCode in contact_data['eventCode']:
                        detail_data = {key: val for key, val in contact_data.items() if key != 'eventCode'}
                        detail_data['eventCode'] = eventCode
                        detail_data['contact_Id'] = newContactId
                        new_contact = ContactDataBankDetail(**detail_data)
                        db.session.add(new_contact)
                        createdDetails.append(new_contact)
                else:
                    return jsonify({"error": "Missing or incorrect 'eventCode', should be a list"}), 400

        db.session.commit()

        return jsonify({
            "message": "Data inserted successfully",
            "ContactHead": contact_data_head_schema.dump(new_master),
            "ContactDetailsCreated": contact_data_detail_schemas.dump(createdDetails)
        }), 201

    except Exception as e:
        print("Traceback", traceback.format_exc())
        db.session.rollback()
        return jsonify({"error": "Internal server error", "message": str(e)}), 500



    

@app.route(API_URL + "/update-contactData", methods=["PUT"])
def update_contactData():
    try:
        contact_Id = request.args.get('contact_Id')
        if not contact_Id:
            return jsonify({"error": "Missing 'contact_Id' parameter"}), 400

        data = request.get_json()
        master_data = data['master_data']
        contact_data_list = data['contact_data']  # Assuming contact_data is a list of contact details

        # Update the master record
        ContactDataBankHead.query.filter_by(contact_Id=contact_Id).update(master_data)
        updated_account_master = ContactDataBankHead.query.filter_by(contact_Id=contact_Id).one()
        updatedAcCode = updated_account_master.contact_Id

        createdDetails = []
        updatedDetails = []
        deletedDetailIds = []

        # Iterate over the contact data list
        for contact_data in contact_data_list:
            contact_data['contact_Id'] = updatedAcCode  # Update contact_Id in each contact detail

            if contact_data.get('rowaction') == "add":
                del contact_data['rowaction']

                # Ensure 'eventCode' exists and is a list
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
            deleted_contact_rows = ContactDataBankDetail.query.filter_by(contact_Id=contact_Id).delete()
            deleted_master_rows = ContactDataBankHead.query.filter_by(contact_Id=contact_Id).delete()

        db.session.commit()

        return jsonify({
            "message": f"Deleted {deleted_master_rows} master row(s) and {deleted_contact_rows} contact row(s) successfully"
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal server error", "message": str(e)}), 500
    
@app.route(API_URL + "/getcontactDataByid", methods=["GET"])
def getcontactDataByid():
    try:
        contact_Id = request.args.get('contact_Id')
        if not all([contact_Id]):
            return jsonify({"error": "Missing required parameters"}), 400

        account_master = ContactDataBankHead.query.filter_by(contact_Id=contact_Id).first()
        if not account_master:
            return jsonify({"error": "No records found"}), 404

        contact_Id = account_master.contact_Id

        account_master_data = {column.name: getattr(account_master, column.name) for column in account_master.__table__.columns}
        account_master_data.update(format_dates(account_master))

        detail_records = ContactDataBankDetail.query.filter_by(contact_Id=contact_Id).all()
        if not detail_records:
            detail_data = []
        else:
            detail_data = [{column.name: getattr(detail_record, column.name) for column in detail_record.__table__.columns} for detail_record in detail_records]

        response = {
            "account_master_data": account_master_data,
            "account_detail_data": detail_data,
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

        contact_Id = last_account_master.contact_Id

        # Fetch detail records for the specific contact_Id
        detail_records = ContactDataBankDetail.query.filter_by(contact_Id=contact_Id).all()

        # Ensure there are detail records and safely handle them
        if not detail_records:
            detail_data = []
        else:
            detail_data = [{column.name: getattr(detail_record, column.name) for column in detail_record.__table__.columns} for detail_record in detail_records]

        # Build the response object
        response = {
            "account_master_data": account_master_data,
            "account_detail_data": detail_data
        }

        return jsonify(response), 200

    except IndexError:
        return jsonify({"error": "No detail records found for the given contact_Id"}), 404
    except Exception as e:
        print("Error: ", e)
        return jsonify({"error": "Internal server error", "message": str(e)}), 500

    
@app.route(API_URL + "/get-firstcontact-navigation", methods=["GET"])
def get_firstcontact_navigation():
    try:
        first_account_master = ContactDataBankHead.query.order_by(ContactDataBankHead.contact_Id.asc()).first()

        if not first_account_master:
            return jsonify({"error": "No records found"}), 404

        contact_Id = first_account_master.contact_Id

        account_master_data = {column.name: getattr(first_account_master, column.name) for column in first_account_master.__table__.columns}
        account_master_data.update(format_dates(first_account_master))


        detail_records = ContactDataBankDetail.query.filter_by(contact_Id=contact_Id).all()


        if not detail_records:
            detail_data = []
        else:
            detail_data = [{column.name: getattr(detail_record, column.name) for column in detail_record.__table__.columns} for detail_record in detail_records]

        response = {
            "account_master_data": account_master_data,
            "account_detail_data": detail_data,
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


        detail_records = ContactDataBankDetail.query.filter_by(contact_Id=contact_Id).all()


        if not detail_records:
            detail_data = []
        else:
            detail_data = [{column.name: getattr(detail_record, column.name) for column in detail_record.__table__.columns} for detail_record in detail_records]

        response = {
            "account_master_data": account_master_data,
            "account_detail_data": detail_data,
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


        detail_records = ContactDataBankDetail.query.filter_by(contact_Id=contact_Id).all()

        if not detail_records:
            detail_data = []
        else:
            detail_data = [{column.name: getattr(detail_record, column.name) for column in detail_record.__table__.columns} for detail_record in detail_records]

        response = {
            "account_master_data": account_master_data,
            "account_detail_data": detail_data,
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

        # Example of how to use event_codes in a SQL query
        query = text("""
            SELECT h.org_name, h.contact_Id, h.org_holder_name, h.city, h.designation, h.state, h.country, h.mobile_no, h.email, h.website
FROM     dbo.Contact_Data_Bank_Head AS h LEFT OUTER JOIN
                  dbo.Contact_Data_Bank_Detail AS d ON h.contact_Id = d.contact_Id LEFT OUTER JOIN
                  dbo.EventGroup AS e ON d.eventCode = e.eventCode
            WHERE e.eventCode IN :eventCodes
            group by  h.org_name, h.contact_Id, h.org_holder_name, h.city, h.designation, h.state, h.country, h.mobile_no, h.email, h.website         
        """)

        result = db.session.execute(query, {
            'eventCodes': tuple(event_codes),  # Use tuple for the IN clause
        })

        # Prepare the result as a list of dictionaries
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
    except Exception as e:
        return jsonify({'error': str(e), 'trace': traceback.format_exc()}), 500

