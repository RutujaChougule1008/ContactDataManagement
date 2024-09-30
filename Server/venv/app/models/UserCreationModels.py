from app import db

class UserCreation(db.Model):
    __tablename__ = 'user_creation'
    
    user_code = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String(100))
    mobile_no = db.Column(db.String(15))
    email = db.Column(db.String(100))
    password = db.Column(db.String(100))
    user_type = db.Column(db.String(50))

    def as_dict(self):
        return {
            'user_code': self.user_code,
            'user_name': self.user_name,
            'mobile_no': self.mobile_no,
            'email': self.email,
            'user_type': self.user_type,
            'password' : self.password
        }
