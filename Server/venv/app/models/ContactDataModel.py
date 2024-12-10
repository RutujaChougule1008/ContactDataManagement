from sqlalchemy import Column, Integer, String, Numeric, Date, Boolean, ForeignKey, LargeBinary
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from app import db

class ContactDataBankHead(db.Model):
    __tablename__ = 'Contact_Data_Bank_Head'
    
    contact_Id = Column(Integer, primary_key=True, autoincrement=True)
    org_name = Column(String(255), nullable=True)
    org_holder_name = Column(String(255), nullable=True)
    designation = Column(String(255), nullable=True)
    office_address = Column(String(255), nullable=True)
    city = Column(String(255), nullable=True)
    state = Column(String(255), nullable=True)
    country = Column(String(255), nullable=True)
    residential_addr = Column(String(255), nullable=True)
    landline_no = Column(String(255), nullable=True)
    mobile_no = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    anniversary = Column(Date, nullable=True)
    website = Column(String(255), nullable=True)
    DOB = Column(Date, nullable=True)
    mobile_no2 = Column(String(255), nullable=True)
    email2 = Column(String(255), nullable=True)
    note = Column(String(max), nullable=True)
    bio = Column(String(max), nullable=True)
    profile1 = Column(LargeBinary)
    profile2 = Column(LargeBinary)
    profile3 = Column(LargeBinary)
    profile1FileName=Column(String(255), nullable=True)
    profile2FileName=Column(String(255), nullable=True)
    profile3FileName=Column(String(255), nullable=True)
    UCC_Number=Column(String(255), nullable=True)



class ContactDataBankDetail(db.Model):
    __tablename__ = 'Contact_Data_Bank_Detail'
    
    contactdetail_id = Column(Integer, primary_key=True, autoincrement=True)
    contact_Id = Column(Integer, ForeignKey('Contact_Data_Bank_Head.contact_Id'), nullable=True)
    eventCode = Column(Integer , ForeignKey('EventGroup.eventCode'), nullable=True)

    
    details = relationship('ContactDataBankHead', backref='contact_data_bank_details', lazy=True)

class ContactSpecialDates(db.Model):
    __tablename__ = 'ContactSpecialDates'
    
    date_id = Column(Integer, primary_key=True)
    contact_Id = Column(Integer, ForeignKey('Contact_Data_Bank_Head.contact_Id'), nullable=False)
    special_date = Column(Date, nullable=True)
    description = db.Column(db.String(255), nullable=True)
    
    contact = db.relationship('ContactDataBankHead', backref=db.backref('special_dates', lazy=True))






