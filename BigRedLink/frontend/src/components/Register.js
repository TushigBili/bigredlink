import React, { useState } from 'react';

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        password: '',
        balance: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleRegister = async () => {
        try {
            const response = await fetch('/api/users/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    username: formData.username,
                    password: formData.password,
                    balance: parseFloat(formData.balance) || 0.00
                })
            });
            const data = await response.json();

            if (data.error) {
                alert('Registration failed: ' + data.error);
            } else {
                alert('Registration successful. Redirecting to login page...');
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during registration.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h2 className="text-3xl mb-5 text-center">Register a New Account</h2>
            <form className="bg-white p-6 rounded-lg shadow-lg w-80">
                {['firstName', 'lastName', 'username', 'password', 'balance'].map((field, index) => (
                    <div className="mb-4" key={index}>
                        <label className="block text-gray-700 font-bold mb-2">
                            {field === 'balance' ? 'Initial Balance ($)' : field.charAt(0).toUpperCase() + field.slice(1) + ':'}
                        </label>
                        <input
                            type={field === 'password' ? 'password' : 'text'}
                            className="w-full px-3 py-2 border rounded"
                            name={field}
                            value={formData[field]}
                            onChange={handleInputChange}
                        />
                    </div>
                ))}
                <button
                    type="button"
                    onClick={handleRegister}
                    className="w-full bg-red-700 text-white py-2 rounded-md hover:bg-red-800 transition"
                >
                    Register
                </button>
            </form>
        </div>
    );
};

export default Register;
