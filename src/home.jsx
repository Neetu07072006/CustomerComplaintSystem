import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css'; // Make sure this points to your existing CSS file

function Home() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('User Input Submitted:', formData);
    alert('Thank you! Your request has been received.');
    setFormData({ name: '', email: '', company: '', message: '' });
  };

  return (
    <div className="app-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">
          <div className="shield-icon">🛡️</div>
          <span>ResolveAI</span>
        </div>
        <div className="nav-links">
          <a href="#problem">The Problem</a>
          <a href="#workflow">Workflow</a>
          <a href="#architecture">Architecture</a>
          <a href="#demo">Live Demo</a>
        </div>
        <button 
          className="btn-secondary nav-btn"
          onClick={() => navigate('/prototype')}
        >
          View Prototype
        </button>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="badge">
          ⚡ Microsoft Automate India Hackathon Project
        </div>
        <h1 className="hero-title">
          Governed Autonomous AI for <br />
          <span className="text-gradient">End-to-End Complaint <br/> Resolution</span>
        </h1>
        <p className="hero-subtitle">
          Shifting the paradigm from "<strong>AI that answers</strong>" to "<strong>AI that resolves.</strong>"
        </p>
        <div className="hero-buttons">
          <button 
            className="btn-primary"
            onClick={() => navigate('/prototype')}
          >
            Explore Live Prototype →
          </button>
          <a href="#architecture" className="btn-outline" style={{ textDecoration: 'none', display: 'inline-block', lineHeight: 'normal' }}>
            System Architecture
          </a>
        </div>
      </section>

      {/* Operational Gap Section */}
      <section className="section" id="problem">
        <h2 className="section-title">The Operational Gap in Customer Support</h2>
        <p className="section-subtitle">
          Customer complaints are increasingly unstructured and evidence-rich, yet workflows remain dependent on manual intervention.
        </p>
        
        <div className="card-grid-3">
          <div className="card">
            <div className="icon red-icon">⚠️</div>
            <h3>Incomplete Workflows</h3>
            <p>Traditional ticketing systems and bots identify or route problems, but fail to autonomously complete the execution pipeline.</p>
          </div>
          <div className="card">
            <div className="icon yellow-icon">⚖️</div>
            <h3>Governance Deficit</h3>
            <p>While LLMs possess immense reasoning capabilities, enterprise operations require strict, risk-aware human governance before executing actions.</p>
          </div>
          <div className="card">
            <div className="icon blue-icon">🚫</div>
            <h3>Zero Traceability</h3>
            <p>Organizations lack a unified audit trail that seamlessly connects AI reasoning directly to approval actions and backend execution.</p>
          </div>
        </div>
      </section>

      {/* ResolveAI Engine Section */}
      <section className="section" id="architecture">
        <h2 className="section-title">The ResolveAI Engine</h2>
        <p className="section-subtitle">
          An intelligent end-to-end framework translating unstructured complaints into validated business actions.
        </p>

        <div className="card-grid-3">
          <div className="card engine-card">
            <span className="step-label">01 / UNDERSTAND</span>
            <h3>Intelligent Intake</h3>
            <p>Interprets unstructured and multilingual customer complaints with high semantic accuracy via webhook or email ingestion.</p>
          </div>
          <div className="card engine-card">
            <span className="step-label">02 / INVESTIGATE</span>
            <h3>Evidence & Policy Analysis</h3>
            <p>Correlates customer data, attached invoices/images, historical evidence, and dynamically retrieves relevant business policies.</p>
          </div>
          <div className="card engine-card">
            <span className="step-label">03 / RECOMMEND</span>
            <h3>Explainable Strategy</h3>
            <p>Generates a fully compliant, logical, and transparent resolution strategy paired with risk assessments.</p>
          </div>
          <div className="card engine-card">
            <span className="step-label">04 / GOVERN</span>
            <h3>Human-in-the-Loop</h3>
            <p>Automatically flags ambiguous or high-risk cases, routing consequential decisions for manager approval via Notion.</p>
          </div>
          <div className="card engine-card">
            <span className="step-label">05 / EXECUTE</span>
            <h3>Autonomous Actions</h3>
            <p>Performs approved business actions, processes refunds/replacements, and delivers instant customer notifications.</p>
          </div>
          <div className="card engine-card">
            <span className="step-label audit-label">06 / AUDIT</span>
            <h3 className="audit-title">Immutable Run Log</h3>
            <p>Automatically archives decisions, approvals, and system changes into a chronological audit trail for total compliance.</p>
          </div>
        </div>
      </section>

      {/* User Input Form Section */}
      <section className="section form-section" id="demo">
        <h2 className="section-title">Request a Custom Demo</h2>
        <p className="section-subtitle">Enter your details below to see how ResolveAI can handle your specific workflow.</p>
        
        <form onSubmit={handleSubmit} className="input-form">
          <div className="form-group">
            <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <input type="email" name="email" placeholder="Work Email" value={formData.email} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <input type="text" name="company" placeholder="Company Name" value={formData.company} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <textarea name="message" placeholder="Tell us about your current support challenges..." value={formData.message} onChange={handleInputChange} rows="4" required></textarea>
          </div>
          <button type="submit" className="btn-primary form-submit">Submit Request</button>
        </form>
      </section>
    </div>
  );
}

export default Home;