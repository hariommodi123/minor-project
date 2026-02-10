import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Landmark, LayoutDashboard, LogOut, User as UserIcon, Menu, X, Home, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { signInWithGoogle } from '../firebase'

const Navbar = ({ user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL

  const handleLogin = async () => {
    try {
      await signInWithGoogle()
      setIsMenuOpen(false)
    } catch (err) {
      console.error("Firebase login failed", err)
    }
  }

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)


  return (
    <nav className="navbar glass-morphism">
      <div className="nav-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <Landmark size={32} color="var(--primary)" />
        <span>Museum</span>
      </div>

      {/* Desktop Links */}
      <div className="nav-links desktop-only">
        <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
          <Home size={20} />
          <span>Home</span>
        </Link>
        {user?.email === adminEmail && (
          <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>Admin</span>
          </Link>
        )}
        {user && (
          <Link to="/history" className={`nav-link ${isActive('/history') ? 'active' : ''}`}>
            <Clock size={20} />
            <span>History</span>
          </Link>
        )}

        {user ? (
          <div className="user-profile">
            <img src={user.picture} alt={user.name} className="user-avatar" title={user.name} />
            <button className="logout-btn" onClick={onLogout}>
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <button className="login-btn-google" onClick={handleLogin}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" />
            <span>Sign In</span>
          </button>
        )}
      </div>

      {/* Mobile Menu Toggle */}
      <button className="menu-toggle mobile-only" onClick={toggleMenu}>
        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="sidebar-overlay"
              onClick={toggleMenu}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="sidebar glass-morphism"
            >
              <div className="sidebar-header">
                <Landmark size={24} color="var(--primary)" />
                <span>Museum</span>
                <button className="close-sidebar" onClick={toggleMenu}>
                  <X size={24} />
                </button>
              </div>

              <div className="sidebar-links">
                <Link to="/" className={`sidebar-link ${isActive('/') ? 'active' : ''}`} onClick={toggleMenu}>
                  <Home size={20} />
                  <span>Home</span>
                </Link>
                {user?.email === adminEmail && (
                  <Link to="/admin" className={`sidebar-link ${isActive('/admin') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
                    <LayoutDashboard size={20} />
                    <span>Admin Panel</span>
                  </Link>
                )}
                {user && (
                  <Link to="/history" className={`sidebar-link ${isActive('/history') ? 'active' : ''}`} onClick={toggleMenu}>
                    <Clock size={20} />
                    <span>Booking History</span>
                  </Link>
                )}
              </div>

              <div className="sidebar-footer">
                {user ? (
                  <div className="sidebar-user">
                    <div className="user-info">
                      <img src={user.picture} alt={user.name} className="user-avatar" />
                      <div className="user-text">
                        <p className="user-name">{user.name}</p>
                        <p className="user-email">{user.email}</p>
                      </div>
                    </div>
                    <button className="sidebar-logout" onClick={() => { onLogout(); toggleMenu(); }}>
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <button className="sidebar-login" onClick={handleLogin}>
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" />
                    <span>Sign In with Google</span>
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>


      <style dangerouslySetInnerHTML={{
        __html: `
        .navbar {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          width: 90%;
          max-width: 1200px;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 40px;
          z-index: 1000;
        }
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: 1px;
        }
        .nav-links {
          display: flex;
          gap: 24px;
          align-items: center;
        }
        .nav-link, .sidebar-link {
          text-decoration: none;
          color: var(--text-secondary);
          font-weight: 500;
          transition: 0.3s;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
        .nav-link:hover, .sidebar-link:hover {
          color: var(--primary);
        }
        .nav-link.active, .sidebar-link.active {
          color: var(--primary);
          background: rgba(218, 165, 32, 0.1);
          padding: 8px 16px;
          border-radius: 20px;
          border: 1px solid rgba(218, 165, 32, 0.2);
        }
        .user-profile {
            display: flex;
            align-items: center;
            gap: 12px;
            background: rgba(255, 255, 255, 0.05);
            padding: 5px 5px 5px 12px;
            border-radius: 30px;
            border: 1px solid var(--glass-border);
        }
        .user-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 1px solid var(--primary);
        }
        .logout-btn {
            background: var(--glass);
            color: var(--text-secondary);
            border: none;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
        }
        .logout-btn:hover {
            background: #ff4757;
            color: white;
        }
        .login-btn-google {
            background: white;
            color: #333;
            padding: 8px 24px;
            border-radius: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 600;
            border: none;
            cursor: pointer;
            transition: 0.3s;
        }
        .login-btn-google:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(255,255,255,0.2);
        }
        .login-btn-google img {
            width: 18px;
        }

        .menu-toggle {
            background: none;
            border: none;
            color: var(--text-primary);
            cursor: pointer;
            display: none;
        }

        /* Sidebar Styles */
        .sidebar-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.6);
            backdrop-filter: blur(4px);
            z-index: 1001;
        }
        .sidebar {
            position: fixed;
            top: 0;
            right: 0;
            width: 300px;
            height: 100vh;
            background: #121417;
            z-index: 1002;
            display: flex;
            flex-direction: column;
            padding: 30px;
            border-left: 1px solid var(--glass-border);
        }
        .sidebar-header {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 50px;
        }
        .close-sidebar {
            margin-left: auto;
            background: none;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
        }
        .sidebar-links {
            display: flex;
            flex-direction: column;
            gap: 20px;
            flex: 1;
        }
        .sidebar-footer {
            padding-top: 20px;
            border-top: 1px solid var(--glass-border);
        }
        .sidebar-user {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        .user-info {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .user-text {
            overflow: hidden;
        }
        .user-name {
            font-weight: 600;
            margin: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .user-email {
            font-size: 0.8rem;
            color: var(--text-secondary);
            margin: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .sidebar-logout {
            width: 100%;
            padding: 12px;
            background: rgba(255, 71, 87, 0.1);
            color: #ff4757;
            border: 1px solid rgba(255, 71, 87, 0.2);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            font-weight: 600;
        }
        .sidebar-login {
            width: 100%;
            padding: 12px;
            background: white;
            color: #333;
            border: none;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            font-weight: 700;
            cursor: pointer;
        }

        /* Modal Styles */
        .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.8);
            backdrop-filter: blur(8px);
            z-index: 2000;
        }
        .admin-modal {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 400px;
            padding: 40px;
            z-index: 2001;
            text-align: center;
        }
        .modal-header {
            margin-bottom: 30px;
        }
        .modal-header h2 {
            margin: 15px 0 5px;
            font-size: 1.8rem;
        }
        .modal-header p {
            color: var(--text-secondary);
        }
        .input-group {
            text-align: left;
            margin-bottom: 20px;
        }
        .input-group label {
            display: block;
            margin-bottom: 8px;
            font-size: 0.9rem;
            color: var(--text-secondary);
        }
        .input-group input {
            width: 100%;
            padding: 12px;
            background: rgba(255,255,255,0.05);
            border: 1px solid var(--glass-border);
            border-radius: 10px;
            color: white;
            outline: none;
        }
        .login-submit {
            width: 100%;
            padding: 14px;
            background: var(--primary);
            color: white;
            border-radius: 10px;
            font-weight: 700;
            margin-top: 10px;
        }
        .error-text {
            color: #ff4757;
            font-size: 0.85rem;
            margin-bottom: 15px;
        }
        .close-btn {
            position: absolute;
            top: 20px;
            right: 20px;
            background: none;
            color: var(--text-secondary);
        }

        .mobile-only { display: none; }

        @media (max-width: 768px) {
          .navbar {
            padding: 0 20px;
            width: 95%;
          }
          .desktop-only {
            display: none !important;
          }
          .mobile-only {
            display: flex;
          }
          .admin-modal {
            width: 90%;
          }
        }
      `}} />
    </nav>
  )
}

export default Navbar
