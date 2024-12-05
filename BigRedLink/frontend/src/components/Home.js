import React from 'react';

const Home = () => {
    console.log('Home component rendered'); // Add this line for debugging
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-5xl font-bold text-red-700 mb-4">Welcome to BigRedLink</h1>
            <button
                className="px-6 py-3 bg-red-700 text-white rounded-md hover:bg-red-800 transition"
                onClick={() => window.location.href = '/login'}
            >
                Login
            </button>
        </div>
    );
};

export default Home;
