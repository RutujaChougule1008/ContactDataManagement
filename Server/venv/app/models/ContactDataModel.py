from sqlalchemy import Column, Integer, String, Numeric, Date, Boolean, ForeignKey
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


class ContactDataBankDetail(db.Model):
    __tablename__ = 'Contact_Data_Bank_Detail'
    
    contactdetail_id = Column(Integer, primary_key=True, autoincrement=True)
    contact_Id = Column(Integer, ForeignKey('Contact_Data_Bank_Head.contact_Id'), nullable=True)
    eventCode = Column(Integer , ForeignKey('EventGroup.eventCode'), nullable=True)

    
    details = relationship('ContactDataBankHead', backref='contact_data_bank_details', lazy=True)





