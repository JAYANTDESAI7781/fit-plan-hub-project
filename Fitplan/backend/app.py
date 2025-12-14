from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from models import db
from routes import api_bp
import os

app = Flask(__name__)
# Enable CORS for all domains for simplicity in dev
CORS(app)

# Config
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///fitplan.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'super-secret-key-change-this-in-prod' 

db.init_app(app)
jwt = JWTManager(app)

app.register_blueprint(api_bp, url_prefix='/api')

@app.route('/')
def serve():
    return "FitPlanHub Backend Running!"

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
