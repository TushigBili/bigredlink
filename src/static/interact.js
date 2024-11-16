let loggedInUserId = null;

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Send data to Flask via AJAX
    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({username: username, password: password})
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert('Login failed: ' + data.error);
        } else {
            alert('Login successful');
            loggedInUserId = data.user_id;  // Save user_id after successful login
            document.getElementById('userForms').style.display = 'none';
            document.getElementById('transactionButtons').style.display = 'block';
            document.getElementById('usernameDisplay').textContent = username; // Update displayed username
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred during login.');
    });
}




function register() {
    const name = document.getElementById('regName').value;
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;

    fetch('/api/users/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({name: name, username: username, password: password})
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert('Registration failed: ' + data.error);
        } else {
            alert('Registration successful');
            loggedInUserId = data.user_id;  // Save user_id after successful registration
            document.getElementById('userForms').style.display = 'none';
            document.getElementById('transactionButtons').style.display = 'block';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred during registration.');
    });
}


function getTransactionHistory() {
    if (!loggedInUserId) {
        alert("User ID not found. Please log in again.");
        return;
    }

    console.log("Fetching transactions for user:", loggedInUserId); // Add logging for debugging

    fetch(`/api/transactions/${loggedInUserId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to fetch transactions: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Transaction Data:", data); // Log response data for debugging
        const displayArea = document.getElementById('displayArea');

        if (!displayArea) {
            console.error('Error: displayArea element not found');
            return;
        }

        if (data.error) {
            displayArea.innerHTML = '<p>No transactions found.</p>';
        } else if (data.transactions && data.transactions.length > 0) {
            let transactionsHtml = '<h3>Transaction History:</h3>';
            data.transactions.forEach(transaction => {
                transactionsHtml += `<p>Transaction ID: ${transaction._id}, Amount: $${transaction.amount}, Status: ${transaction.accepted ? 'Accepted' : 'Pending'}</p>`;
            });
            displayArea.innerHTML = transactionsHtml;
        } else {
            displayArea.innerHTML = '<p>No transactions found.</p>';
        }
    })
    .catch(error => {
        console.error('Fetch Error:', error);
        alert('Failed to fetch transactions: ' + error.message);
    });
}



function getBalance() {
    if (!loggedInUserId) {
        alert("User ID not found. Please log in again.");
        return;
    }

    console.log("Fetching balance for user:", loggedInUserId); // Add logging for debugging

    fetch(`/api/balance/${loggedInUserId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to fetch balance: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Balance Data:", data); // Log response data for debugging
        const displayArea = document.getElementById('displayArea');
        if (data.error) {
            displayArea.innerHTML = 'Failed to fetch balance.';
        } else {
            displayArea.innerHTML = `<h3>Current Balance:</h3><p>$${data.balance.toFixed(2)}</p>`;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while fetching the balance.');
    });
}



function sendMoney() {
    if (!loggedInUserId) {
        alert("User ID not found. Please log in again.");
        return;
    }

    const receiverUsername = prompt("Enter the username of the receiver:");

    if (!receiverUsername) {
        alert("Receiver username is required to make a payment.");
        return;
    }

    const amount = parseFloat(prompt("Enter the amount to send:"));

    if (isNaN(amount) || amount <= 0) {
        alert("Invalid amount. Please enter a positive number.");
        return;
    }

    fetch('/api/send/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({sender_id: loggedInUserId, receiver_username: receiverUsername, amount: amount})
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert('Payment failed: ' + data.error);
        } else {
            alert(`Payment of $${amount.toFixed(2)} to ${receiverUsername} successful.`);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred during the payment process.');
    });
}



function logout() {
    // Clear user data and reset the UI
    loggedInUserId = null;
    document.getElementById('userForms').style.display = 'block';
    document.getElementById('transactionButtons').style.display = 'none';
    document.getElementById('displayArea').innerHTML = '';  // Clear the display area
}

function depositMoney() {
    if (!loggedInUserId) {
        alert("User ID not found. Please log in again.");
        return;
    }

    const amount = parseFloat(prompt("Enter the amount to deposit:"));

    if (isNaN(amount) || amount <= 0) {
        alert("Invalid amount. Please enter a positive number.");
        return;
    }

    fetch('/api/deposit/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({user_id: loggedInUserId, amount: amount})
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert('Deposit failed: ' + data.error);
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred during the deposit process.');
    });
}

function withdrawMoney() {
    if (!loggedInUserId) {
        alert("User ID not found. Please log in again.");
        return;
    }

    const amount = parseFloat(prompt("Enter the amount to withdraw:"));

    if (isNaN(amount) || amount <= 0) {
        alert("Invalid amount. Please enter a positive number.");
        return;
    }

    fetch('/api/withdraw/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({user_id: loggedInUserId, amount: amount})
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert('Withdrawal failed: ' + data.error);
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred during the withdrawal process.');
    });
}

