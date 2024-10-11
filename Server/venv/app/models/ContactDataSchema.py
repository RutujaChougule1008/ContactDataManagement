from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from app.models.ContactDataModel import ContactDataBankHead, ContactDataBankDetail

class ContactDataBankHeadSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = ContactDataBankHead
        include_relationships = True
        exclude = ('profile1', 'profile2', 'profile3')

class ContactDataBankDetailSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = ContactDataBankDetail
        include_relationships = True

