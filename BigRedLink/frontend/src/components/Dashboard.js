import React from 'react';

const Dashboard = ({ username, onLogout }) => {
    return (
        <div className="p-8 bg-white min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl text-red-700 font-bold">Big Red Link Fintech Dashboard</h1>
                <div>
                    <span className="text-lg mr-4 text-gray-700">Logged in as: {username}</span>
                    <button
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        onClick={onLogout}
                    >
                        Log Out
                    </button>
                </div>
            </div>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-6">
                {['Get Transaction History', 'Get Balance', 'Send Money', 'Deposit Money', 'Withdraw Money'].map(
                    (label, index) => (
                        <button
                            key={index}
                            className="bg-red-700 text-white py-3 rounded-md hover:bg-red-800 transition"
                        >
                            {label}
                        </button>
                    )
                )}
            </div>
            <div id="displayArea" className="mt-8 p-4 border border-gray-300 rounded"></div>
        </div>
    );
};

export default Dashboard;
