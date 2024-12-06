// Import the React library to create functional components
import React from 'react';

// Home Component
// This component renders the homepage for the BigRedLink application.
// It includes a welcome message and a button to navigate to the login page.
const Home = () => {
    console.log('Home component rendered'); // Debugging line to verify component rendering

    return (
        // Main container div for the homepage, using Flexbox to center content
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            {/* Welcome Heading */}
            <h1 className="text-5xl font-bold text-red-700 mb-4">Welcome to BigRedLink</h1>

            {/* Login Button */}
            <button
                className="px-6 py-3 bg-red-700 text-white rounded-md hover:bg-red-800 transition"
                onClick={() => window.location.href = '/login'} // Navigate to login page when clicked
            >
                Login
            </button>
        </div>
    );
};

// Export the Home component for use in other parts of the application
export default Home;
