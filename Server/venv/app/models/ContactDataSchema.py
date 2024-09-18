from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from app.models.ContactDataModel import ContactDataBankHead, ContactDataBankDetail

class ContactDataBankHeadSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = ContactDataBankHead
        include_relationships = True

class ContactDataBankDetailSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = ContactDataBankDetail
        include_relationships = True

