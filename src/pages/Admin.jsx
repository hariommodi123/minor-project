import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, Users, IndianRupee, Calendar, Eye, Loader2, Lock, ShieldCheck, Landmark, Trash2, Plus, Edit2, Scan, CheckCircle2, XCircle, Ticket, List, CalendarDays } from 'lucide-react'
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode'
import axios from 'axios'

import API_BASE_URL from '../config'

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('adminToken'))
  const [analytics, setAnalytics] = useState({
    stats: { totalSales: 0, totalBookings: 0 },
    recentBookings: []
  })
  const [ticketTypes, setTicketTypes] = useState([])
  const [loading, setLoading] = useState(isAuthenticated)
  const [activeTab, setActiveTab] = useState('analytics')
  const [isAdding, setIsAdding] = useState(false)
  const [editingTicket, setEditingTicket] = useState(null)
  const [newTicket, setNewTicket] = useState({ name: '', price: 0, description: '', category: 'Entry', dailyLimit: 100 })
  const [loginData, setLoginData] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [scanResult, setScanResult] = useState(null)
  const [isScanning, setIsScanning] = useState(false)
  const [targetExp, setTargetExp] = useState('All')
  const [isScannerFull, setIsScannerFull] = useState(false)

  // Slots View State
  const [viewingSlots, setViewingSlots] = useState(null)
  const [slotsData, setSlotsData] = useState([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [currentExpName, setCurrentExpName] = useState('')

  const targetExpRef = React.useRef(targetExp)
  const scannerRef = React.useRef(null)
  const isProcessingRef = React.useRef(false)

  useEffect(() => {
    targetExpRef.current = targetExp
  }, [targetExp])

  useEffect(() => {
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL
    const loggedUser = JSON.parse(localStorage.getItem('user'))

    if (isAuthenticated && loggedUser?.email !== adminEmail) {
      handleLogout()
      return
    }

    if (isAuthenticated) {
      fetchAnalytics()
      fetchTicketTypes()
    }
  }, [isAuthenticated])

  const fetchAnalytics = async () => {
    const token = localStorage.getItem('adminToken')
    try {
      const res = await axios.get(`${API_BASE_URL}/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        setAnalytics({
          stats: res.data.stats,
          recentBookings: res.data.recentBookings
        })
      }
    } catch (err) {
      console.error("Failed to fetch analytics", err)
      if (err.response?.status === 401) {
        handleLogout()
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchTicketTypes = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/ticket-types`)
      if (res.data.success) {
        setTicketTypes(res.data.types)
      }
    } catch (err) {
      console.error("Failed to fetch tickets", err)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/admin-login`, loginData)
      if (res.data.success) {
        localStorage.setItem('adminToken', res.data.token)
        setIsAuthenticated(true)
        setLoading(true)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    setIsAuthenticated(false)
  }

  const handleCreateTicket = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('adminToken')
    try {
      const res = await axios.post(`${API_BASE_URL}/ticket-types`, newTicket, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        setTicketTypes([...ticketTypes, res.data.type])
        setIsAdding(false)
        setNewTicket({ name: '', price: 0, description: '', category: 'Entry', dailyLimit: 100 })
      }
    } catch (err) {
      alert("Failed to create experience")
    }
  }

  const handleDeleteTicket = async (id) => {
    const token = localStorage.getItem('adminToken')
    if (!window.confirm("Remove this experience?")) return
    try {
      await axios.delete(`${API_BASE_URL}/ticket-types/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTicketTypes(ticketTypes.filter(t => t._id !== id))
    } catch (err) {
      alert("Failed to delete")
    }
  }

  const handleViewSlots = async (type) => {
    setViewingSlots(type._id);
    setCurrentExpName(type.name);
    setSlotsLoading(true);
    const token = localStorage.getItem('adminToken');
    try {
      const res = await axios.get(`${API_BASE_URL}/ticket-types/${type._id}/slots`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setSlotsData(res.data.slots);
      }
    } catch (err) {
      alert("Failed to fetch slots");
      setViewingSlots(null);
    } finally {
      setSlotsLoading(false);
    }
  }

  const handleEditClick = (ticket) => {
    setEditingTicket(ticket)
    setNewTicket(ticket)
    setIsAdding(true)
  }

  const handleUpdateTicket = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('adminToken')
    try {
      const res = await axios.put(`${API_BASE_URL}/ticket-types/${editingTicket._id}`, newTicket, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        setTicketTypes(ticketTypes.map(t => t._id === editingTicket._id ? res.data.type : t))
        setIsAdding(false)
        setEditingTicket(null)
        setNewTicket({ name: '', price: 0, description: '', category: 'Entry', dailyLimit: 100 })
      }
    } catch (err) {
      alert("Failed to update experience")
    }
  }

  const handleFileScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Use a temporary div for file scanning to avoid conflict with the live scanner
    const tempId = "file-qr-reader-temp";
    let tempElement = document.getElementById(tempId);
    if (!tempElement) {
      tempElement = document.createElement('div');
      tempElement.id = tempId;
      tempElement.style.display = 'none';
      document.body.appendChild(tempElement);
    }

    const html5QrCode = new Html5Qrcode(tempId);
    try {
      const decodedText = await html5QrCode.scanFile(file, true);
      onScanSuccess(decodedText);
    } catch (err) {
      setScanResult({ success: false, message: "Could not find a valid QR code in this image. Please ensure the QR is clear and well-lit." });
    } finally {
      setTimeout(() => {
        html5QrCode.clear();
      }, 500);
    }
  }

  // Scanner Logic
  useEffect(() => {
    if (activeTab === 'scanner') {
      const config = {
        fps: 20,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const size = Math.floor(minEdge * 0.7);
          return { width: size, height: size };
        },
        rememberLastUsedCamera: true,
        supportedScanTypes: [0], // Camera only for the live scanner
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        }
      };

      scannerRef.current = new Html5QrcodeScanner("reader", config, false);
      scannerRef.current.render(onScanSuccess, onScanError);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => console.error("Failed to clear scanner", e));
        scannerRef.current = null;
      }
    }
  }, [activeTab]);

  const playSound = (type) => {
    const successUrl = "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3";
    const errorUrl = "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3";
    const audio = new Audio(type === 'success' ? successUrl : errorUrl);
    audio.play().catch(e => console.error("Audio play blocked", e));
  }

  async function onScanSuccess(decodedText) {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    setIsScanning(true);
    const token = localStorage.getItem('adminToken');
    try {
      const res = await axios.get(`${API_BASE_URL}/verify-ticket/${decodedText}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        const booking = res.data.booking;
        const currentTarget = targetExpRef.current;
        if (currentTarget !== 'All' && booking.ticketType !== currentTarget) {
          playSound('error');
          setScanResult({
            success: false,
            message: `Experience Mismatch: Pass is for "${booking.ticketType}", not "${currentTarget}".`
          });
        } else {
          playSound('success');
          setScanResult({ success: true, data: res.data });
        }
      }
    } catch (err) {
      playSound('error');
      setScanResult({ success: false, message: err.response?.data?.message || "Invalid Pass ID" });
    } finally {
      setIsScanning(false);
      // Short delay before allowing next scan to prevent double detection
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 1000);
    }
  }

  function onScanError(err) {
    // Silent errors for continuous scanning
  }

  const totalGuests = analytics.stats.genderStats?.totalGuests || 1
  const maleCount = analytics.stats.genderStats?.male || 0
  const femaleCount = analytics.stats.genderStats?.female || 0

  const stats = [
    { label: 'Total Sales', value: `₹${analytics.stats.totalSales.toLocaleString('en-IN')}`, icon: <IndianRupee />, color: '#DAA520' },
    { label: 'Total Bookings', value: analytics.stats.totalBookings, icon: <Calendar />, color: '#4CAF50' },
    { label: 'Male Visitors', value: `${maleCount} (${((maleCount / totalGuests) * 100).toFixed(1)}%)`, icon: <Users />, color: '#3498db' },
    { label: 'Female Visitors', value: `${femaleCount} (${((femaleCount / totalGuests) * 100).toFixed(1)}%)`, icon: <Users />, color: '#e91e63' },
  ]

  if (!isAuthenticated) {
    return (
      <div className="admin-auth-page">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="login-card glass-morphism"
        >
          <div className="login-header">
            <div className="lock-icon">
              <Lock size={30} />
            </div>
            <h2>Admin Access</h2>
            <p>Museum Control Center</p>
          </div>
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Admin Email</label>
              <input
                type="text"
                value={loginData.username}
                placeholder="Enter admin email..."
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                required
              />
            </div>
            <div className="input-group">
              <label>Security Key</label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required
              />
            </div>
            {error && <p className="error-msg">{error}</p>}
            <button type="submit" className="login-btn">Authenticate</button>
          </form>
        </motion.div>
        <style>{`
            .admin-auth-page { height: 100vh; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle at center, #1a1d21 0%, #0f1113 100%); }
            .login-card { width: 100%; max-width: 400px; padding: 40px; text-align: center; }
            .lock-icon { width: 70px; height: 70px; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; color: white; box-shadow: 0 0 30px rgba(218, 165, 32, 0.3); }
            .login-header h2 { margin-bottom: 8px; }
            .login-header p { color: var(--text-secondary); margin-bottom: 30px; }
            .input-group { text-align: left; margin-bottom: 20px; }
            .input-group label { display: block; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 8px; }
            .input-group input { width: 100%; padding: 12px 16px; background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); border-radius: 10px; color: white; outline: none; }
            .input-group input:focus { border-color: var(--primary); }
            .login-btn { width: 100%; padding: 14px; background: var(--primary); color: white; font-weight: 700; border-radius: 10px; margin-top: 10px; }
            .error-msg { color: #ff4757; font-size: 0.85rem; margin-bottom: 15px; }
        `}</style>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="admin-loader">
        <Loader2 className="animate-spin" size={48} color="var(--primary)" />
        <style>{`
            .admin-loader { height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg-dark); }
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            .animate-spin { animation: spin 1s linear infinite; }
        `}</style>
      </div>
    )
  }

  return (
    <div className="admin-container">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Museum Control Hub</h1>
            <p>Manage analytics, experiences, and digital ticket blueprints.</p>
          </div>
          <button className="logout-btn-text" onClick={handleLogout}>Logout</button>
        </div>
      </motion.div>

      <div className="admin-tabs">
        <button className={activeTab === 'analytics' ? 'active' : ''} onClick={() => setActiveTab('analytics')}>Analytics</button>
        <button className={activeTab === 'management' ? 'active' : ''} onClick={() => setActiveTab('management')}>Manage Experiences</button>
        <button className={activeTab === 'scanner' ? 'active' : ''} onClick={() => setActiveTab('scanner')}>Scan Pass</button>
      </div>

      {activeTab === 'analytics' ? (
        <>
          <div className="stats-grid">
            {stats.map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="stat-card glass-morphism">
                <div className="stat-icon" style={{ background: `${stat.color}22`, color: stat.color }}>{stat.icon}</div>
                <div className="stat-info">
                  <span className="stat-label">{stat.label}</span>
                  <span className="stat-value">{stat.value}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="admin-content">
            <div className="recent-bookings glass-morphism">
              <div className="section-header">
                <h3>Recent Transactions</h3>
                <Eye size={20} color="var(--primary)" />
              </div>
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Visitor</th>
                      <th>Experience</th>
                      <th>Date</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.recentBookings.map((b, i) => (
                      <tr key={i}>
                        <td>#{b.bookingId}</td>
                        <td className="visitor-cell"><Users size={14} /> {b.visitorName}</td>
                        <td>{b.ticketType}</td>
                        <td>{b.date}</td>
                        <td className="amt-cell">₹{b.totalAmount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : activeTab === 'management' ? (
        <div className="management-container">
          <div className="management-header">
            <h2>Experience & Show Management</h2>
            <button className="add-exp-btn" onClick={() => setIsAdding(true)}><Plus size={18} /> Create Experience</button>
          </div>

          <div className="exp-grid">
            {ticketTypes.map((type, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="exp-card glass-morphism">
                <div className="exp-header">
                  <span className="exp-category">{type.category}</span>
                  <div className="exp-actions">
                    <button onClick={() => handleViewSlots(type)} className="view-slots" title="View Availability"><CalendarDays size={16} /></button>
                    <button onClick={() => handleEditClick(type)} className="edit-exp"><Edit2 size={16} /></button>
                    <button onClick={() => handleDeleteTicket(type._id)} className="delete-exp"><Trash2 size={16} /></button>
                  </div>
                </div>
                <h3>{type.name}</h3>
                <p>{type.description || 'Museum experience or show'}</p>
                <div className="exp-footer">
                  <span className="exp-price">₹{type.price}</span>
                  <span className="exp-limit-badge">Limit: {type.dailyLimit}/day</span>
                </div>

              </motion.div>
            ))}
          </div>

          <AnimatePresence>
            {isAdding && (
              <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}>
                <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="exp-modal glass-morphism">
                  <div className="modal-header-text">
                    <h3>{editingTicket ? 'Edit Experience' : 'New Museum Experience'}</h3>
                    <p>{editingTicket ? 'Update the details for this offering.' : 'This will be instantly synced to the AI Concierge.'}</p>
                  </div>
                  <form onSubmit={editingTicket ? handleUpdateTicket : handleCreateTicket}>
                    <div className="input-group">
                      <label>Experience Name</label>
                      <input value={newTicket.name} onChange={e => setNewTicket({ ...newTicket, name: e.target.value })} required placeholder="e.g. Roman Mythology Show" />
                    </div>
                    <div className="input-group">
                      <label>Price (₹)</label>
                      <input type="number" value={newTicket.price} onChange={e => setNewTicket({ ...newTicket, price: e.target.value })} required />
                    </div>
                    <div className="input-group">
                      <label>Category</label>
                      <select value={newTicket.category} onChange={e => setNewTicket({ ...newTicket, category: e.target.value })}>
                        <option value="Entry">Museum Entry</option>
                        <option value="Show">Show / Event</option>
                        <option value="Exhibit">Temporary Exhibit</option>
                      </select>
                    </div>
                    <div className="input-group">
                      <label>Daily Ticket Limit</label>
                      <input type="number" value={newTicket.dailyLimit} onChange={e => setNewTicket({ ...newTicket, dailyLimit: e.target.value })} required />
                    </div>
                    <div className="input-group">
                      <label>Brief Description</label>
                      <input value={newTicket.description} onChange={e => setNewTicket({ ...newTicket, description: e.target.value })} placeholder="Show description in 1 line..." />
                    </div>
                    <div className="modal-actions">
                      <button type="button" onClick={() => { setIsAdding(false); setEditingTicket(null); }} className="cancel-btn">Discard</button>
                      <button type="submit" className="save-btn">{editingTicket ? 'Save Changes' : 'Confirm & Publish'}</button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {viewingSlots && (
              <div className="modal-overlay" onClick={() => setViewingSlots(null)} style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="slots-modal glass-morphism"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="modal-header-text">
                    <h3>{currentExpName} - Availability</h3>
                    <p>30-Day Outlook</p>
                  </div>

                  {slotsLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                      <Loader2 className="animate-spin" size={32} color="var(--primary)" />
                    </div>
                  ) : (
                    <div className="slots-grid-view">
                      {slotsData.map((slot, i) => (
                        <div key={i} className={`slot-item ${slot.available === 0 ? 'full' : ''}`}>
                          <div className="slot-date-header">
                            <span className="s-day">{new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                            <span className="s-date">{new Date(slot.date).getDate()}</span>
                            <span className="s-month">{new Date(slot.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                          </div>
                          <div className="slot-stats-row">
                            <div className="stat-pill booking">
                              <span>Booked</span>
                              <strong>{slot.booked}</strong>
                            </div>
                            <div className="stat-pill available">
                              <span>Open</span>
                              <strong>{slot.available}</strong>
                            </div>
                          </div>
                          <div className="capacity-bar">
                            <div className="c-fill" style={{ width: `${Math.min(100, (slot.booked / slot.total) * 100)}%`, background: slot.available === 0 ? '#ff4757' : 'var(--primary)' }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <button className="close-slots-btn" onClick={() => setViewingSlots(null)}>Close View</button>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="scanner-container-full">
          <button className="exit-scanner-btn" onClick={() => setActiveTab('analytics')}>
            <XCircle size={24} /> Exit Scanner
          </button>
          <div className="scanner-layout">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="scanner-viewport glass-morphism">
              <div className="scanner-header">
                <Scan size={24} color="var(--primary)" />
                <h3>Entrance Verification</h3>
              </div>

              <div className="scanner-config">
                <label>Verify Entrance For:</label>
                <select value={targetExp} onChange={(e) => setTargetExp(e.target.value)} className="target-exp-select">
                  <option value="All">All Experiences</option>
                  {ticketTypes.map(t => (
                    <option key={t._id} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div id="reader"></div>

              <div className="scanner-file-upload">
                <div className="divider-text">OR</div>
                <label className="file-upload-label">
                  <Plus size={18} />
                  <span>Verify from Image</span>
                  <input type="file" accept="image/*" onChange={handleFileScan} style={{ display: 'none' }} />
                </label>
              </div>

              <p className="scanner-hint">Position the user's QR code within the frame or upload an image.</p>
            </motion.div>
          </div>

          <AnimatePresence>
            {scanResult && (
              <div className="scan-result-overlay" onClick={() => setScanResult(null)}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className={`result-modal glass-morphism ${scanResult.success ? 'success' : 'error'}`}
                  onClick={e => e.stopPropagation()}
                >
                  {scanResult.success ? (
                    <>
                      <div className="result-header">
                        <CheckCircle2 color="#4CAF50" size={56} />
                        <div>
                          <h4>Valid Access Pass</h4>
                          <p className="bp-id">#{scanResult.data.booking.bookingId}</p>
                        </div>
                      </div>
                      <div className="visitor-meta">
                        <div className="v-row"><span>Visitor:</span> <strong>{scanResult.data.booking.visitorName}</strong></div>
                        <div className="v-row"><span>Experience:</span> <strong>{scanResult.data.booking.ticketType}</strong></div>
                        <div className="v-row"><span>Visit Date:</span> <strong>{scanResult.data.booking.date}</strong></div>
                        <div className="v-row">
                          <span>Booking Time:</span>
                          <strong>
                            {new Date(scanResult.data.booking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </strong>
                        </div>
                        <div className="v-row"><span>Guests:</span> <strong>{scanResult.data.booking.quantity}</strong></div>
                      </div>

                      {scanResult.data.booking.guestDetails && scanResult.data.booking.guestDetails.length > 0 && (
                        <div className="guest-details-verification">
                          <h5>Guest List</h5>
                          {scanResult.data.booking.guestDetails.map((g, idx) => (
                            <div key={idx} className="guest-v-row">
                              <span className="g-name">{idx + 1}. {g.name}</span>
                              <span className="g-meta">{g.gender}, {g.age}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="exp-details-box">
                        <p>{scanResult.data.experience.description}</p>
                      </div>
                      <button className="reset-scan" onClick={() => setScanResult(null)}>Scan Next Pass</button>
                    </>
                  ) : (
                    <div className="error-result">
                      <XCircle color="#ff4757" size={56} />
                      <h4>Pass Verification Failed</h4>
                      <p>{scanResult.message}</p>
                      <button className="reset-scan error-btn" onClick={() => setScanResult(null)}>Try Again</button>
                    </div>
                  )}
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .admin-container { padding: 120px 8% 60px; min-height: 100vh; }
        .admin-header { margin-bottom: 40px; }
        .admin-header h1 { font-size: 2.5rem; margin-bottom: 8px; }
        .admin-header p { color: var(--text-secondary); }
        .logout-btn-text { color: var(--text-secondary); font-size: 0.9rem; text-decoration: underline; background: none; transition: 0.3s; }
        .logout-btn-text:hover { color: #ff4757; }

        .admin-tabs { display: flex; gap: 8px; margin-bottom: 40px; background: rgba(255,255,255,0.03); padding: 6px; border-radius: 12px; width: fit-content; border: 1px solid var(--glass-border); }
        .admin-tabs button { background: none; color: var(--text-secondary); padding: 10px 24px; border-radius: 8px; font-weight: 600; font-size: 0.95rem; }
        .admin-tabs button.active { background: var(--primary); color: white; box-shadow: 0 4px 12px rgba(218, 165, 32, 0.2); }

        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; margin-bottom: 40px; }
        .stat-card { padding: 24px; display: flex; align-items: center; gap: 20px; }
        .stat-icon { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
        .stat-info { display: flex; flex-direction: column; }
        .stat-label { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 4px; font-weight: 500; }
        .stat-value { font-size: 1.6rem; font-weight: 800; }

        .recent-bookings { padding: 32px; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .table-responsive { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 16px; color: var(--text-secondary); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid var(--glass-border); }
        td { padding: 16px; border-bottom: 1px solid var(--glass-border); font-size: 0.95rem; }
        .amt-cell { font-weight: 800; color: var(--primary); }
        .visitor-cell { display: flex; align-items: center; gap: 8px; font-weight: 500; }

        .management-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .add-exp-btn { background: var(--primary); color: white; padding: 12px 24px; border-radius: 12px; font-weight: 700; display: flex; align-items: center; gap: 10px; box-shadow: 0 4px 15px rgba(218, 165, 32, 0.2); }
        .exp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 28px; }
        .exp-card { padding: 28px; }
        .exp-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
        .exp-category { background: rgba(218, 165, 32, 0.1); color: var(--primary); padding: 5px 12px; border-radius: 6px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
        .exp-actions { display: flex; gap: 8px; }
        .edit-exp { background: rgba(255, 255, 255, 0.05); color: var(--text-secondary); width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--glass-border); }
        .edit-exp:hover { background: var(--primary); color: white; border-color: var(--primary); }
        .delete-exp { background: rgba(255, 71, 87, 0.1); color: #ff4757; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .delete-exp:hover { background: #ff4757; color: white; }
        .exp-card h3 { font-size: 1.4rem; font-weight: 700; margin: 0 0 10px 0; }
        .exp-card p { color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5; margin-bottom: 20px; min-height: 45px; }
        .exp-footer { margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px dashed var(--glass-border); display: flex; justify-content: space-between; align-items: center; }
        .exp-price { font-size: 1.5rem; font-weight: 800; color: var(--text-primary); }
        .exp-limit-badge { font-size: 0.8rem; color: var(--text-secondary); background: rgba(255,255,255,0.05); padding: 4px 12px; border-radius: 20px; border: 1px solid var(--glass-border); }
        .view-slots { background: rgba(218, 165, 32, 0.1); color: #DAA520; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(218, 165, 32, 0.2); }
        .view-slots:hover { background: #DAA520; color: white; }


        .exp-modal { width: 100%; max-width: 480px; height: 100vh; padding: 60px 40px; border-radius: 0; position: relative; overflow-y: auto; scrollbar-width: thin; scrollbar-color: var(--primary) transparent; }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; display: flex; justify-content: center; align-items: flex-start; z-index: 2000; }
        .exp-modal::-webkit-scrollbar { width: 6px; }
        .exp-modal::-webkit-scrollbar-thumb { background: var(--primary); border-radius: 10px; }
        .modal-header-text { margin-bottom: 30px; }
        .modal-header-text h3 { font-size: 1.6rem; margin-bottom: 6px; }
        .modal-header-text p { color: var(--text-secondary); font-size: 0.9rem; }
        .modal-actions { display: flex; gap: 14px; margin-top: 30px; }
        .modal-actions button { flex: 1; padding: 14px; border-radius: 12px; font-weight: 700; font-size: 1rem; }
        .cancel-btn { background: rgba(255,255,255,0.05); color: var(--text-secondary); border: 1px solid var(--glass-border); }
        .save-btn { background: var(--primary); color: white; }
        select { width: 100%; padding: 12px 16px; background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); border-radius: 10px; color: white; outline: none; margin-bottom: 10px; -webkit-appearance: none; }

        .slots-modal { width: 100%; height: 100vh; max-width: none; max-height: none; padding: 40px; border-radius: 0; overflow-y: auto; background: #121417; border: none; display: flex; flex-direction: column; }
        .slots-grid-view { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 16px; margin-bottom: 30px; }
        .slot-item { background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-radius: 12px; padding: 12px; display: flex; flex-direction: column; text-align: center; transition: 0.2s; }
        .slot-item:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.2); }
        .slot-item.full { border-color: rgba(255, 71, 87, 0.3); background: rgba(255, 71, 87, 0.05); }
        
        .slot-date-header { display: flex; flex-direction: column; margin-bottom: 12px; }
        .s-day { color: var(--primary); font-size: 0.75rem; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; }
        .s-date { font-size: 1.8rem; font-weight: 800; line-height: 1; margin: 4px 0; }
        .s-month { color: var(--text-secondary); font-size: 0.8rem; }
        
        .slot-stats-row { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
        .stat-pill { display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.2); padding: 4px 8px; border-radius: 6px; font-size: 0.75rem; }
        .stat-pill span { color: var(--text-secondary); }
        .stat-pill.booking strong { color: white; }
        .stat-pill.available strong { color: #4CAF50; }
        .slot-item.full .stat-pill.available strong { color: #ff4757; }
        
        .capacity-bar { height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden; width: 100%; }
        .c-fill { height: 100%; transition: width 0.3s ease; }
        
        .close-slots-btn { margin-top: auto; align-self: flex-end; padding: 10px 24px; background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); color: white; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; }
        .close-slots-btn:hover { background: var(--primary); border-color: var(--primary); }

        /* Scanner Styles */
        .scanner-container-full { position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background: #0f1113; z-index: 3000; padding: 40px; overflow-y: auto; overflow-x: hidden; }
        .exit-scanner-btn { position: absolute; top: 20px; right: 40px; display: flex; align-items: center; gap: 8px; color: var(--text-secondary); background: rgba(255,255,255,0.05); padding: 10px 20px; border-radius: 12px; border: 1px solid var(--glass-border); z-index: 3100; }
        .exit-scanner-btn:hover { color: #ff4757; border-color: #ff4757; }
        .scanner-layout { display: flex; justify-content: center; max-width: 800px; margin: 40px auto; }
        .scanner-viewport { width: 100%; padding: 35px; border-radius: 24px; }
        .scanner-file-upload { margin-top: 30px; text-align: center; }
        .divider-text { color: var(--text-secondary); font-size: 0.7rem; font-weight: 800; margin-bottom: 20px; display: flex; align-items: center; gap: 15px; }
        .divider-text::before, .divider-text::after { content: ''; flex: 1; height: 1px; background: var(--glass-border); }
        .file-upload-label { display: flex; align-items: center; justify-content: center; gap: 10px; background: rgba(255,255,255,0.05); border: 1px dashed var(--glass-border); padding: 15px; border-radius: 12px; cursor: pointer; transition: 0.3s; color: var(--text-secondary); }
        .file-upload-label:hover { background: rgba(255,255,255,0.1); border-color: var(--primary); color: white; }
        .scanner-header { display: flex; align-items: center; gap: 12px; margin-bottom: 25px; }
        #reader { border: none !important; background: #000; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        #reader img[alt="Info icon"], #reader img[src*="info"] { display: none !important; }
        #reader__scan_region { background: #000; }
        #reader__dashboard_section_csr button { background: var(--primary); color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 700; margin-top: 10px; }
        .scanner-hint { text-align: center; color: var(--text-secondary); font-size: 0.85rem; margin-top: 20px; }
        
        .scanner-config { margin-bottom: 24px; padding: 15px; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid var(--glass-border); }
        .scanner-config label { display: block; font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 8px; font-weight: 600; text-transform: uppercase; }
        .target-exp-select { width: 100%; padding: 10px; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); color: white; border-radius: 8px; outline: none; }

        /* Full Screen Popup Styles */
        .scan-result-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: #0f1113; z-index: 4000; overflow-y: auto; }
        .result-modal { width: 100%; min-height: 100vh; padding: 60px 40px; border-top: 8px solid #4CAF50; border-radius: 0; display: flex; flex-direction: column; max-width: none; background: transparent; }
        .result-modal.error { border-top-color: #ff4757; }
        .result-header { display: flex; align-items: center; gap: 20px; margin-bottom: 30px; }
        .bp-id { color: var(--primary); font-family: monospace; font-weight: 800; font-size: 1rem; }
        .visitor-meta { margin-bottom: 25px; }
        .v-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--glass-border); }
        .v-row span { color: var(--text-secondary); font-size: 0.85rem; }
        .v-row strong { color: white; font-size: 0.95rem; }
        .exp-details-box { background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; margin-bottom: 30px; display: flex; gap: 12px; border: 1px solid var(--glass-border); }
        .exp-details-box p { font-size: 0.85rem; margin: 0; color: var(--text-secondary); line-height: 1.5; }

        .guest-details-verification { background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); border-radius: 12px; padding: 15px; margin-bottom: 25px; }
        .guest-details-verification h5 { font-size: 0.75rem; color: var(--primary); text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px; }
        .guest-v-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .guest-v-row:last-child { border-bottom: none; }
        .g-name { color: white; font-size: 0.85rem; font-weight: 600; }
        .g-meta { color: var(--text-secondary); font-size: 0.8rem; }
        .reset-scan { width: 100%; background: var(--primary); color: white; padding: 18px; border-radius: 12px; font-weight: 700; border: none; cursor: pointer; transition: 0.3s; margin-top: auto; font-size: 1.1rem; }
        .reset-scan:hover { filter: brightness(1.1); transform: translateY(-2px); }
        .reset-scan.error-btn { background: #ff4757; }
        
        .error-result { text-align: center; flex: 1; display: flex; flex-direction: column; justify-content: center; }
        .error-result h4 { color: #ff4757; font-size: 1.8rem; margin: 30px 0 15px; }
        .error-result p { color: var(--text-secondary); margin-bottom: 40px; font-size: 1.1rem; }

        @media (max-width: 768px) {
            .admin-container { padding: 80px 15px 40px; }
            .admin-header h1 { font-size: 1.8rem; }
            .admin-tabs { width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: none; border: none; padding: 0; }
            .admin-tabs button { width: 100%; padding: 12px 5px; font-size: 0.8rem; background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); }
            .admin-tabs button:nth-child(3) { grid-column: span 2; }
            .stats-grid { grid-template-columns: 1fr; }
            .exp-grid { grid-template-columns: 1fr; }
            .exp-card { padding: 20px; }
            .management-header { flex-direction: column; gap: 15px; align-items: flex-start; }
            .add-exp-btn { width: 100%; justify-content: center; }
            
            .scanner-container-full { padding: 10px; padding-top: 70px; }
            .scanner-layout { width: 100%; margin: 0; display: block; }
            .scanner-viewport { padding: 20px; width: 100%; box-sizing: border-box; border-radius: 16px; }
            #reader { width: 100% !important; overflow: hidden; }
            #reader video { width: 100% !important; height: auto !important; object-fit: cover; }
            
            .exit-scanner-btn { top: 10px; right: 10px; font-size: 0.8rem; padding: 6px 12px; }
            
            .admin-page { overflow-x: hidden; width: 100%; }
            .logout-btn-text { display: none; }
            .result-modal { padding: 80px 20px 40px; }
            .result-header h4 { font-size: 1.5rem; }
            .v-row { padding: 15px 0; }
            .reset-scan { padding: 20px; font-size: 1rem; }
        }
      `}} />
    </div>
  )
}

export default Admin
