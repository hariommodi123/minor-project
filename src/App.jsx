import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import axios from 'axios'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Admin from './pages/Admin'
import History from './pages/History'
import Chatbot from './components/Chatbot'

import API_BASE_URL from './config'

function App() {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const userData = {
                    name: firebaseUser.displayName,
                    email: firebaseUser.email,
                    picture: firebaseUser.photoURL,
                    uid: firebaseUser.uid
                }

                // Sync with backend
                try {
                    await axios.post(`${API_BASE_URL}/auth/sync`, userData)
                } catch (err) {
                    console.error("Backend sync failed", err)
                }

                setUser(userData)
                localStorage.setItem('user', JSON.stringify(userData))
            } else {
                setUser(null)
                localStorage.removeItem('user')
            }
        })
        return () => unsubscribe()
    }, [])

    const handleLogout = async () => {
        try {
            const { logout } = await import('./firebase')
            await logout()
            setUser(null)
            localStorage.removeItem('user')
            localStorage.removeItem('adminToken')
        } catch (err) {
            console.error("Logout failed", err)
        }
    }

    return (
        <Router>
            <div className="app-container">
                <Navbar user={user} onLogout={handleLogout} />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/history" element={<History user={user} />} />
                </Routes>
                <Chatbot user={user} />
            </div>
        </Router>
    )
}

export default App
