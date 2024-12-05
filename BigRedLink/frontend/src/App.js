// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';

function App() {
    const [loggedInUser, setLoggedInUser] = useState({ id: null, username: '' });

    const handleLogin = (userId, username) => {
        setLoggedInUser({ id: userId, username });
    };

    const handleLogout = () => {
        setLoggedInUser({ id: null, username: '' });
    };

    return (
        <Router>
            {/* Adding routes here */}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login onLogin={handleLogin} />} />
                <Route path="/register" element={<Register />} />
                <Route
                    path="/dashboard"
                    element={
                        loggedInUser.id ? (
                            <Dashboard username={loggedInUser.username} onLogout={handleLogout} />
                        ) : (
                            <Login onLogin={handleLogin} />
                        )
                    }
                />
                {/* Wildcard route to match any undefined paths */}
                <Route path="*" element={<Home />} />
            </Routes>
        </Router>
    );
}

export default App;
