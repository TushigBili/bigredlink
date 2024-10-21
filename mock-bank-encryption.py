import hashlib
import base64
from cryptography.fernet import Fernet
import requests
import json
from datetime import datetime
import hmac

class MockBankEncryption:
    def __init__(self):
        """Initialize encryption keys and API endpoint"""
        # In a real implementation, these would be secure environment variables
        self.api_key = "demo_api_key_12345"
        self.api_secret = "demo_secret_key_67890"
        
        # Generate encryption key for sensitive data
        self.encryption_key = Fernet.generate_key()
        self.cipher_suite = Fernet(self.encryption_key)
        
        # Mock API endpoint (in reality, this would be the bank's actual API URL)
        self.api_endpoint = "https://mockbank.example.com/api/v1"

    def encrypt_payload(self, data):
        """Encrypt sensitive transaction data"""
        if isinstance(data, dict):
            data = json.dumps(data)
        encrypted_data = self.cipher_suite.encrypt(data.encode())
        return base64.b64encode(encrypted_data).decode()

    def decrypt_payload(self, encrypted_data):
        """Decrypt received data"""
        decoded_data = base64.b64decode(encrypted_data)
        decrypted_data = self.cipher_suite.decrypt(decoded_data)
        return json.loads(decrypted_data.decode())

    def generate_signature(self, payload):
        """Generate HMAC signature for request authentication"""
        message = f"{payload}{datetime.utcnow().isoformat()}"
        signature = hmac.new(
            self.api_secret.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()
        return signature

    def mock_api_request(self, transaction_data):
        """Simulate an API request to the bank"""
        # Encrypt sensitive data
        encrypted_payload = self.encrypt_payload(transaction_data)
        
        # Generate request signature
        signature = self.generate_signature(encrypted_payload)
        
        # Prepare headers
        headers = {
            'Authorization': f'ApiKey {self.api_key}',
            'X-Signature': signature,
            'Content-Type': 'application/json'
        }
        
        # In a real implementation, this would be an actual API call
        # Here we'll simulate the response
        mock_response = {
            'status': 'success',
            'transaction_id': f"mock_{datetime.utcnow().timestamp()}",
            'encrypted_response': self.encrypt_payload({
                'confirmation': 'Transaction processed',
                'timestamp': datetime.utcnow().isoformat()
            })
        }
        
        return mock_response

def demo_usage():
    """Demonstrate usage of the mock banking encryption system"""
    # Initialize the encryption system
    bank_encryption = MockBankEncryption()
    
    # Example transaction data
    transaction = {
        'account_number': '1234567890',
        'amount': 100.00,
        'currency': 'USD',
        'description': 'Test transaction'
    }
    
    # Process the transaction
    response = bank_encryption.mock_api_request(transaction)
    
    # Decrypt and verify the response
    decrypted_response = bank_encryption.decrypt_payload(response['encrypted_response'])
    
    return response, decrypted_response

# Example usage
if __name__ == "__main__":
    response, decrypted = demo_usage()
    print("Encrypted Response:", response)
    print("\nDecrypted Response:", decrypted)
