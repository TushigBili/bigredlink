import datetime
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash

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

    def insert_user(self, name, username, password):
        """ Inserts a new user with a hashed password into the users collection and returns the user object. """
        password_hash = generate_password_hash(password)
        user = {
            'name': name,
            'username': username,
            'password': password_hash,
            'balance': 0  # Starting balance
        }
        
        self.users.insert_one(user)
        return self.users.find_one({'username': username}, {'password': 0})  # Return user without password

    def get_all_users(self):
        """Returns all users, excluding passwords and MongoDB ObjectIds."""
        return list(self.users.find({}, {'_id': 0, 'password': 0}))

    def get_user_by_id(self, user_id):
        """Retrieves a single user by MongoDB ObjectId, excluding the password."""
        return self.users.find_one({'_id': user_id}, {'_id': 0, 'password': 0})

    def delete_user_by_id(self, user_id):
        """Deletes a user from the users collection by MongoDB ObjectId."""
        return self.users.delete_one({'_id': user_id})

    def get_user_balance(self, user_id):
        """Retrieves the balance for a specified user."""
        user = self.users.find_one({'_id': user_id}, {'balance': 1, '_id': 0})
        return user['balance'] if user else None

    def update_user_balance(self, user_id, new_balance):
        """Updates the balance of a specific user."""
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
        return list(self.transactions.find({'$or': [{'sender_id': user_id}, {'receiver_id': user_id}]}))

DatabaseDriver = singleton(DatabaseDriver)
