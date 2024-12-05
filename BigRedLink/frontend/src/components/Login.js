// src/components/Login.js
import React, { useState } from 'react';
import BASE_URL from '../apiConfig';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            const response = await fetch(`${BASE_URL}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();

            if (data.error) {
                alert('Login failed: ' + data.error);
            } else {
                alert('Login successful');
                onLogin(data.user_id, username);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during login.');
        }
    };

    return (
        <form className="bg-white p-8 rounded-lg shadow-lg w-80 border border-gray-300">
            <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">Username:</label>
                <input
                    type="text"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-700"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">Password:</label>
                <input
                    type="password"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-700"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <button
                type="button"
                onClick={handleLogin}
                className="w-full bg-red-700 text-white py-2 rounded-md hover:bg-red-800 transition mt-4"
            >
                Login
            </button>
        </form>
    );
};

export default Login;
