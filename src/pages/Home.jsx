import React from 'react'
import { motion } from 'framer-motion'
import { Ticket, ArrowRight, Clock, ShieldCheck, Globe } from 'lucide-react'

const Home = () => {
  return (
    <div className="home-container">
      <section className="hero-section">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="hero-content"
        >
          <h1>Experience History in <span className="highlight">Gold</span></h1>
          <p>Book your journey through time with our AI-powered concierge. Instant, effortless, and premium.</p>
          <div className="hero-btns">
            <button className="btn-primary" onClick={() => document.getElementById('chat-toggle').click()}>
              Book Now <ArrowRight size={18} />
            </button>
          </div>
        </motion.div>
        <div className="hero-image-container">
          {/* Placeholder for the premium image */}
          <div className="hero-overlay"></div>
        </div>
      </section>

      <section className="features-section" id="exhibits">
        <h2>Why Choose Museum?</h2>
        <div className="features-grid">
          <div className="feature-card glass-morphism">
            <Globe className="feature-icon" />
            <h3>Multilingual</h3>
            <p>Our chatbot speaks 50+ languages to assist you globally.</p>
          </div>
          <div className="feature-card glass-morphism">
            <Clock className="feature-icon" />
            <h3>No Queues</h3>
            <p>Instant digital delivery. Skip the wait and enter directly.</p>
          </div>
          <div className="feature-card glass-morphism">
            <ShieldCheck className="feature-icon" />
            <h3>Secure Payments</h3>
            <p>Integrated payment gateway for a seamless human-free experience.</p>
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{
        __html: `
        .home-container {
          padding-top: 100px;
        }
        .hero-section {
          min-height: 90vh;
          display: flex;
          align-items: center;
          padding: 0 10%;
          position: relative;
          overflow: hidden;
        }
        .hero-content {
          max-width: 600px;
          z-index: 2;
        }
        .hero-content h1 {
          font-size: 4.5rem;
          line-height: 1.1;
          margin-bottom: 24px;
          font-weight: 800;
        }
        .highlight {
          color: var(--primary);
        }
        .hero-content p {
          font-size: 1.25rem;
          color: var(--text-secondary);
          margin-bottom: 40px;
        }
        .hero-btns {
          display: flex;
          gap: 16px;
        }
        .btn-primary {
          background: var(--primary);
          color: white;
          padding: 16px 32px;
          border-radius: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1.1rem;
        }
        .btn-primary:hover {
          background: var(--primary-hover);
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(218, 165, 32, 0.3);
        }
        .btn-secondary {
          background: transparent;
          color: white;
          padding: 16px 32px;
          border-radius: 12px;
          border: 1px solid var(--glass-border);
          font-weight: 600;
          font-size: 1.1rem;
        }
        .btn-secondary:hover {
          background: var(--glass);
        }
        .hero-image-container {
          position: absolute;
          right: 0;
          top: 0;
          width: 50%;
          height: 100%;
          background: url('https://images.unsplash.com/photo-1544601285-ad8c1dec695b?q=80&w=2070&auto=format&fit=crop') center/cover no-repeat;
          z-index: 1;
          clip-path: polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%);
        }
        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, var(--bg-dark) 0%, transparent 50%);
        }
        .features-section {
          padding: 100px 10%;
          text-align: center;
        }
        .features-section h2 {
          font-size: 2.5rem;
          margin-bottom: 60px;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
        }
        .feature-card {
          padding: 40px;
          text-align: left;
          transition: 0.3s;
        }
        .feature-card:hover {
          border-color: var(--primary);
          transform: translateY(-5px);
        }
        .feature-icon {
          color: var(--primary);
          margin-bottom: 24px;
          width: 48px;
          height: 48px;
        }
        .feature-card h3 {
          margin-bottom: 16px;
          font-size: 1.5rem;
        }
        .feature-card p {
          color: var(--text-secondary);
          line-height: 1.6;
        }
        @media (max-width: 768px) {
           .hero-section {
             flex-direction: column;
             justify-content: center;
             text-align: center;
             padding: 100px 20px;
           }
           .hero-content h1 {
             font-size: 2.5rem;
           }
           .hero-btns {
             flex-direction: column;
             width: 100%;
             max-width: 400px;
             margin: 0 auto;
           }
           .hero-btns button {
             width: 100%;
             justify-content: center;
           }
           .hero-image-container {
             position: relative;
             width: 100%;
             height: 300px;
             clip-path: none;
             margin-top: 50px;
           }
           .hero-overlay {
             background: linear-gradient(to top, var(--bg-dark) 0%, transparent 100%);
           }
        }
      `}} />
    </div>
  )
}

export default Home
