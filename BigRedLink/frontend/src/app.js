import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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
            <Routes>
                <Route
                    path="/"
                    element={
                        loggedInUser.id ? (
                            <Dashboard username={loggedInUser.username} onLogout={handleLogout} />
                        ) : (
                            <Login onLogin={handleLogin} />
                        )
                    }
                />
                <Route path="/register" element={<Register />} />
            </Routes>
        </Router>
    );
}

export default App;
