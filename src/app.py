import json
from flask import Flask, request, jsonify
import db
import getpass

app = Flask(__name__)
DB = db.DatabaseDriver()

@app.route("/")
def welcome():
    return '''
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome</title>
        <style>
            body {
                background-color: white;
                color: black;
                font-size: 24px;
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
            }
        </style>
    </head>
    <body>
        Welcome to Big Red Link
    </body>
    </html>
    '''


@app.route("/api/users/")
def get_users():
    """
    Endpoint for getting all users.
    """
    users = DB.get_all_users()
    return jsonify({"users": users}), 200

@app.route("/api/users/", methods=["POST"])
def create_user():
    """
    Endpoint for creating a user.
    """
    body = request.get_json()
    if "name" not in body or "username" not in body:
        return json.dumps({"error": "Name and username are required"}), 400
    name = body['name']
    username = body['username']
    balance = body.get("balance", 0)
    user_id = DB.insert_user(name, username, balance)
    user = DB.get_user_by_id(user_id)
    return json.dumps(user), 201

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
    receiver_id = body.get("receiver_id")
    sender_id = body.get("sender_id")
    amount = body.get("amount")

    if not all([receiver_id, sender_id, amount]):
        return json.dumps({"error": "Missing required fields"}), 400

    sender_balance = DB.get_user_balance(sender_id)
    if amount > sender_balance:
        return json.dumps({"error": "Cannot overdraw balance"}), 400

    DB.update_user_balance(sender_id, sender_balance - amount)
    receiver_balance = DB.get_user_balance(receiver_id)
    DB.update_user_balance(receiver_id, receiver_balance + amount)
    return json.dumps({"success": True, "sender_id": sender_id, "receiver_id": receiver_id, "amount": amount}), 200

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

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
