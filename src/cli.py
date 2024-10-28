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

    # New block to handle initial balance
    try:
        initial_balance = float(input("Enter initial deposit amount (default $0.00): "))
    except ValueError:
        initial_balance = 0  # Default to 0 if invalid input is provided

    user = DB.insert_user(name, username, password, initial_balance)
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
        balance = DB.get_user_balance(user['_id'])
        print(f"Balance: ${balance:.2f}")
    elif choice == 2:
        transactions = DB.get_user_transactions(user['_id'])
        print("Transaction History:", transactions)
    elif choice == 3:
        balance = DB.get_user_balance(user['_id'])
        transactions = DB.get_user_transactions(user['_id'])
        print(f"Balance: ${balance:.2f}")
        print("Transaction History:", transactions)
    else:
        print("Invalid choice.")

def send_money(DB, user):
    receiver_username = input("Enter the username of the receiver: ")
    amount = float(input("Enter the amount to send: "))
    if amount <= 0:
        print("Amount must be greater than zero.")
        return
    success = DB.transfer_funds(user['_id'], receiver_username, amount)
    if success:
        print(f"${amount:.2f} sent successfully.")
    else:
        print("Transaction failed. Check balance or receiver username.")

def manage_transactions(DB, user):
    print("\nFetching your transactions...")
    transactions = DB.get_user_transactions(user['_id'])
    for transaction in transactions:
        print(f"Transaction ID: {transaction['_id']}, Amount: {transaction['amount']}, Accepted: {transaction['accepted']}")
        if transaction['accepted'] is None:
            decision = input(f"Do you want to accept transaction {transaction['_id']}? (yes/no): ")
            if decision.lower() == 'yes':
                DB.update_transaction(transaction['_id'], True)
                print("Transaction accepted.")
            elif decision.lower() == 'no':
                DB.update_transaction(transaction['_id'], False)
                print("Transaction denied.")

def main():
    DB = DatabaseDriver()
    action = input("Do you want to (1) register, (2) login, or (3) exit? (Enter 1, 2, or 3): ")
    
    if action == "1":
        user = register(DB)
    elif action == "2":
        user = login(DB)
    else:
        print("Exiting program.")
        return

    if user:
        while True:
            print("\nAvailable Actions:")
            print("1) Manage Data Sharing")
            print("2) Send Money")
            print("3) Manage Transactions")
            print("4) Log Out")
            choice = input("Select an action (1, 2, 3, or 4): ")
            if choice == "1":
                select_data_sharing(DB, user)
            elif choice == "2":
                send_money(DB, user)
            elif choice == "3":
                manage_transactions(DB, user)
            elif choice == "4":
                print("Logging out.")
                break
            else:
                print("Invalid choice, please try again.")

if __name__ == "__main__":
    main()
