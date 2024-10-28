import getpass
from db import DatabaseDriver

def register(DB):
    print("Register a new account")
    username = input("Choose a username: ")
    name = input("Enter your full name: ")
    password = getpass.getpass("Set a password: ")
    confirm_password = getpass.getpass("Confirm your password: ")

    if password != confirm_password:
        print("Passwords do not match. Please try again.")
        return None

    user = DB.insert_user(name, username, password)  # Ensure this returns the full user object
    if user:
        print("Account created successfully!")
        return user
    else:
        print("Failed to create account.")
        return None

def login(DB):
    username = input("Please enter your username: ")
    password = getpass.getpass("Please enter your password: ")
    user = DB.authenticate_user(username, password)
    if user:
        print("Login successful!")
        return user
    else:
        print("Invalid username or password.")
        return None

def select_data_sharing(DB, user):
    print("\nData Sharing Options:")
    print("1) Balance only")
    print("2) Transaction history")
    print("3) Balance and Transaction history")
    choice = int(input("Enter your choice (1, 2, or 3): "))
    
    if choice == 1:
        balance = DB.get_user_balance(user['_id'])  # Correct method to fetch balance
        print(f"Balance: ${balance:.2f}")
    elif choice == 2:
        transactions = DB.get_user_transactions(user['_id'])  # Assuming this method is correctly implemented
        print("Transaction History:", transactions)
    elif choice == 3:
        balance = DB.get_user_balance(user['_id'])  # Fetch balance
        transactions = DB.get_user_transactions(user['_id'])  # Fetch transactions
        print(f"Balance: ${balance:.2f}")
        print("Transaction History:", transactions)
    else:
        print("Invalid choice.")


def main():
    DB = DatabaseDriver()
    action = input("Do you want to (1) register or (2) login? (Enter 1 or 2): ")
    
    if action == "1":
        user = register(DB)
    elif action == "2":
        user = login(DB)
    else:
        print("Invalid selection.")
        return

    if user:
        select_data_sharing(DB, user)


if __name__ == "__main__":
    main()
