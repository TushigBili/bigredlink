/**
 * Import necessary dependencies
 */
import React, { useState } from 'react'; // Import React library and useState hook
import { useNavigate } from 'react-router-dom'; // Import useNavigate to programmatically navigate between routes
import BASE_URL from '../apiConfig'; // Import BASE_URL from configuration file for API endpoint reference

/**
 * Login Component
 * @param {Function} onLogin - Function to handle successful login by updating parent state
 */
const Login = ({ onLogin }) => {
    // State for username and password
    const [username, setUsername] = useState(''); // State variable for storing the username
    const [password, setPassword] = useState(''); // State variable for storing the password
    const navigate = useNavigate(); // Hook to navigate between routes in the app

    /**
     * handleLogin function - Makes a POST request to log in the user
     */
    const handleLogin = async () => {
        try {
            console.log("Attempting to log in...");
            const response = await fetch(`${BASE_URL}/users/login`, {
                method: 'POST', // HTTP method
                headers: { 'Content-Type': 'application/json' }, // Set content type to JSON
                body: JSON.stringify({ username, password }) // Pass username and password in request body
            });

            // Check if response is successful
            if (!response.ok) {
                console.error("Response error:", response.statusText);
                throw new Error(`HTTP status ${response.status}`);
            }

            const data = await response.json(); // Parse response data

            // Check for errors in response data
            if (data.error) {
                alert('Login failed: ' + data.error); // Alert user if login fails
            } else {
                alert('Login successful'); // Notify user if login succeeds
                onLogin(data.user_id, username); // Call onLogin function to update state in the parent component
            }
        } catch (error) {
            console.error('Error:', error); // Log error to console
            alert('An error occurred during login.'); // Alert user if there is an error
        }
    };

    /**
     * Render the login form
     * Includes a form to input username and password, a button to log in, and another button to navigate to the registration page.
     */
    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            {/* Login Form */}
            <form className="bg-white p-8 rounded-lg shadow-lg w-80 border border-gray-300">
                {/* Form Title */}
                <h2 className="text-3xl font-bold mb-5 text-center text-red-700">Big Red Link Login</h2>

                {/* Username Input */}
                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Username:</label>
                    <input
                        type="text"
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-700"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)} // Update username state on input change
                    />
                </div>

                {/* Password Input */}
                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Password:</label>
                    <input
                        type="password"
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-700"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} // Update password state on input change
                    />
                </div>

                {/* Login Button */}
                <button
                    type="button"
                    onClick={handleLogin} // Call handleLogin function on button click
                    className="w-full bg-red-700 text-white py-2 rounded-md hover:bg-red-800 transition mt-4"
                >
                    Login
                </button>

                {/* Create Account Button */}
                <button
                    type="button"
                    onClick={() => navigate('/register')} // Navigate to register page on button click
                    className="w-full bg-gray-700 text-white py-2 rounded-md hover:bg-gray-800 transition mt-4"
                >
                    Create Account
                </button>
            </form>
        </div>
    );
};

// Export Login component
export default Login;
