import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { Clock, Calendar, Ticket, CreditCard, ChevronRight, Landmark, Loader2 } from 'lucide-react'
import axios from 'axios'

import API_BASE_URL from '../config'

const History = ({ user }) => {
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedBooking, setSelectedBooking] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const location = useLocation()

    useEffect(() => {
        if (user?.uid) {
            fetchHistory()
        }
    }, [user, location.search])

    const fetchHistory = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/bookings/${user.uid}`)
            if (res.data.success) {
                // Sort bookings by creation date descending (assuming _id or createdAt)
                const sortedBookings = res.data.bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                setBookings(sortedBookings)

                // Check for new booking param
                const searchParams = new URLSearchParams(location.search)
                if (searchParams.get('new_booking') === 'true' && sortedBookings.length > 0) {
                    setSelectedBooking(sortedBookings[0])
                    setIsModalOpen(true)
                    // Clear the param without reloading
                    window.history.replaceState({}, '', '/history')
                }
            }
        } catch (err) {
            console.error("Failed to fetch history", err)
        } finally {
            setLoading(false)
        }
    }

    if (!user) {
        return (
            <div className="history-page">
                <div className="empty-state">
                    <Landmark size={64} color="var(--primary)" />
                    <h2>Please Sign In</h2>
                    <p>You need to be logged in to view your booking history.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="history-page">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="history-container"
            >
                <header className="history-header">
                    <div className="title-area">
                        <Clock size={32} color="var(--primary)" />
                        <h1>My Journeys</h1>
                    </div>
                    <p>Manage your museum experiences and digital tickets</p>
                </header>

                {loading ? (
                    <div className="loading-state">
                        <Loader2 className="animate-spin" size={48} color="var(--primary)" />
                        <p>Loading your history...</p>
                    </div>
                ) : bookings.length > 0 ? (
                    <div className="bookings-grid">
                        {bookings.map((booking, index) => (
                            <motion.div
                                key={booking._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="history-card glass-morphism"
                                onClick={() => { setSelectedBooking(booking); setIsModalOpen(true); }}
                            >
                                <div className="card-accent" />
                                <div className="card-top">
                                    <div className="ticket-id">
                                        <Ticket size={18} color="var(--primary)" />
                                        <span>#{booking.bookingId}</span>
                                    </div>
                                    <span className="status-badge">{booking.status}</span>
                                </div>

                                <div className="card-body">
                                    <h3>{booking.ticketType}</h3>
                                    <div className="meta-info">
                                        <div className="meta-item">
                                            <Calendar size={16} />
                                            <span>{booking.date}</span>
                                        </div>
                                        <div className="meta-item">
                                            <CreditCard size={16} />
                                            <span>₹{booking.totalAmount} • {booking.quantity} Tickets</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-footer">
                                    <div className="payment-details">
                                        <p>Transaction: <span>{booking.paymentId?.substring(0, 15)}...</span></p>
                                    </div>
                                    <div className="view-details">
                                        <span>View Ticket</span>
                                        <ChevronRight size={16} />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <Landmark size={64} className="opacity-20" />
                        <h2>No Bookings Found</h2>
                        <p>When you book a ticket through our concierge, it will appear here.</p>
                    </div>
                )}
            </motion.div>

            <AnimatePresence>
                {isModalOpen && selectedBooking && (
                    <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="ticket-popup glass-morphism"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="ticket-visual">
                                <div className="ticket-top-section">
                                    <div className="museum-logo">
                                        <Landmark size={24} color="#DAA520" />
                                        <span>MUSEUM</span>
                                    </div>
                                    <div className="ticket-status-pill">{selectedBooking.status}</div>
                                </div>

                                <div className="ticket-main-info">
                                    <h2 className="ticket-type-title">{selectedBooking.ticketType}</h2>
                                    <p className="ticket-subtitle">Official Digital Entry Pass</p>

                                    <div className="ticket-details-grid">
                                        <div className="detail-item">
                                            <span className="detail-label">VISITOR</span>
                                            <span className="detail-value">{selectedBooking.visitorName || user.displayName}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">DATE</span>
                                            <span className="detail-value">{selectedBooking.date}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">GUESTS</span>
                                            <span className="detail-value">{selectedBooking.quantity} Persons</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">PRICE</span>
                                            <span className="detail-value">₹{selectedBooking.totalAmount}</span>
                                        </div>
                                    </div>

                                    {selectedBooking.guestDetails && selectedBooking.guestDetails.length > 0 && (
                                        <div className="guest-details-panel">
                                            <span className="detail-label">GUEST MANIFEST</span>
                                            <div className="guest-scroll-area">
                                                {selectedBooking.guestDetails.map((g, idx) => (
                                                    <div key={idx} className="guest-entry">
                                                        <span className="ge-name">{g.name}</span>
                                                        <span className="ge-meta">{g.gender} • {g.age} yrs</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="ticket-divider">
                                    <div className="divider-circle left"></div>
                                    <div className="divider-line"></div>
                                    <div className="divider-circle right"></div>
                                </div>

                                <div className="ticket-qr-section">
                                    <div className="qr-container">
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${selectedBooking.bookingId}`}
                                            alt="Ticket QR Code"
                                            className="qr-image"
                                        />
                                    </div>
                                    <div className="qr-info">
                                        <p className="booking-id-text">PASS ID: {selectedBooking.bookingId}</p>
                                        <p className="verify-note">Admin: Scan to identify & verify</p>
                                    </div>
                                </div>
                            </div>

                            <div className="popup-actions">
                                <button className="close-popup-btn" onClick={() => setIsModalOpen(false)}>Close Pass</button>
                                <button className="download-btn" onClick={() => window.print()}>
                                    <Ticket size={18} />
                                    <span>Download PDF</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style dangerouslySetInnerHTML={{
                __html: `
                .history-page {
                    padding: 120px 20px 60px;
                    min-height: 100vh;
                    background: #0a0c0f;
                }
                .history-container {
                    max-width: 1000px;
                    margin: 0 auto;
                }
                .history-header {
                    margin-bottom: 50px;
                    text-align: center;
                }
                .title-area {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 15px;
                    margin-bottom: 10px;
                }
                .history-header h1 {
                    font-size: 2.5rem;
                    font-weight: 800;
                    letter-spacing: -1px;
                    margin: 0;
                }
                .history-header p {
                    color: var(--text-secondary);
                    font-size: 1.1rem;
                }
                .bookings-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
                    gap: 24px;
                }
                .history-card {
                    position: relative;
                    padding: 30px;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    overflow: hidden;
                    transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                }
                .history-card:hover {
                    transform: translateY(-5px);
                    border-color: rgba(218, 165, 32, 0.4);
                }
                .card-accent {
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 100px;
                    height: 100px;
                    background: radial-gradient(circle at top right, rgba(218, 165, 32, 0.1), transparent);
                    pointer-events: none;
                }
                .card-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .ticket-id {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-family: monospace;
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                    background: rgba(255,255,255,0.05);
                    padding: 4px 10px;
                    border-radius: 6px;
                }
                .status-badge {
                    background: rgba(218, 165, 32, 0.1);
                    color: var(--primary);
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .card-body h3 {
                    font-size: 1.5rem;
                    margin: 0 0 10px 0;
                    font-weight: 700;
                }
                .meta-info {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .meta-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: var(--text-secondary);
                    font-size: 0.95rem;
                }
                .card-footer {
                    margin-top: 10px;
                    padding-top: 20px;
                    border-top: 1px solid var(--glass-border);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .payment-details p {
                    margin: 0;
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                }
                .payment-details span {
                    color: var(--text-primary);
                    font-family: monospace;
                }
                .view-details {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    color: var(--primary);
                    font-weight: 600;
                    font-size: 0.9rem;
                    cursor: pointer;
                }
                .empty-state, .loading-state {
                    text-align: center;
                    padding: 100px 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 20px;
                }
                .opacity-20 { opacity: 0.2; }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                @media (max-width: 600px) {
                    .bookings-grid {
                        grid-template-columns: 1fr;
                    }
                    .history-card {
                        padding: 20px;
                    }
                    .history-header h1 {
                        font-size: 1.8rem;
                    }
                    .modal-overlay { padding: 0; }
                    .ticket-popup { 
                        max-width: none; 
                        width: 100%; 
                        height: 100%; 
                        max-height: 100vh; 
                        border-radius: 0; 
                        display: flex;
                        flex-direction: column;
                    }
                    .ticket-visual { padding: 20px; }
                    .popup-actions { padding: 20px; margin-top: auto; }
                    .ticket-details-grid { gap: 10px; }
                }

                /* Ticket Popup Styles */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    left: 0;
                    background: rgba(0,0,0,0.85);
                    backdrop-filter: blur(10px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    z-index: 2000;
                }
                .ticket-popup {
                    width: 100%;
                    max-width: 400px;
                    max-height: 90vh;
                    border-radius: 20px;
                    padding: 0;
                    overflow-y: auto;
                    box-shadow: 0 30px 60px rgba(0,0,0,0.5);
                    background: var(--bg-card);
                }
                /* Hide scrollbar for Chrome, Safari and Opera */
                .ticket-popup::-webkit-scrollbar { display: none; }
                /* Hide scrollbar for IE, Edge and Firefox */
                .ticket-popup {
                    -ms-overflow-style: none;  /* IE and Edge */
                    scrollbar-width: none;  /* Firefox */
                }
                .ticket-visual {
                    background: #fff;
                    color: #121417;
                    padding: 30px;
                }
                .ticket-top-section {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 25px;
                }
                .museum-logo {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 800;
                    font-size: 0.9rem;
                    letter-spacing: 1px;
                }
                .ticket-status-pill {
                    background: #f0f0f0;
                    color: #4CAF50;
                    font-size: 0.7rem;
                    font-weight: 800;
                    padding: 4px 10px;
                    border-radius: 30px;
                    text-transform: uppercase;
                }
                .ticket-type-title {
                    font-size: 1.8rem;
                    font-weight: 800;
                    margin: 0;
                    line-height: 1.1;
                }
                .ticket-subtitle {
                    color: #666;
                    font-size: 0.8rem;
                    margin: 5px 0 25px;
                    font-weight: 500;
                }
                .ticket-details-grid {
                    display: grid;
                    grid-template-columns: 1fr 1.5fr;
                    gap: 15px;
                }
                .detail-item {
                    display: flex;
                    flex-direction: column;
                }
                .detail-label {
                    font-size: 0.65rem;
                    font-weight: 700;
                    color: #999;
                    letter-spacing: 0.5px;
                    margin-bottom: 2px;
                }
                .detail-value {
                    font-size: 0.9rem;
                    font-weight: 800;
                    color: #121417;
                }
                
                .ticket-divider {
                    position: relative;
                    margin: 25px -30px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                }
                .divider-line {
                    width: 100%;
                    border-top: 2px dashed #eee;
                }
                .divider-circle {
                    position: absolute;
                    width: 25px;
                    height: 25px;
                    background: rgba(0,0,0,0.85); /* Matches overlay background */
                    border-radius: 50%;
                }
                .divider-circle.left { left: -12.5px; }
                .divider-circle.right { right: -12.5px; }

                .ticket-qr-section {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    margin-top: 5px;
                }
                .qr-container {
                    position: relative;
                    padding: 10px;
                    background: #fff;
                    border-radius: 12px;
                    border: 1px solid #eee;
                    margin-bottom: 15px;
                }
                .qr-image {
                    width: 140px;
                    height: 140px;
                    display: block;
                }
                .booking-id-text {
                    font-family: monospace;
                    font-weight: 800;
                    font-size: 0.9rem;
                    margin: 0;
                }
                .verify-note {
                    font-size: 0.65rem;
                    color: #999;
                    margin: 5px 0 0;
                    font-weight: 600;
                }

                .guest-details-panel {
                    margin-top: 25px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                }
                .guest-scroll-area {
                    margin-top: 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .guest-entry {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 12px;
                    background: #f8f8f8;
                    border-radius: 8px;
                }
                .ge-name {
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: #121417;
                }
                .ge-meta {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: #666;
                }

                .popup-actions {
                    padding: 20px;
                    display: flex;
                    gap: 12px;
                }
                .popup-actions button {
                    flex: 1;
                    padding: 12px;
                    border-radius: 12px;
                    font-weight: 700;
                    font-size: 0.9rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: 0.2s;
                }
                .close-popup-btn {
                    background: rgba(255,255,255,0.05);
                    color: #fff;
                    border: 1px solid var(--glass-border);
                }
                .close-popup-btn:hover { background: rgba(255,255,255,0.1); }
                .download-btn {
                    background: var(--primary);
                    color: #fff;
                    border: none;
                }
                .download-btn:hover { filter: brightness(1.1); }

                @media print {
                    body * { visibility: hidden; }
                    .ticket-popup, .ticket-popup * { visibility: visible; }
                    .ticket-popup { position: absolute; left: 0; top: 0; width: 100%; max-width: none; }
                    .popup-actions { display: none; }
                }
            `}} />
        </div>
    )
}

export default History
