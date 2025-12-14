from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User, Plan, Subscription

api_bp = Blueprint('api', __name__)

# --- Auth ---
@api_bp.route('/auth/signup', methods=['POST'])
def signup():
    data = request.json
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"msg": "Email already exists"}), 400
    
    user = User(
        username=data['username'],
        email=data['email'],
        password_hash=generate_password_hash(data['password']),
        role=data['role']
    )
    db.session.add(user)
    db.session.commit()
    
    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": user.to_dict()}), 201

@api_bp.route('/auth/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({"msg": "Invalid credentials"}), 401
    
    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": user.to_dict()}), 200

# --- Plans ---
@api_bp.route('/plans', methods=['GET'])
def get_plans():
    plans = Plan.query.all()
    # Public view logic can be handled here or frontend. 
    # For list view we generally show previews.
    return jsonify([p.to_dict() for p in plans]), 200

@api_bp.route('/plans', methods=['POST'])
@jwt_required()
def create_plan():
    print("DEBUG: Entered create_plan")
    user_id = get_jwt_identity()
    print(f"DEBUG: user_id from jwt: {user_id}")
    user = User.query.get(int(user_id)) # Cast back to int for DB lookup
    if not user:
        return jsonify({"msg": "User not found"}), 404
        
    if user.role != 'trainer':
        return jsonify({"msg": "Only trainers can create plans"}), 403
    
    data = request.json
    try:
        plan = Plan(
            trainer_id=int(user_id),
            title=data['title'],
            description=data['description'],
            price=float(data['price']),
            duration=data['duration']
        )
        db.session.add(plan)
        db.session.commit()
        return jsonify(plan.to_dict()), 201
    except Exception as e:
        print(f"DEBUG: Error creating plan: {e}")
        return jsonify({"msg": "Error creating plan"}), 500

@api_bp.route('/plans/<int:plan_id>', methods=['DELETE'])
@jwt_required()
def delete_plan(plan_id):
    user_id = int(get_jwt_identity())
    plan = Plan.query.get_or_404(plan_id)
    if plan.trainer_id != user_id:
        return jsonify({"msg": "Unauthorized"}), 403
    
    db.session.delete(plan)
    db.session.commit()
    return jsonify({"msg": "Plan deleted"}), 200

@api_bp.route('/plans/<int:plan_id>', methods=['GET'])
@jwt_required(optional=True)
def get_plan_details(plan_id):
    current_user_id = get_jwt_identity()
    if current_user_id:
        current_user_id = int(current_user_id)
        
    plan = Plan.query.get_or_404(plan_id)
    
    # Check access
    has_access = False
    if current_user_id:
        # Is trainer owner?
        if plan.trainer_id == current_user_id:
            has_access = True
        else:
            # Is subscribed?
            sub = Subscription.query.filter_by(user_id=current_user_id, plan_id=plan_id).first()
            if sub:
                has_access = True
    
    data = plan.to_dict()
    # In a real app we would hide description here if !has_access
    # But for this demo we simply flag it.
    
    data['has_access'] = has_access
    return jsonify(data), 200

# --- Subscriptions ---
@api_bp.route('/subscribe/<int:plan_id>', methods=['POST'])
@jwt_required()
def subscribe(plan_id):
    user_id = int(get_jwt_identity())
    if Subscription.query.filter_by(user_id=user_id, plan_id=plan_id).first():
        return jsonify({"msg": "Already subscribed"}), 400
    
    sub = Subscription(user_id=user_id, plan_id=plan_id)
    db.session.add(sub)
    db.session.commit()
    return jsonify({"msg": "Subscribed successfully"}), 200

@api_bp.route('/my-subscriptions', methods=['GET'])
@jwt_required()
def my_subscriptions():
    user_id = int(get_jwt_identity())
    subs = Subscription.query.filter_by(user_id=user_id).all()
    # Return full plan details for subs
    plans = [Plan.query.get(s.plan_id).to_dict() for s in subs]
    return jsonify(plans), 200

# --- Following ---
@api_bp.route('/follow/<int:trainer_id>', methods=['POST'])
@jwt_required()
def follow(trainer_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    trainer = User.query.get_or_404(trainer_id)
    
    if trainer in user.following:
        return jsonify({"msg": "Already following"}), 400
        
    user.following.append(trainer)
    db.session.commit()
    return jsonify({"msg": "Followed"}), 200

@api_bp.route('/unfollow/<int:trainer_id>', methods=['POST'])
@jwt_required()
def unfollow(trainer_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    trainer = User.query.get_or_404(trainer_id)
    
    if trainer in user.following:
        user.following.remove(trainer)
        db.session.commit()
        return jsonify({"msg": "Unfollowed"}), 200
    return jsonify({"msg": "Not following"}), 400

@api_bp.route('/feed', methods=['GET'])
@jwt_required()
def user_feed():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    # Plans from followed trainers
    followed_plans = []
    for trainer in user.following:
        followed_plans.extend(trainer.plans)
        
    # Sort by new?
    followed_plans.sort(key=lambda x: x.created_at, reverse=True)
    
    return jsonify([p.to_dict() for p in followed_plans]), 200

@api_bp.route('/trainers', methods=['GET'])
def get_trainers():
    trainers = User.query.filter_by(role='trainer').all()
    return jsonify([t.to_dict() for t in trainers]), 200
