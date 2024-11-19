import json
from flask import Flask, request, jsonify, render_template
import db
import getpass
from flask_cors import CORS



app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)
DB = db.DatabaseDriver()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/login', methods=['POST'])
def login():
    username = request.json.get('username')
    password = request.json.get('password')
    user = DB.authenticate_user(username, password)
    if user:
        return jsonify({"message": "Login successful", "user_id": str(user['_id'])}), 200
    else:
        return jsonify({"error": "Invalid username or password"}), 401

@app.route("/api/users/")
def get_users():
    """
    Endpoint for getting all users.
    """
    users = DB.get_all_users()
    return jsonify({"users": users}), 200

@app.route("/api/users/", methods=["POST"])
def create_user():
    """Endpoint for creating a user."""
    try:
        body = request.get_json()
        if not all(key in body for key in ['name', 'username', 'password']):
            return jsonify({"error": "Name, username, and password are required"}), 400
        name = body['name']
        username = body['username']
        password = body['password']
        balance = body.get("balance", 0)
        user_id = DB.insert_user(name, username, password, balance)
        return jsonify({"message": "Registration successful", "user_id": user_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route("/api/users/<user_id>/", methods=["GET", "DELETE"])
def manage_user(user_id):
    """
    Endpoint to get or delete a user by their ID.
    """
    if request.method == 'GET':
        user = DB.get_user_by_id(user_id)
        if user is None:
            return json.dumps({"error": "User not found"}), 404
        return json.dumps(user), 200
    elif request.method == 'DELETE':
        result = DB.delete_user_by_id(user_id)
        if result.deleted_count == 0:
            return json.dumps({"error": "User not found"}), 404
        return json.dumps({"success": True}), 200

@app.route("/api/send/", methods=["POST"])
def send_money():
    """
    Endpoint for sending money from one user to another.
    """
    body = request.get_json()
    sender_id = body.get("sender_id")
    receiver_username = body.get("receiver_username")
    amount = body.get("amount")

    if not all([sender_id, receiver_username, amount]):
        return jsonify({"error": "Missing required fields"}), 400

    receiver = DB.get_user_by_username(receiver_username)
    if not receiver:
        return jsonify({"error": "Receiver not found"}), 404

    sender_balance = DB.get_user_balance(sender_id)
    if sender_balance is None:
        return jsonify({"error": "Sender not found"}), 404

    if amount > sender_balance:
        return jsonify({"error": "Cannot overdraw balance"}), 400

    # Update balances
    DB.update_user_balance(sender_id, sender_balance - amount)
    receiver_balance = DB.get_user_balance(receiver["_id"])
    DB.update_user_balance(receiver["_id"], receiver_balance + amount)

    # Insert the transaction
    DB.insert_transaction(sender_id, receiver["_id"], amount, "Payment", True)

    return jsonify({"success": True, "sender_id": sender_id, "receiver_id": str(receiver["_id"]), "amount": amount}), 200


@app.route("/api/transactions/", methods=["POST"])
def create_transaction():
    """
    Endpoint for creating a transaction between two users.
    """
    body = request.get_json()
    sender_id = body.get("sender_id")
    receiver_id = body.get("receiver_id")
    amount = body.get("amount")
    message = body.get("message")
    accepted = body.get("accepted", False)  # Default to False if not provided

    transx_id = DB.insert_transaction(sender_id, receiver_id, amount, message, accepted)
    transaction = DB.get_transaction_by_id(transx_id)
    return json.dumps(transaction), 201

@app.route("/api/transactions/<transx_id>/", methods=["POST"])
def accept_deny_payment_request(transx_id):
    """
    Endpoint to accept or deny a payment request.
    """
    body = request.get_json()
    accepted = body.get("accepted")

    if accepted is None:
        return json.dumps({"error": "Accepted status must be provided"}), 400

    transaction = DB.get_transaction_by_id(transx_id)
    if transaction is None:
        return json.dumps({"error": "Transaction not found"}), 404

    if transaction.get("accepted") is not None:
        return json.dumps({"error": "Transaction has already been processed"}), 403

    DB.update_transaction(transx_id, accepted)
    transaction = DB.get_transaction_by_id(transx_id)
    return json.dumps(transaction), 200

@app.route('/api/balance/<user_id>', methods=['GET'])
def get_balance(user_id):
    balance = DB.get_user_balance(user_id)
    if balance is not None:
        return jsonify({'balance': balance}), 200
    else:
        return jsonify({'error': 'User not found'}), 404

@app.route("/api/transactions/<user_id>", methods=["GET"])
def get_user_transactions(user_id):
    """
    Endpoint for getting all transactions for a specific user.
    """
    try:
        transactions = DB.get_user_transactions(user_id)
        if transactions:
            return jsonify({"transactions": transactions}), 200
        else:
            return jsonify({"error": "No transactions found"}), 404
    except Exception as e:
        print(f"Error fetching transactions: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/deposit/', methods=['POST'])
def deposit():
    """Endpoint for depositing money to a user's account."""
    body = request.get_json()
    user_id = body.get("user_id")
    amount = body.get("amount")

    if not all([user_id, amount]):
        return jsonify({"error": "User ID and amount are required"}), 400

    if amount <= 0:
        return jsonify({"error": "Deposit amount must be greater than zero"}), 400

    success, message = DB.deposit_money(user_id, amount)
    if success:
        return jsonify({"message": message}), 200
    else:
        return jsonify({"error": message}), 400


@app.route('/api/withdraw/', methods=['POST'])
def withdraw():
    """Endpoint for withdrawing money from a user's account."""
    body = request.get_json()
    user_id = body.get("user_id")
    amount = body.get("amount")

    if not all([user_id, amount]):
        return jsonify({"error": "User ID and amount are required"}), 400

    if amount <= 0:
        return jsonify({"error": "Withdraw amount must be greater than zero"}), 400

    success, message = DB.withdraw_money(user_id, amount)
    if success:
        return jsonify({"message": message}), 200
    else:
        return jsonify({"error": message}), 400


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)

