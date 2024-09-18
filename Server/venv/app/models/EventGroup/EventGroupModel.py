from sqlalchemy import Column, Integer, String, Numeric, Date, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from app import db

class EventGroup(db.Model):
    __tablename__ = 'EventGroup'
    
    eventCode = Column(Integer, primary_key=True, autoincrement=True)
    eventName = Column(String(255), nullable=False)
