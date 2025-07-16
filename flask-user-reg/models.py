from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class Subscriber(db.Model):
    __tablename__ = "subscribers"

    id                = db.Column(db.Integer, primary_key=True)
    account_type      = db.Column(db.String(32),  nullable=False)   # “personal” or “organization”
    first_name        = db.Column(db.String(64),  nullable=False)
    last_name         = db.Column(db.String(64),  nullable=False)
    email             = db.Column(db.String(128), unique=True, nullable=False)
    telephone         = db.Column(db.String(20),  nullable=False)
    address           = db.Column(db.String(256), nullable=False)   # user’s or org’s address
    organization_name = db.Column(db.String(128))                  # only for org accounts
    password_hash     = db.Column(db.String(128), nullable=False)

    # will be set once they purchase a plan
    subscription_type = db.Column(db.String(32), nullable=True)     # free/basic/pro/enterprise
    max_users         = db.Column(db.Integer,    nullable=True)
    max_resources     = db.Column(db.Integer,    nullable=True)

    created_at        = db.Column(db.DateTime,   default=datetime.utcnow)

    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id":                self.id,
            "account_type":      self.account_type,
            "first_name":        self.first_name,
            "last_name":         self.last_name,
            "email":             self.email,
            "telephone":         self.telephone,
            "address":           self.address,
            "organization_name": self.organization_name,
            "subscription_type": self.subscription_type,
            "max_users":         self.max_users,
            "max_resources":     self.max_resources,
            "created_at":        self.created_at.isoformat(),
        }

    def __repr__(self):
        return f"<Subscriber {self.id} {self.email}>"
