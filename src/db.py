import datetime
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId


def singleton(cls):
    instances = {}
    def getinstance():
        if cls not in instances:
            instances[cls] = cls()
        return instances[cls]
    return getinstance

class DatabaseDriver:
    def __init__(self):
        """Initialize the database connection to MongoDB."""
        username = "ebr66"  # MongoDB Atlas username
        password = "Soccer13"  # MongoDB Atlas password
        self.client = MongoClient(
            f"mongodb+srv://{username}:{password}@mockbankaccount.zan4j.mongodb.net/"
            "retryWrites=true&w=majority&appName=mockbankaccount"
        )
        self.db = self.client['mockbankaccount']
        self.users = self.db['users']
        self.transactions = self.db['transactions']

    def authenticate_user(self, username, password):
        """Authenticate user with hashed password."""
        user = self.users.find_one({'username': username})
        if user and check_password_hash(user['password'], password):
            return user
        return None

    def insert_user(self, first_name, last_name, username, password, initial_balance=0):
        """Inserts a new user with a hashed password into the users collection"""
        # Ensure password is a string
        if not isinstance(password, str):
            password = str(password)

        password_hash = generate_password_hash(password)
        user = {
            'first_name': first_name,
            'last_name': last_name,
            'username': username,
            'password': password_hash,
            'balance': initial_balance  # Use the initial balance provided
        }

        result = self.users.insert_one(user)
        return str(result.inserted_id)  # Return the ObjectId as a string





    def get_all_users(self):
        """Returns all users, excluding passwords and MongoDB ObjectIds."""
        return list(self.users.find({}, {'_id': 0, 'password': 0}))

    def get_user_by_id(self, user_id):
        """Retrieves a single user by MongoDB ObjectId, excluding the password."""
        user_id = ObjectId(user_id)
        return self.users.find_one({'_id': user_id}, {'password': 0})
    
    def get_user_by_username(self, username):
        """Retrieve a user by their username."""
        return self.users.find_one({'username': username})


    def delete_user_by_id(self, user_id):
        """Deletes a user from the users collection by MongoDB ObjectId."""
        user_id = ObjectId(user_id)
        return self.users.delete_one({'_id': user_id})

    def get_user_balance(self, user_id):
        """Retrieves the balance for a specified user."""
        user_id = ObjectId(user_id)
        user = self.users.find_one({'_id': user_id}, {'balance': 1, '_id': 0})
        return user['balance'] if user else None

    def update_user_balance(self, user_id, new_balance):
        """Updates the balance of a specific user."""
        user_id = ObjectId(user_id)
        return self.users.update_one({'_id': user_id}, {'$set': {'balance': new_balance}})

    def insert_transaction(self, sender_id, receiver_id, amount, message, accepted):
        """Inserts a new transaction into the transactions collection."""
        transaction = {
            'timestamp': datetime.datetime.now(),
            'sender_id': sender_id,
            'receiver_id': receiver_id,
            'amount': amount,
            'message': message,
            'accepted': accepted
        }
        result = self.transactions.insert_one(transaction)
        return result.inserted_id

    def get_transaction_by_id(self, transaction_id):
        """Retrieves a transaction by its MongoDB ObjectId."""
        return self.transactions.find_one({'_id': transaction_id}, {'_id': 0})

    def update_transaction(self, transaction_id, accepted):
        """Updates the acceptance status of a transaction."""
        return self.transactions.update_one({'_id': transaction_id}, {'$set': {'accepted': accepted}})


    def get_user_transactions(self, user_id):
        """Retrieves all transactions involving a specific user."""
        try:
            user_id = ObjectId(user_id)  # Ensure user_id is of type ObjectId
            return list(self.transactions.find({'$or': [{'sender_id': user_id}, {'receiver_id': user_id}]}))
        except Exception as e:
            print(f"Error fetching transactions: {str(e)}")
            return []

    
    def transfer_funds(self, sender_id, receiver_username, amount):
        """Transfers funds from one user to another if the sender has sufficient balance."""
        sender = self.get_user_by_id(sender_id)
        receiver = self.users.find_one({'username': receiver_username})
    
        if sender and receiver:
            if sender['balance'] >= amount:
                # Perform the transaction
                new_sender_balance = sender['balance'] - amount
                new_receiver_balance = receiver['balance'] + amount
                self.update_user_balance(sender_id, new_sender_balance)
                self.update_user_balance(receiver['_id'], new_receiver_balance)
            
                # Log the transaction
                self.insert_transaction(sender_id, receiver['_id'], amount, "Transfer to " + receiver_username, True)
                return True
            else:
                print("Insufficient funds.")
        else:
            if not receiver:
                print("Receiver not found.")
            if not sender:
                print("Sender not found.")
        return False
    
    def deposit_money(self, user_id, amount):
        """Deposits a specified amount to the user's balance."""
        user_id = ObjectId(user_id)
        if amount > 0:
            current_balance = self.get_user_balance(user_id)
            new_balance = current_balance + amount
            self.update_user_balance(user_id, new_balance)
            return True, f"Successfully deposited ${amount:.2f}. New balance: ${new_balance:.2f}."
        else:
            return False, "Deposit amount must be positive."

    def withdraw_money(self, user_id, amount):
        """Withdraws a specified amount from the user's balance if sufficient funds are available."""
        user_id = ObjectId(user_id)
        if amount > 0:
            current_balance = self.get_user_balance(user_id)
            if current_balance >= amount:
                new_balance = current_balance - amount
                self.update_user_balance(user_id, new_balance)
                return True, f"Successfully withdrew ${amount:.2f}. Remaining balance: ${new_balance:.2f}."
            else:
                return False, "Insufficient funds."
        else:
            return False, "Withdrawal amount must be positive."




DatabaseDriver = singleton(DatabaseDriver)
